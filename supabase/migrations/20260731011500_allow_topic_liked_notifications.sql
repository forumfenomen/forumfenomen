begin;

alter table public.notifications
drop constraint if exists
  notifications_type_check;

alter table public.notifications
add constraint notifications_type_check
check (
  type = any (
    array[
      'report_received'::text,
      'reviewing'::text,
      'resolved'::text,
      'dismissed'::text,
      'report_reviewing'::text,
      'report_resolved'::text,
      'report_dismissed'::text,
      'moderation_warning'::text,
      'system'::text,
      'comment_reply'::text,
      'topic_comment'::text,
      'saved_topic_comment'::text,
      'comment_liked'::text,
      'topic_liked'::text,
      'user_followed'::text,
      'follow_request'::text
    ]
  )
);

commit;
