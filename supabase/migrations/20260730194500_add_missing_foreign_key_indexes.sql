/*
 * ForumFenomen
 * Eksik foreign key destek indexleri
 *
 * Amaç:
 * - İlişki sorgularını büyümeye hazırlamak
 * - CASCADE / SET NULL / RESTRICT kontrollerini hızlandırmak
 * - Nullable foreign key kolonlarında partial index kullanmak
 *
 * Güvenlik:
 * - Veri değiştirmez
 * - Foreign key veya RLS değiştirmez
 * - Mevcut indexleri silmez
 */

begin;

-- Kilit uzun sürerse migration’ın sistemi bekletmesini önler.
set local lock_timeout = '5s';
set local statement_timeout = '60s';


/* =========================================================
   ADMIN ACTION LOGS
   target_user_id nullable olduğu için partial index.
   ========================================================= */

create index if not exists
  admin_action_logs_target_user_id_idx
on public.admin_action_logs (target_user_id)
where target_user_id is not null;


/* =========================================================
   COMMENT REPORTS
   reporter_id zorunlu, reviewed_by nullable.
   ========================================================= */

create index if not exists
  comment_reports_reporter_id_idx
on public.comment_reports (reporter_id);

create index if not exists
  comment_reports_reviewed_by_idx
on public.comment_reports (reviewed_by)
where reviewed_by is not null;


/* =========================================================
   MODERATION ACTIONS
   comment_id nullable, moderator_id zorunlu.
   ========================================================= */

create index if not exists
  moderation_actions_comment_id_idx
on public.moderation_actions (comment_id)
where comment_id is not null;

create index if not exists
  moderation_actions_moderator_id_idx
on public.moderation_actions (moderator_id);


/* =========================================================
   NOTIFICATIONS
   İki ilişki kolonu da nullable.
   ========================================================= */

create index if not exists
  notifications_related_comment_id_idx
on public.notifications (related_comment_id)
where related_comment_id is not null;

create index if not exists
  notifications_related_report_id_idx
on public.notifications (related_report_id)
where related_report_id is not null;


/* =========================================================
   PROFILE REPORTS
   reporter_id zorunlu, reviewed_by nullable.
   ========================================================= */

create index if not exists
  profile_reports_reporter_id_idx
on public.profile_reports (reporter_id);

create index if not exists
  profile_reports_reviewed_by_idx
on public.profile_reports (reviewed_by)
where reviewed_by is not null;


/* =========================================================
   PROFILES
   moderated_by nullable.
   ========================================================= */

create index if not exists
  profiles_moderated_by_idx
on public.profiles (moderated_by)
where moderated_by is not null;


/* =========================================================
   TOPIC COMMENTS
   deleted_by nullable.
   ========================================================= */

create index if not exists
  topic_comments_deleted_by_idx
on public.topic_comments (deleted_by)
where deleted_by is not null;


/* =========================================================
   TOPIC REPORTS
   reviewed_by nullable.
   ========================================================= */

create index if not exists
  topic_reports_reviewed_by_idx
on public.topic_reports (reviewed_by)
where reviewed_by is not null;


/* =========================================================
   USER FOLLOW REQUESTS
   receiver_id zorunlu ve gelen istek sorgularında önemli.
   ========================================================= */

create index if not exists
  user_follow_requests_receiver_id_idx
on public.user_follow_requests (receiver_id);


commit;


/* =========================================================
   MIGRATION SONRASI DOĞRULAMA
   Beklenen sonuç: 13 satır.
   ========================================================= */

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and indexname = any (
    array[
      'admin_action_logs_target_user_id_idx',
      'comment_reports_reporter_id_idx',
      'comment_reports_reviewed_by_idx',
      'moderation_actions_comment_id_idx',
      'moderation_actions_moderator_id_idx',
      'notifications_related_comment_id_idx',
      'notifications_related_report_id_idx',
      'profile_reports_reporter_id_idx',
      'profile_reports_reviewed_by_idx',
      'profiles_moderated_by_idx',
      'topic_comments_deleted_by_idx',
      'topic_reports_reviewed_by_idx',
      'user_follow_requests_receiver_id_idx'
    ]
  )
order by tablename, indexname;