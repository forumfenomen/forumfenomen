begin;

/*
 * public_profiles SECURITY DEFINER view kullanımını
 * kontrollü RPC fonksiyonlarına taşımak için hazırlık.
 *
 * Bu migration view'ı henüz kaldırmaz.
 */


/*
 * Oturum açmış aktif kullanıcıların, aktif profillere ait
 * temel ve hassas olmayan kimlik alanlarını UUID listesiyle
 * almasını sağlar.
 *
 * Kullanım alanları:
 * - Admin forum etkinlikleri
 * - Admin işlem kayıtları
 * - Admin şikâyetler
 * - Admin yorumlar
 * - Bildirim yönlendirmeleri
 */
create or replace function public.get_profile_summaries_by_ids(
  p_profile_ids uuid[]
)
returns table (
  id uuid,
  display_name text,
  username text
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

  if p_profile_ids is null
     or cardinality(p_profile_ids) = 0 then
    return;
  end if;

  if cardinality(p_profile_ids) > 500 then
    raise exception 'TOO_MANY_PROFILE_IDS';
  end if;

  return query
  select
    profile_data.id,
    profile_data.display_name,
    profile_data.username
  from public.profiles profile_data
  where profile_data.id = any(p_profile_ids)
    and profile_data.account_status = 'active';
end;
$function$;


/*
 * Kullanıcı adına göre profil sayfasında gereken alanları döndürür.
 *
 * Temel profil alanları aktif ve oturum açmış kullanıcılara görünür.
 * Bio ve ilgi alanları ise mevcut profil görünürlük kuralına göre
 * döndürülür.
 */
create or replace function public.get_profile_by_username(
  p_username text
)
returns table (
  id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  interests text[],
  created_at timestamptz,
  profile_visibility text,
  followers_visibility text,
  following_visibility text,
  comments_visibility text,
  likes_visibility text,
  role text
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

  v_can_view_profile_details boolean := false;
begin
  if p_username is null
     or length(trim(p_username)) = 0 then
    return;
  end if;

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

    v_is_moderator_or_admin :=
      public.is_moderator_or_admin();
  end if;

  return query
  select
    profile_data.id,
    profile_data.display_name,
    profile_data.username,
    profile_data.avatar_url,

    case
      when
        v_is_service_role
        or v_is_moderator_or_admin
        or profile_data.id = v_viewer_id

        or coalesce(
          profile_data.profile_visibility,
          'public'
        ) = 'public'

        or (
          profile_data.profile_visibility = 'followers'
          and exists (
            select 1
            from public.user_follows follow_data
            where follow_data.follower_id = v_viewer_id
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
                  v_viewer_id
          )
        )
      then profile_data.bio
      else null
    end as bio,

    case
      when
        v_is_service_role
        or v_is_moderator_or_admin
        or profile_data.id = v_viewer_id

        or coalesce(
          profile_data.profile_visibility,
          'public'
        ) = 'public'

        or (
          profile_data.profile_visibility = 'followers'
          and exists (
            select 1
            from public.user_follows follow_data
            where follow_data.follower_id = v_viewer_id
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
                  v_viewer_id
          )
        )
      then profile_data.interests
      else null
    end as interests,

    profile_data.created_at,
    profile_data.profile_visibility,
    profile_data.followers_visibility,
    profile_data.following_visibility,
    profile_data.comments_visibility,
    profile_data.likes_visibility,

    case
      when profile_data.role = 'admin'
        then 'admin'
      when profile_data.role = 'moderator'
        then 'moderator'
      else 'user'
    end as role

  from public.profiles profile_data

  where profile_data.account_status = 'active'
    and lower(profile_data.username) =
        lower(trim(p_username))

  limit 1;
end;
$function$;


/*
 * Varsayılan PUBLIC çalıştırma yetkisini kaldır.
 */
revoke all
on function public.get_profile_summaries_by_ids(uuid[])
from public, anon;

revoke all
on function public.get_profile_by_username(text)
from public, anon;


/*
 * Yalnızca oturum açmış kullanıcılar ve server-side
 * service_role bu fonksiyonları çağırabilir.
 */
grant execute
on function public.get_profile_summaries_by_ids(uuid[])
to authenticated, service_role;

grant execute
on function public.get_profile_by_username(text)
to authenticated, service_role;


comment on function
  public.get_profile_summaries_by_ids(uuid[])
is
  'Aktif ve oturum açmış kullanıcılar için güvenli temel profil özetlerini UUID listesiyle döndürür.';

comment on function
  public.get_profile_by_username(text)
is
  'Profil görünürlük kurallarını uygulayarak kullanıcı adına göre güvenli profil verisi döndürür.';

commit;