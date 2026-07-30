create or replace function public.get_topic_author_profiles(
  p_topic_ids uuid[]
)
returns table (
  topic_id uuid,
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

  if
    p_topic_ids is null
    or cardinality(p_topic_ids) = 0
  then
    return;
  end if;

  if cardinality(p_topic_ids) > 100 then
    raise exception 'TOO_MANY_TOPIC_IDS';
  end if;

  return query
  select
    topic_data.id as topic_id,
    profile_data.id,
    profile_data.display_name,
    profile_data.username,
    profile_data.avatar_url
  from public.topics topic_data
  inner join public.profiles profile_data
    on profile_data.id = topic_data.author_id
  where topic_data.id = any(p_topic_ids)
    and topic_data.status = 'published'
    and profile_data.account_status = 'active';
end;
$function$;

revoke all
on function public.get_topic_author_profiles(uuid[])
from public, anon;

grant execute
on function public.get_topic_author_profiles(uuid[])
to authenticated, service_role;
