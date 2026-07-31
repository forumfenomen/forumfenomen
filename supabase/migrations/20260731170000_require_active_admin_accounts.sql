begin;

/*
 * Admin yetkisi yalnızca:
 * - oturum açmış,
 * - aktif,
 * - admin rolündeki hesaplara verilir.
 *
 * current_account_can_write(), süresi dolmuş
 * askıya alma kayıtlarını otomatik olarak aktif eder.
 */
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not public.current_account_can_write() then
    return false;
  end if;

  return exists (
    select 1
    from public.profiles profile_data
    where profile_data.id = auth.uid()
      and profile_data.account_status = 'active'
      and profile_data.role = 'admin'
  );
end;
$function$;


/*
 * Moderasyon yetkisi yalnızca aktif
 * moderatör ve admin hesaplarına verilir.
 */
create or replace function
  public.is_moderator_or_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not public.current_account_can_write() then
    return false;
  end if;

  return exists (
    select 1
    from public.profiles profile_data
    where profile_data.id = auth.uid()
      and profile_data.account_status = 'active'
      and profile_data.role in (
        'moderator',
        'admin'
      )
  );
end;
$function$;


/*
 * Tarayıcıdan anonim çağrı kapalı tutulur.
 */
revoke execute
on function public.is_admin()
from public, anon;

revoke execute
on function public.is_moderator_or_admin()
from public, anon;

grant execute
on function public.is_admin()
to authenticated;

grant execute
on function public.is_moderator_or_admin()
to authenticated;

commit;
