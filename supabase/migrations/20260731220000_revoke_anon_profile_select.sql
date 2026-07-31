begin;

-- Anonymous visitors must not query the base profiles table directly.
-- Public profile data is served through controlled views and RPC functions.

revoke select
on table public.profiles
from anon;

commit;
