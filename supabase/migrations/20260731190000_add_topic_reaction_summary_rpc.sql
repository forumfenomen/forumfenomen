begin;

/*
 * Konu tepki sayılarını anonim ziyaretçilere
 * kullanıcı kimliklerini göstermeden döndürür.
 *
 * Oturum açıksa yalnızca çağrıyı yapan kullanıcının
 * kendi tepkisini user_reaction alanında verir.
 */
create or replace function
  public.get_topic_reaction_summary(
    p_topic_id uuid
  )
returns table (
  like_count bigint,
  dislike_count bigint,
  user_reaction smallint
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    count(reaction_data.user_id) filter (
      where reaction_data.reaction = 1
    )::bigint as like_count,

    count(reaction_data.user_id) filter (
      where reaction_data.reaction = -1
    )::bigint as dislike_count,

    coalesce(
      (
        select own_reaction.reaction
        from public.topic_reactions own_reaction
        where own_reaction.topic_id = p_topic_id
          and own_reaction.user_id = auth.uid()
        limit 1
      ),
      0
    )::smallint as user_reaction

  from public.topics topic_data

  left join public.topic_reactions reaction_data
    on reaction_data.topic_id = topic_data.id

  where topic_data.id = p_topic_id
    and topic_data.status = 'published'

  group by topic_data.id;
$function$;


/*
 * Tepki sayıları konu sayfasında oturum kapalıyken de
 * gösterildiği için RPC anonim çağrıya açık kalır.
 *
 * Fonksiyon hiçbir kullanıcı kimliği döndürmez.
 */
revoke execute
on function public.get_topic_reaction_summary(uuid)
from public;

grant execute
on function public.get_topic_reaction_summary(uuid)
to anon, authenticated, service_role;

commit;
