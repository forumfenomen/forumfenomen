begin;

alter function public.admin_list_forum_activities(integer)
set search_path = '';

alter function public.admin_list_topics(integer)
set search_path = '';

alter function public.admin_list_users()
set search_path = '';

alter function public.admin_set_topic_status(uuid, text, text)
set search_path = '';

commit;
