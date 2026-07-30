create or replace function public.notify_on_topic_like()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_topic_author_id uuid;
  v_topic_title text;
  v_topic_status text;
  v_actor_name text;
begin
  /*
   * Yalnızca beğeni işlemleri bildirim oluştursun.
   * Beğenmeme veya tepki kaldırma bildirim üretmesin.
   */
  if new.reaction <> 1 then
    return new;
  end if;

  /*
   * Zaten beğeni olan bir kayıt tekrar güncellenirse
   * ikinci kez bildirim oluşturma.
   */
  if tg_op = 'UPDATE'
     and old.reaction = 1 then
    return new;
  end if;

  select
    topic_data.author_id,
    topic_data.title,
    topic_data.status
  into
    v_topic_author_id,
    v_topic_title,
    v_topic_status
  from public.topics topic_data
  where topic_data.id = new.topic_id;

  if not found then
    return new;
  end if;

  if v_topic_status <> 'published' then
    return new;
  end if;

  /*
   * Kullanıcı kendi konusunu beğendiyse
   * bildirim gönderme.
   */
  if
    v_topic_author_id is null
    or v_topic_author_id = new.user_id
  then
    return new;
  end if;

  select
    coalesce(
      nullif(
        trim(profile_data.display_name),
        ''
      ),
      nullif(
        trim(
          leading '@'
          from profile_data.username
        ),
        ''
      ),
      'ForumFenomen Üyesi'
    )
  into v_actor_name
  from public.profiles profile_data
  where profile_data.id = new.user_id;

  if v_actor_name is null then
    v_actor_name :=
      'ForumFenomen Üyesi';
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    related_topic_id,
    related_user_id,
    is_read
  )
  values (
    v_topic_author_id,
    'topic_liked',
    'Konun beğenildi',
    format(
      '%s “%s” konunu beğendi.',
      v_actor_name,
      left(
        coalesce(
          v_topic_title,
          'Konu'
        ),
        120
      )
    ),
    new.topic_id,
    new.user_id,
    false
  );

  return new;
end;
$function$;

drop trigger if exists
  trg_notify_on_topic_like
on public.topic_reactions;

create trigger trg_notify_on_topic_like
after insert or update of reaction
on public.topic_reactions
for each row
execute function public.notify_on_topic_like();

revoke all
on function public.notify_on_topic_like()
from public, anon, authenticated;
