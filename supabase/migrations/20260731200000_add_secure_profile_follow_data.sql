begin;

create or replace function public.get_profile_follow_data(
  p_profile_id uuid
)
returns table (
  follower_count bigint,
  following_count bigint,
  is_following boolean,
  owner_follows_current_user boolean,
  can_view_followers boolean,
  can_view_following boolean,
  followers jsonb,
  following_users jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_viewer_id uuid := auth.uid();

  v_followers_visibility text;
  v_following_visibility text;

  v_is_service_role boolean :=
    auth.role() = 'service_role';

  v_is_moderator_or_admin boolean := false;

  v_is_following boolean := false;
  v_owner_follows_current_user boolean := false;

  v_can_view_followers boolean := false;
  v_can_view_following boolean := false;
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

  select
    target_profile.followers_visibility,
    target_profile.following_visibility
  into
    v_followers_visibility,
    v_following_visibility
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

  v_can_view_followers :=
    v_is_service_role
    or v_is_moderator_or_admin
    or v_viewer_id = p_profile_id
    or v_followers_visibility = 'public'
    or (
      v_followers_visibility = 'followers'
      and v_is_following
    )
    or (
      v_followers_visibility = 'following'
      and v_owner_follows_current_user
    );

  v_can_view_following :=
    v_is_service_role
    or v_is_moderator_or_admin
    or v_viewer_id = p_profile_id
    or v_following_visibility = 'public'
    or (
      v_following_visibility = 'followers'
      and v_is_following
    )
    or (
      v_following_visibility = 'following'
      and v_owner_follows_current_user
    );

  return query
  select
    (
      select count(*)::bigint
      from public.user_follows follow_data
      join public.profiles follower_profile
        on follower_profile.id =
          follow_data.follower_id
       and follower_profile.account_status = 'active'
      where follow_data.following_id = p_profile_id
    ) as follower_count,

    (
      select count(*)::bigint
      from public.user_follows follow_data
      join public.profiles following_profile
        on following_profile.id =
          follow_data.following_id
       and following_profile.account_status = 'active'
      where follow_data.follower_id = p_profile_id
    ) as following_count,

    v_is_following as is_following,

    v_owner_follows_current_user
      as owner_follows_current_user,

    v_can_view_followers
      as can_view_followers,

    v_can_view_following
      as can_view_following,

    case
      when v_can_view_followers then
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'follower_id',
                follow_data.follower_id,

                'created_at',
                follow_data.created_at,

                'profiles',
                jsonb_build_object(
                  'id',
                  follower_profile.id,

                  'display_name',
                  follower_profile.display_name,

                  'username',
                  follower_profile.username,

                  'avatar_url',
                  follower_profile.avatar_url
                )
              )
              order by follow_data.created_at desc
            )
            from public.user_follows follow_data
            join public.profiles follower_profile
              on follower_profile.id =
                follow_data.follower_id
             and follower_profile.account_status =
                'active'
            where follow_data.following_id =
              p_profile_id
          ),
          '[]'::jsonb
        )
      else
        '[]'::jsonb
    end as followers,

    case
      when v_can_view_following then
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'following_id',
                follow_data.following_id,

                'created_at',
                follow_data.created_at,

                'profiles',
                jsonb_build_object(
                  'id',
                  following_profile.id,

                  'display_name',
                  following_profile.display_name,

                  'username',
                  following_profile.username,

                  'avatar_url',
                  following_profile.avatar_url
                )
              )
              order by follow_data.created_at desc
            )
            from public.user_follows follow_data
            join public.profiles following_profile
              on following_profile.id =
                follow_data.following_id
             and following_profile.account_status =
                'active'
            where follow_data.follower_id =
              p_profile_id
          ),
          '[]'::jsonb
        )
      else
        '[]'::jsonb
    end as following_users;
end;
$function$;

revoke execute
on function public.get_profile_follow_data(uuid)
from public, anon;

grant execute
on function public.get_profile_follow_data(uuid)
to authenticated, service_role;

commit;
