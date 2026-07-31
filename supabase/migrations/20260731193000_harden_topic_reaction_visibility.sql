begin;

drop policy if exists
  "Topic reactions are publicly readable"
on public.topic_reactions;

create policy
  "Users can read own topic reactions"
on public.topic_reactions
for select
to authenticated
using (
  auth.uid() = user_id
);

revoke select
on table public.topic_reactions
from public, anon;

grant select
on table public.topic_reactions
to authenticated, service_role;

commit;
