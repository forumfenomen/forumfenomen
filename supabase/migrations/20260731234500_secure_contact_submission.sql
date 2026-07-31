begin;

alter table public.contact_messages
add column if not exists ip_hash text;

create index if not exists
  contact_messages_ip_hash_created_at_idx
on public.contact_messages (
  ip_hash,
  created_at desc
)
where ip_hash is not null;

create index if not exists
  contact_messages_email_created_at_idx
on public.contact_messages (
  lower(email),
  created_at desc
);

revoke execute
on function public.submit_contact_message(
  text,
  text,
  text,
  text,
  text
)
from public, anon, authenticated, service_role;

commit;
