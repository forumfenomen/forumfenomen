begin;

-- Aggregate feed metrics are intentionally readable by visitors,
-- but must not inherit access through PostgreSQL PUBLIC.

alter function public.get_feed_topic_metrics()
    set search_path to '';

revoke all privileges
on function public.get_feed_topic_metrics()
from public;

grant execute
on function public.get_feed_topic_metrics()
to anon, authenticated, service_role;


-- Published topic save counts may be read publicly,
-- but direct PUBLIC inheritance is unnecessary.

alter function public.get_topic_save_count(uuid)
    set search_path to '';

revoke all privileges
on function public.get_topic_save_count(uuid)
from public;

grant execute
on function public.get_topic_save_count(uuid)
to anon, authenticated, service_role;


-- Keep reaction summaries available through explicitly allowed roles only.

revoke all privileges
on function public.get_topic_reaction_summary(uuid)
from public;

grant execute
on function public.get_topic_reaction_summary(uuid)
to anon, authenticated, service_role;


-- Anonymous contact form access is intentional.
-- Remove implicit PUBLIC access and grant only explicit application roles.

revoke all privileges
on function public.submit_contact_message(
    text,
    text,
    text,
    text,
    text
)
from public;

grant execute
on function public.submit_contact_message(
    text,
    text,
    text,
    text,
    text
)
to anon, authenticated, service_role;

commit;
