begin;


/*
 * Kullanıcı adı yalnızca aktif hesap tarafından
 * değiştirilebilir.
 */
create or replace function public.change_username(
  p_username text
)
returns text
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user_id uuid;
  v_username text;
  v_filter_value text;
  v_is_blocked boolean;
begin
  perform public.assert_current_account_active();

  v_user_id := auth.uid();

  v_username :=
    lower(
      trim(
        coalesce(p_username, '')
      )
    );

  if char_length(v_username) < 3 then
    raise exception 'USERNAME_TOO_SHORT';
  end if;

  if char_length(v_username) > 24 then
    raise exception 'USERNAME_TOO_LONG';
  end if;

  if v_username !~
     '^[a-z0-9][a-z0-9_-]*[a-z0-9]$' then
    raise exception 'USERNAME_INVALID_FORMAT';
  end if;

  if position('--' in v_username) > 0
     or position('__' in v_username) > 0
     or position('-_' in v_username) > 0
     or position('_-' in v_username) > 0 then
    raise exception 'USERNAME_INVALID_FORMAT';
  end if;

  v_filter_value :=
    public.normalize_username_for_filter(
      v_username
    );

  select exists (
    select 1
    from public.username_blocklist block_data
    where
      (
        block_data.match_mode = 'exact'
        and v_filter_value =
          public.normalize_username_for_filter(
            block_data.term
          )
      )
      or
      (
        block_data.match_mode = 'contains'
        and position(
          public.normalize_username_for_filter(
            block_data.term
          )
          in v_filter_value
        ) > 0
      )
  )
  into v_is_blocked;

  if v_is_blocked then
    raise exception 'USERNAME_NOT_ALLOWED';
  end if;

  if exists (
    select 1
    from public.profiles profile_data
    where lower(profile_data.username) =
      lower(v_username)
      and profile_data.id <> v_user_id
  ) then
    raise exception 'USERNAME_TAKEN';
  end if;

  update public.profiles
  set
    username = v_username,
    username_is_temporary = false,
    username_reminder_dismissed_at = null,
    username_changed_at = now()
  where id = v_user_id;

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  return v_username;

exception
  when unique_violation then
    raise exception 'USERNAME_TAKEN';
end;
$function$;


/*
 * Geçici kullanıcı adı hatırlatıcısı yalnızca
 * aktif hesap tarafından kapatılabilir.
 */
create or replace function
  public.dismiss_username_reminder()
returns void
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user_id uuid;
begin
  perform public.assert_current_account_active();

  v_user_id := auth.uid();

  update public.profiles
  set username_reminder_dismissed_at = now()
  where id = v_user_id
    and username_is_temporary = true;
end;
$function$;


/*
 * Kullanıcı kendi yorumunu yalnızca aktif
 * hesabıyla kaldırabilir.
 */
create or replace function public.soft_delete_comment(
  p_comment_id uuid
)
returns void
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user_id uuid;
begin
  perform public.assert_current_account_active();

  v_user_id := auth.uid();

  update public.topic_comments comment_data
  set
    status = 'deleted',
    deleted_at = now(),
    deleted_by = v_user_id,
    deletion_reason = 'user_removed'
  where comment_data.id = p_comment_id
    and comment_data.author_id = v_user_id
    and comment_data.status = 'published';

  if not found then
    raise exception 'COMMENT_NOT_REMOVABLE';
  end if;
end;
$function$;


/*
 * Yorum şikâyeti yalnızca aktif hesap
 * tarafından gönderilebilir.
 */
