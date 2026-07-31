begin;


/*
 * İletişim mesajı sayaçları:
 * yalnızca aktif admin hesabı.
 */
create or replace function
  public.admin_contact_message_counts()
returns table (
  total_count bigint,
  new_count bigint,
  read_count bigint,
  replied_count bigint,
  closed_count bigint
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  return query
  select
    count(*)::bigint,

    count(*) filter (
      where contact_data.status = 'new'
    )::bigint,

    count(*) filter (
      where contact_data.status = 'read'
    )::bigint,

    count(*) filter (
      where contact_data.status = 'replied'
    )::bigint,

    count(*) filter (
      where contact_data.status = 'closed'
    )::bigint

  from public.contact_messages contact_data;
end;
$function$;


/*
 * İletişim mesajı listesi:
 * yalnızca aktif admin hesabı.
 */
create or replace function
  public.admin_list_contact_messages(
    p_status text default null,
    p_limit integer default 300
  )
returns table (
  id uuid,
  user_id uuid,
  full_name text,
  email text,
  subject text,
  message text,
  language text,
  status text,
  admin_note text,
  created_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if p_status is not null
     and p_status not in (
       'new',
       'read',
       'replied',
       'closed'
     ) then
    raise exception 'INVALID_STATUS';
  end if;

  return query
  select
    contact_data.id,
    contact_data.user_id,
    contact_data.full_name,
    contact_data.email,
    contact_data.subject,
    contact_data.message,
    contact_data.language,
    contact_data.status,
    contact_data.admin_note,
    contact_data.created_at,
    contact_data.read_at,
    contact_data.replied_at,
    contact_data.closed_at,
    contact_data.updated_at

  from public.contact_messages contact_data

  where
    p_status is null
    or contact_data.status = p_status

  order by
    case
      when contact_data.status = 'new'
        then 0
      when contact_data.status = 'read'
        then 1
      when contact_data.status = 'replied'
        then 2
      else 3
    end,

    contact_data.created_at desc

  limit greatest(
    1,
    least(
      coalesce(p_limit, 300),
      500
    )
  );
end;
$function$;


/*
 * Yorum durumu:
 * yalnızca aktif admin veya moderatör.
 */
create or replace function
  public.admin_set_comment_status(
    p_comment_id uuid,
    p_status text
  )
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_old_status text;
  v_comment_content text;
  v_topic_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Giriş yapılması gerekiyor.';
  end if;

  if not public.is_moderator_or_admin() then
    raise exception 'Bu işlem için yetkiniz bulunmuyor.';
  end if;

  if p_status not in (
    'published',
    'hidden',
    'banned'
  ) then
    raise exception 'Geçersiz yorum durumu.';
  end if;

  select
    comment_data.status,
    comment_data.content,
    comment_data.topic_id
  into
    v_old_status,
    v_comment_content,
    v_topic_id
  from public.topic_comments comment_data
  where comment_data.id = p_comment_id
  for update;

  if not found then
    raise exception 'Yorum bulunamadı.';
  end if;

  if v_old_status = p_status then
    return p_status;
  end if;

  update public.topic_comments
  set
    status = p_status,
    updated_at = now()
  where id = p_comment_id;

  insert into public.admin_action_logs (
    actor_id,
    action_type,
    target_type,
    target_id,
    old_value,
    new_value,
    metadata
  )
  values (
    v_user_id,

    case
      when p_status = 'hidden'
        then 'comment_hidden'
      when p_status = 'banned'
        then 'comment_banned'
      when p_status = 'published'
        then 'comment_published'
      else 'comment_status_changed'
    end,

    'comment',
    p_comment_id,
    v_old_status,
    p_status,

    jsonb_build_object(
      'comment_content',
      left(
        coalesce(v_comment_content, ''),
        300
      ),
      'topic_id',
      v_topic_id
    )
  );

  return p_status;
end;
$function$;


/*
 * İletişim mesajı güncelleme:
 * yalnızca aktif admin hesabı.
 */
create or replace function
  public.admin_update_contact_message(
    p_message_id uuid,
    p_status text,
    p_admin_note text default null
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_admin_note text;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if p_status not in (
    'new',
    'read',
    'replied',
    'closed'
  ) then
    raise exception 'INVALID_STATUS';
  end if;

  v_admin_note :=
    nullif(
      trim(
        coalesce(
          p_admin_note,
          ''
        )
      ),
      ''
    );

  if v_admin_note is not null
     and char_length(v_admin_note) > 1000 then
    raise exception 'ADMIN_NOTE_TOO_LONG';
  end if;

  if not exists (
    select 1
    from public.contact_messages contact_data
    where contact_data.id = p_message_id
  ) then
    raise exception 'MESSAGE_NOT_FOUND';
  end if;

  update public.contact_messages
  set
    status = p_status,
    admin_note = v_admin_note,

    read_at =
      case
        when p_status in (
          'read',
          'replied',
          'closed'
        )
          then coalesce(
            public.contact_messages.read_at,
            now()
          )
        else null
      end,

    replied_at =
      case
        when p_status = 'replied'
          then coalesce(
            public.contact_messages.replied_at,
            now()
          )
        when p_status in (
          'new',
          'read'
        )
          then null
        else public.contact_messages.replied_at
      end,

    closed_at =
      case
        when p_status = 'closed'
          then coalesce(
            public.contact_messages.closed_at,
            now()
          )
        else null
      end,

    updated_at = now()

  where public.contact_messages.id =
    p_message_id;
end;
$function$;


/*
 * Kullanıcı hesabı yönetimi:
 * yalnızca aktif admin hesabı.
 */
create or replace function
  public.admin_update_user_account(
    p_user_id uuid,
    p_action text,
    p_reason text default null,
    p_suspend_until timestamptz default null
  )
returns table (
  id uuid,
  account_status text,
  suspended_until timestamptz,
  moderation_reason text,
  moderated_by uuid,
  moderated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_id uuid;
  v_old_status text;
  v_old_suspend_until timestamptz;
  v_old_reason text;
  v_new_status text;
  v_new_suspend_until timestamptz;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if p_user_id = v_actor_id then
    raise exception 'SELF_ACTION_NOT_ALLOWED';
  end if;

  if p_action not in (
    'activate',
    'suspend',
    'ban'
  ) then
    raise exception 'INVALID_ACTION';
  end if;

  select
    target_profile.account_status,
    target_profile.suspended_until,
    target_profile.moderation_reason
  into
    v_old_status,
    v_old_suspend_until,
    v_old_reason
  from public.profiles target_profile
  where target_profile.id = p_user_id
  for update;

  if not found then
    raise exception 'USER_NOT_FOUND';
  end if;

  if exists (
    select 1
    from public.profiles target_profile
    where target_profile.id = p_user_id
      and target_profile.role = 'admin'
  ) then
    raise exception 'ADMIN_ACCOUNT_PROTECTED';
  end if;

  if p_action = 'activate' then
    v_new_status := 'active';
    v_new_suspend_until := null;

  elsif p_action = 'suspend' then
    if p_suspend_until is null then
      raise exception 'SUSPEND_UNTIL_REQUIRED';
    end if;

    if p_suspend_until <= now() then
      raise exception 'INVALID_SUSPEND_UNTIL';
    end if;

    v_new_status := 'suspended';
    v_new_suspend_until := p_suspend_until;

  else
    v_new_status := 'banned';
    v_new_suspend_until := null;
  end if;

  update public.profiles
  set
    account_status = v_new_status,
    suspended_until = v_new_suspend_until,

    moderation_reason =
      case
        when p_action = 'activate'
          then null
        else nullif(
          trim(p_reason),
          ''
        )
      end,

    moderated_by = v_actor_id,
    moderated_at = now(),
    updated_at = now()

  where public.profiles.id = p_user_id;

  insert into public.admin_action_logs (
    actor_id,
    action_type,
    target_type,
    target_id,
    target_user_id,
    old_value,
    new_value,
    note,
    metadata
  )
  values (
    v_actor_id,

    case
      when p_action = 'activate'
        then 'user_activated'
      when p_action = 'suspend'
        then 'user_suspended'
      when p_action = 'ban'
        then 'user_banned'
    end,

    'user',
    p_user_id,
    p_user_id,
    v_old_status,
    v_new_status,

    case
      when p_action = 'activate'
        then 'Kullanıcı hesabı yeniden aktifleştirildi.'
      else nullif(
        trim(p_reason),
        ''
      )
    end,

    jsonb_build_object(
      'old_suspended_until',
      v_old_suspend_until,
      'new_suspended_until',
      v_new_suspend_until,
      'old_reason',
      v_old_reason
    )
  );

  return query
  select
    target_profile.id,
    target_profile.account_status,
    target_profile.suspended_until,
    target_profile.moderation_reason,
    target_profile.moderated_by,
    target_profile.moderated_at
  from public.profiles target_profile
  where target_profile.id = p_user_id;
end;
$function$;


/*
 * Kullanıcı rolü yönetimi:
 * yalnızca aktif admin hesabı.
 */
create or replace function
  public.admin_update_user_role(
    p_user_id uuid,
    p_role text,
    p_note text default null
  )
returns table (
  id uuid,
  role text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_id uuid;
  v_old_role text;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if p_user_id = v_actor_id then
    raise exception 'SELF_ROLE_CHANGE_NOT_ALLOWED';
  end if;

  if p_role not in (
    'user',
    'moderator'
  ) then
    raise exception 'INVALID_ROLE';
  end if;

  select target_profile.role
  into v_old_role
  from public.profiles target_profile
  where target_profile.id = p_user_id
  for update;

  if not found then
    raise exception 'USER_NOT_FOUND';
  end if;

  if v_old_role = 'admin' then
    raise exception 'ADMIN_ACCOUNT_PROTECTED';
  end if;

  if v_old_role = p_role then
    raise exception 'ROLE_ALREADY_SET';
  end if;

  update public.profiles
  set
    role = p_role,
    updated_at = now()
  where public.profiles.id = p_user_id;

  insert into public.admin_action_logs (
    actor_id,
    action_type,
    target_type,
    target_id,
    target_user_id,
    old_value,
    new_value,
    note,
    metadata
  )
  values (
    v_actor_id,

    case
      when p_role = 'moderator'
        then 'user_promoted_to_moderator'
      else 'user_demoted_to_user'
    end,

    'user',
    p_user_id,
    p_user_id,
    v_old_role,
    p_role,
    nullif(
      trim(p_note),
      ''
    ),

    jsonb_build_object(
      'old_role',
      v_old_role,
      'new_role',
      p_role
    )
  );

  return query
  select
    target_profile.id,
    target_profile.role,
    target_profile.updated_at
  from public.profiles target_profile
  where target_profile.id = p_user_id;
end;
$function$;


/*
 * RPC erişimi yalnızca oturum açmış kullanıcılarda
 * tutulur. Gerçek admin/moderatör kontrolü fonksiyon
 * gövdesinde yapılır.
 */
revoke execute
on function public.admin_contact_message_counts()
from public, anon;

revoke execute
on function public.admin_list_contact_messages(text, integer)
from public, anon;

revoke execute
on function public.admin_set_comment_status(uuid, text)
from public, anon;

revoke execute
on function public.admin_update_contact_message(uuid, text, text)
from public, anon;

revoke execute
on function public.admin_update_user_account(
  uuid,
  text,
  text,
  timestamptz
)
from public, anon;

revoke execute
on function public.admin_update_user_role(uuid, text, text)
from public, anon;


grant execute
on function public.admin_contact_message_counts()
to authenticated;

grant execute
on function public.admin_list_contact_messages(text, integer)
to authenticated;

grant execute
on function public.admin_set_comment_status(uuid, text)
to authenticated;

grant execute
on function public.admin_update_contact_message(uuid, text, text)
to authenticated;

grant execute
on function public.admin_update_user_account(
  uuid,
  text,
  text,
  timestamptz
)
to authenticated;

grant execute
on function public.admin_update_user_role(uuid, text, text)
to authenticated;

commit;
