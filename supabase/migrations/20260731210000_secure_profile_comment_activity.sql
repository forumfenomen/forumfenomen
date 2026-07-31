begin;

create or replace view public.public_profiles
with (security_barrier = true)
as
select
  profile_data.id,
  profile_data.display_name,
  profile_data.username,
  profile_data.avatar_url,

  case
    when access_data.can_view_profile_details
      then profile_data.bio
    else null::text
  end as bio,

  case
    when access_data.can_view_profile_details
      then profile_data.interests
    else null::text[]
  end as interests,

  profile_data.created_at,
  profile_data.profile_visibility,
  profile_data.followers_visibility,
  profile_data.following_visibility,
  profile_data.comments_visibility,
  profile_data.likes_visibility,

  case
    when profile_data.role = 'admin'
      then 'admin'::text
    when profile_data.role = 'moderator'
      then 'moderator'::text
    else 'user'::text
  end as role

from public.profiles profile_data

cross join lateral (
  select
    auth.role() = 'service_role'

    or profile_data.id = auth.uid()

    or exists (
      select 1
      from public.profiles viewer_profile
      where viewer_profile.id = auth.uid()
        and viewer_profile.account_status = 'active'
        and viewer_profile.role in (
          'admin',
          'moderator'
        )
    )

    or profile_data.profile_visibility = 'public'

    or (
      profile_data.profile_visibility = 'followers'
      and exists (
        select 1
        from public.user_follows follow_data
        where follow_data.follower_id = auth.uid()
          and follow_data.following_id =
            profile_data.id
      )
    )

    or (
      profile_data.profile_visibility = 'following'
      and exists (
        select 1
        from public.user_follows follow_data
        where follow_data.follower_id =
          profile_data.id
          and follow_data.following_id =
            auth.uid()
      )
    ) as can_view_profile_details
) access_data

where profile_data.account_status = 'active'
  and (
    auth.role() = 'service_role'

    or exists (
      select 1
      from public.profiles viewer_profile
      where viewer_profile.id = auth.uid()
        and viewer_profile.account_status = 'active'
    )
  );

revoke all
on table public.public_profiles
from public, anon;

grant select
on table public.public_profiles
to authenticated, service_role;


create or replace function
  public.get_profile_comment_activity(
    p_profile_id uuid
  )
returns table (
  comment_count bigint,
  can_view_comments boolean,
  comments jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_viewer_id uuid := auth.uid();

  v_is_service_role boolean :=
    auth.role() = 'service_role';

  v_is_moderator_or_admin boolean := false;

  v_comments_visibility text;

  v_is_following boolean := false;

  v_owner_follows_current_user boolean := false;

  v_can_view_comments boolean := false;
begin
  if not v_is_service_role then
    if v_viewer_id is null then
      raise exception 'UNAUTHENTICATED';
    end if;

    if not exists (
      select 1
      from public.profiles viewer_profile
      where viewer_profile.id = v_viewer_id
        and viewer_profile.account_status = 'active'
    ) then
      raise exception 'ACCOUNT_NOT_ACTIVE';
    end if;
  end if;

  select target_profile.comments_visibility
  into v_comments_visibility
  from public.profiles target_profile
  where target_profile.id = p_profile_id
    and target_profile.account_status = 'active';

  if not found then
    return;
  end if;

  if not v_is_service_role then
    v_is_moderator_or_admin :=
      public.is_moderator_or_admin();
  end if;

  if v_viewer_id is not null then
    select exists (
      select 1
      from public.user_follows follow_data
      where follow_data.follower_id = v_viewer_id
        and follow_data.following_id = p_profile_id
    )
    into v_is_following;

    select exists (
      select 1
      from public.user_follows follow_data
      where follow_data.follower_id = p_profile_id
        and follow_data.following_id = v_viewer_id
    )
    into v_owner_follows_current_user;
  end if;

  v_can_view_comments :=
    v_is_service_role
    or v_is_moderator_or_admin
    or v_viewer_id = p_profile_id
    or v_comments_visibility = 'public'
    or (
      v_comments_visibility = 'followers'
      and v_is_following
    )
    or (
      v_comments_visibility = 'following'
      and v_owner_follows_current_user
    );

  return query
  select
    (
      select count(*)::bigint
      from public.topic_comments comment_data

      join public.topics topic_data
        on topic_data.id = comment_data.topic_id
       and topic_data.status = 'published'

      where comment_data.author_id = p_profile_id
        and comment_data.status = 'published'
    ) as comment_count,

    v_can_view_comments as can_view_comments,

    case
      when v_can_view_comments then
        coalesce(
          (
            select jsonb_agg(
              ordered_comments.payload
              order by ordered_comments.created_at desc
            )
            from (
              select
                comment_data.created_at,

                jsonb_build_object(
                  'id',
                  comment_data.id,

                  'content',
                  comment_data.content,

                  'created_at',
                  comment_data.created_at,

                  'topic_id',
                  comment_data.topic_id,

                  'topics',
                  jsonb_build_object(
                    'id',
                    topic_data.id,

                    'title',
                    topic_data.title,

                    'status',
                    topic_data.status
                  )
                ) as payload

              from public.topic_comments comment_data

              join public.topics topic_data
                on topic_data.id =
                  comment_data.topic_id
               and topic_data.status =
                  'published'

              where comment_data.author_id =
                p_profile_id

                and comment_data.status =
                  'published'

              order by comment_data.created_at desc

              limit 50
            ) ordered_comments
          ),
          '[]'::jsonb
        )
      else
        '[]'::jsonb
    end as comments;
end;
$function$;

revoke execute
on function
  public.get_profile_comment_activity(uuid)
from public, anon;

grant execute
on function
  public.get_profile_comment_activity(uuid)
to authenticated, service_role;

commit;