create or replace function public.submit_comment_report(
  p_comment_id uuid,
  p_reason text default 'other',
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_report_id uuid;
  v_reason text;
  v_details text;
begin
  perform public.assert_current_account_active();

  v_user_id := auth.uid();

  v_reason :=
    case
      when lower(
        trim(
          coalesce(p_reason, '')
        )
      ) in (
        'spam',
        'harassment',
        'hate',
        'illegal',
        'personal_information',
        'other'
      )
        then lower(
          trim(
            coalesce(p_reason, '')
          )
        )
      else 'other'
    end;

  v_details :=
    nullif(
      trim(
        coalesce(p_details, '')
      ),
      ''
    );

  if v_details is not null
     and char_length(v_details) > 2000 then
    raise exception 'DETAILS_TOO_LONG';
  end if;

  perform comment_data.id
  from public.topic_comments comment_data
  where comment_data.id = p_comment_id
    and comment_data.status = 'published'
    and comment_data.author_id <> v_user_id;

  if not found then
    raise exception 'COMMENT_NOT_REPORTABLE';
  end if;

  insert into public.comment_reports (
    comment_id,
    reporter_id,
    reason,
    details
  )
  values (
    p_comment_id,
    v_user_id,
    v_reason,
    v_details
  )
  on conflict (
    comment_id,
    reporter_id
  )
  do update set
    reason = excluded.reason,
    details = excluded.details,
    status = 'pending',
    updated_at = now()
  returning id
  into v_report_id;

  return v_report_id;
end;
$function$;


/*
 * Profil şikâyeti yalnızca aktif hesap
 * tarafından gönderilebilir.
 */
create or replace function public.submit_profile_report(
  p_profile_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_reporter_id uuid;
  v_report_id uuid;
  v_reason text;
  v_details text;
begin
  perform public.assert_current_account_active();

  v_reporter_id := auth.uid();

  if p_profile_id is null then
    raise exception 'PROFILE_REQUIRED';
  end if;

  if p_profile_id = v_reporter_id then
    raise exception 'CANNOT_REPORT_SELF';
  end if;

  if not exists (
    select 1
    from public.profiles profile_data
    where profile_data.id = p_profile_id
      and profile_data.account_status = 'active'
  ) then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  v_reason :=
    trim(
      coalesce(p_reason, '')
    );

  v_details :=
    nullif(
      trim(
        coalesce(p_details, '')
      ),
      ''
    );

  if char_length(v_reason) < 2
     or char_length(v_reason) > 100 then
    raise exception 'INVALID_REASON';
  end if;

  if v_details is not null
     and char_length(v_details) > 2000 then
    raise exception 'DETAILS_TOO_LONG';
  end if;

  if exists (
    select 1
    from public.profile_reports report_data
    where report_data.profile_id = p_profile_id
      and report_data.reporter_id = v_reporter_id
      and report_data.status in (
        'open',
        'reviewing'
      )
  ) then
    raise exception 'REPORT_ALREADY_EXISTS';
  end if;

  insert into public.profile_reports (
    profile_id,
    reporter_id,
    reason,
    details
  )
  values (
    p_profile_id,
    v_reporter_id,
    v_reason,
    v_details
  )
  returning id
  into v_report_id;

  return v_report_id;
end;
$function$;


/*
 * Konu şikâyeti yalnızca aktif hesap
 * tarafından gönderilebilir.
 */
create or replace function public.submit_topic_report(
  p_topic_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_topic_author_id uuid;
  v_reason text;
  v_details text;
  v_report_id uuid;
begin
  perform public.assert_current_account_active();

  v_user_id := auth.uid();

  select topic_data.author_id
  into v_topic_author_id
  from public.topics topic_data
  where topic_data.id = p_topic_id
    and topic_data.status = 'published';

  if v_topic_author_id is null then
    raise exception 'TOPIC_NOT_FOUND';
  end if;

  if v_topic_author_id = v_user_id then
    raise exception 'CANNOT_REPORT_OWN_TOPIC';
  end if;

  v_reason :=
    trim(
      coalesce(p_reason, '')
    );

  v_details :=
    nullif(
      trim(
        coalesce(p_details, '')
      ),
      ''
    );

  if char_length(v_reason) < 2
     or char_length(v_reason) > 100 then
    raise exception 'INVALID_REASON';
  end if;

  if v_details is not null
     and char_length(v_details) > 2000 then
    raise exception 'DETAILS_TOO_LONG';
  end if;

  if exists (
    select 1
    from public.topic_reports report_data
    where report_data.topic_id = p_topic_id
      and report_data.reporter_id = v_user_id
  ) then
    raise exception 'REPORT_ALREADY_EXISTS';
  end if;

  insert into public.topic_reports (
    topic_id,
    reporter_id,
    reason,
    details
  )
  values (
    p_topic_id,
    v_user_id,
    v_reason,
    v_details
  )
  returning id
  into v_report_id;

  return v_report_id;
end;
$function$;


/*
 * Yorum reaksiyonu yalnızca aktif hesap
 * tarafından değiştirilebilir.
 */
create or replace function public.toggle_comment_reaction(
  p_comment_id uuid,
  p_reaction smallint
)
returns table (
  like_count bigint,
  dislike_count bigint,
  user_reaction smallint
)
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user_id uuid;
  v_old_reaction smallint;
  v_new_reaction smallint;
begin
  perform public.assert_current_account_active();

  v_user_id := auth.uid();

  if p_reaction not in (-1, 1) then
    raise exception 'INVALID_REACTION';
  end if;

  perform comment_data.id
  from public.topic_comments comment_data
  where comment_data.id = p_comment_id
    and comment_data.status = 'published'
  for update;

  if not found then
    raise exception 'COMMENT_NOT_AVAILABLE';
  end if;

  select reaction_data.reaction
  into v_old_reaction
  from public.comment_reactions reaction_data
  where reaction_data.comment_id = p_comment_id
    and reaction_data.user_id = v_user_id;

  if v_old_reaction is null then

    insert into public.comment_reactions (
      comment_id,
      user_id,
      reaction
    )
    values (
      p_comment_id,
      v_user_id,
      p_reaction
    );

    v_new_reaction := p_reaction;

  elsif v_old_reaction = p_reaction then

    delete from public.comment_reactions
    where comment_id = p_comment_id
      and user_id = v_user_id;

    v_new_reaction := 0;

  else

    update public.comment_reactions
    set
      reaction = p_reaction,
      updated_at = now()
    where comment_id = p_comment_id
      and user_id = v_user_id;

    v_new_reaction := p_reaction;

  end if;

  update public.topic_comments comment_data
  set
    like_count =
      greatest(
        comment_data.like_count
        + case
            when v_old_reaction = 1
              then -1
            else 0
          end
        + case
            when v_new_reaction = 1
              then 1
            else 0
          end,
        0
      ),

    dislike_count =
      greatest(
        comment_data.dislike_count
        + case
            when v_old_reaction = -1
              then -1
            else 0
          end
        + case
            when v_new_reaction = -1
              then 1
            else 0
          end,
        0
      )

  where comment_data.id = p_comment_id;

  return query
  select
    comment_data.like_count,
    comment_data.dislike_count,
    v_new_reaction
  from public.topic_comments comment_data
  where comment_data.id = p_comment_id;
end;
$function$;


/*
 * Konu reaksiyonu yalnızca aktif hesap
 * tarafından değiştirilebilir.
 */
create or replace function public.toggle_topic_reaction(
  p_topic_id uuid,
  p_reaction smallint
)
returns table (
  like_count bigint,
  dislike_count bigint,
  user_reaction smallint
)
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user_id uuid;
  v_existing_reaction smallint;
begin
  perform public.assert_current_account_active();

  v_user_id := auth.uid();

  if p_reaction not in (-1, 1) then
    raise exception 'INVALID_REACTION';
  end if;

  if not exists (
    select 1
    from public.topics topic_data
    where topic_data.id = p_topic_id
      and topic_data.status = 'published'
  ) then
    raise exception 'TOPIC_NOT_FOUND';
  end if;

  select reaction_data.reaction
  into v_existing_reaction
  from public.topic_reactions reaction_data
  where reaction_data.topic_id = p_topic_id
    and reaction_data.user_id = v_user_id;

  if v_existing_reaction = p_reaction then

    delete from public.topic_reactions
    where topic_id = p_topic_id
      and user_id = v_user_id;

    v_existing_reaction := 0;

  elsif v_existing_reaction is null then

    insert into public.topic_reactions (
      topic_id,
      user_id,
      reaction
    )
    values (
      p_topic_id,
      v_user_id,
      p_reaction
    );

    v_existing_reaction := p_reaction;

  else

    update public.topic_reactions
    set
      reaction = p_reaction,
      updated_at = now()
    where topic_id = p_topic_id
      and user_id = v_user_id;

    v_existing_reaction := p_reaction;

  end if;

  return query
  select
    count(*) filter (
      where reaction_data.reaction = 1
    )::bigint,

    count(*) filter (
      where reaction_data.reaction = -1
    )::bigint,

    v_existing_reaction

  from public.topic_reactions reaction_data
  where reaction_data.topic_id = p_topic_id;
end;
$function$;


/*
 * Aktif olmayan hesap çevrimiçi olarak
 * işaretlenemez.
 */
create or replace function public.update_user_presence()
returns timestamptz
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_now timestamptz := now();
begin
  perform public.assert_current_account_active();

  update public.profiles
  set last_seen_at = v_now
  where id = auth.uid();

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  return v_now;
end;
$function$;


/*
 * RPC'ler yalnızca oturum açmış istemciler
 * tarafından çağrılabilir.
 */
revoke execute
on function public.change_username(text)
from public, anon;

revoke execute
on function public.dismiss_username_reminder()
from public, anon;

revoke execute
on function public.soft_delete_comment(uuid)
from public, anon;

revoke execute
on function public.submit_comment_report(uuid, text, text)
from public, anon;

revoke execute
on function public.submit_profile_report(uuid, text, text)
from public, anon;

revoke execute
on function public.submit_topic_report(uuid, text, text)
from public, anon;

revoke execute
on function public.toggle_comment_reaction(uuid, smallint)
from public, anon;

revoke execute
on function public.toggle_topic_reaction(uuid, smallint)
from public, anon;

revoke execute
on function public.update_user_presence()
from public, anon;


grant execute
on function public.change_username(text)
to authenticated;

grant execute
on function public.dismiss_username_reminder()
to authenticated;

grant execute
on function public.soft_delete_comment(uuid)
to authenticated;

grant execute
on function public.submit_comment_report(uuid, text, text)
to authenticated;

grant execute
on function public.submit_profile_report(uuid, text, text)
to authenticated;

grant execute
on function public.submit_topic_report(uuid, text, text)
to authenticated;

grant execute
on function public.toggle_comment_reaction(uuid, smallint)
to authenticated;

grant execute
on function public.toggle_topic_reaction(uuid, smallint)
to authenticated;

grant execute
on function public.update_user_presence()
to authenticated;

commit;
