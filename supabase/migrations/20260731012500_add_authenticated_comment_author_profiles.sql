create or replace function public.get_topic_comment_author_profiles(
  p_topic_id uuid
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
begin
  if auth.uid() is null then
    raise exception 'LOGIN_REQUIRED';
  end if;

  perform public.assert_current_account_active();

  /*
   * Yalnızca yayındaki konular için
   * profil bilgisi döndür.
   */
  if not exists (
    select 1
    from public.topics topic_data
    where topic_data.id = p_topic_id
      and topic_data.status = 'published'
  ) then
    return;
  end if;

  /*
   * Yalnızca bu konudaki yayımlanmış yorumların
   * aktif yazarlarını ve güvenli profil alanlarını döndür.
   */
  return query
  select distinct
    profile_data.id,
    profile_data.display_name,
    profile_data.username,
    profile_data.avatar_url
  from public.topic_comments comment_data
  inner join public.profiles profile_data
    on profile_data.id = comment_data.author_id
  where comment_data.topic_id = p_topic_id
    and comment_data.status = 'published'
    and profile_data.account_status = 'active';
end;
$function$;

revoke all
on function public.get_topic_comment_author_profiles(uuid)
from public, anon;

grant execute
on function public.get_topic_comment_author_profiles(uuid)
to authenticated, service_role;
