begin;

alter function public.moderate_topic_report(
  uuid,
  text,
  text
)
set search_path = '';

commit;
