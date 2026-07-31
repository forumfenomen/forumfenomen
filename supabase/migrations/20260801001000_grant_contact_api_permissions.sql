begin;

grant select, insert
on table public.contact_messages
to service_role;

commit;
