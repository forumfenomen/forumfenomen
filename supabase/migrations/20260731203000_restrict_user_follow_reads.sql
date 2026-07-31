begin;

/*
 * Bu migration uygulanmadan ?nce user_follows
 * tablosunda tam olarak bir SELECT politikas?
 * bulunmas?n? bekler.
 *
 * Beklenmeyen politika yap?s?nda i?lem durur.
 */
do $block$
declare
  v_policy_count integer;
  v_policy_name text;
begin
  select
    count(*)::integer,
    min(policyname)
  into
    v_policy_count,
    v_policy_name
  from pg_policies
  where schemaname = 'public'
    and tablename = 'user_follows'
    and cmd = 'SELECT';

  if v_policy_count <> 1 then
    raise exception
      'EXPECTED_ONE_USER_FOLLOWS_SELECT_POLICY_FOUND_%',
      v_policy_count;
  end if;

  execute format(
    'drop policy %I on public.user_follows',
    v_policy_name
  );
end;
$block$;


/*
 * Normal kullan?c? yaln?zca kendisinin taraf
 * oldu?u takip ili?kilerini do?rudan okuyabilir.
 *
 * Ba?ka profillerin listeleri g?venli
 * get_profile_follow_data RPC'sinden gelir.
 */
create policy
  "Users can read own follow relationships"
on public.user_follows
for select
to authenticated
using (
  auth.uid() = follower_id
  or auth.uid() = following_id
  or public.is_moderator_or_admin()
);

revoke select
on table public.user_follows
from public, anon;

grant select
on table public.user_follows
to authenticated, service_role;

commit;
