begin;

 /*
  * Oturumu kapalı ziyaretçilerin public_profiles
  * görünümünü doğrudan okumasını engelle.
  */
revoke all
on table public.public_profiles
from public, anon;

grant select
on table public.public_profiles
to authenticated, service_role;


/*
 * Kullanıcı aramasını yalnızca oturum açmış ve
 * hesabı aktif kullanıcılara izin verecek şekilde yenile.
 */
create or replace function public.search_public_profiles(
  p_query text,
  p_limit integer default 10
)
returns table (
  id uuid,
  display_name text,
  username text,
  avatar_url text
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_query text;
  v_escaped_query text;
  v_limit integer;
begin
  if auth.uid() is null then
    raise exception 'LOGIN_REQUIRED';
  end if;

  perform public.assert_current_account_active();

  v_query := trim(
    coalesce(p_query, '')
  );

  if char_length(v_query) < 2 then
    return;
  end if;

  /*
   * ILIKE içinde kullanıcı girdisinin wildcard
   * olarak çalışmasını engelle.
   */
  v_escaped_query :=
    replace(v_query, '\', '\\');

  v_escaped_query :=
    replace(v_escaped_query, '%', '\%');

  v_escaped_query :=
    replace(v_escaped_query, '_', '\_');

  v_limit := greatest(
    1,
    least(
      coalesce(p_limit, 10),
      20
    )
  );

  return query
  select
    profile_data.id,
    profile_data.display_name,
    profile_data.username,
    profile_data.avatar_url
  from public.profiles profile_data
  where profile_data.account_status = 'active'
    and profile_data.profile_visibility = 'public'
    and profile_data.username is not null
    and (
      profile_data.username ilike
        '%' || v_escaped_query || '%'
        escape '\'

      or coalesce(
        profile_data.display_name,
        ''
      ) ilike
        '%' || v_escaped_query || '%'
        escape '\'
    )
  order by
    case
      when lower(profile_data.username) =
           lower(v_query)
        then 0

      when lower(profile_data.username) like
           lower(v_escaped_query) || '%'
           escape '\'
        then 1

      when lower(
        coalesce(
          profile_data.display_name,
          ''
        )
      ) like
        lower(v_escaped_query) || '%'
        escape '\'
        then 2

      else 3
    end,
    profile_data.username
  limit v_limit;
end;
$function$;

revoke all
on function public.search_public_profiles(text, integer)
from public, anon;

grant execute
on function public.search_public_profiles(text, integer)
to authenticated;

commit;
