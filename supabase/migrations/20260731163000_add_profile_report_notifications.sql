begin;

create or replace function
  public.notify_profile_reporter_on_report_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  /*
   * Yeni profil şikâyeti oluşturuldu.
   */
  if tg_op = 'INSERT' then

    insert into public.notifications (
      user_id,
      type,
      title,
      message,
      related_user_id
    )
    values (
      new.reporter_id,
      'report_received',
      'Şikâyetiniz bize ulaştı',
      'Bildiriminiz moderasyon ekibimize iletildi. İnceleme sürecini 24 saat içinde tamamlamayı hedefliyoruz. Sonuç hakkında tekrar bilgilendirileceksiniz.',
      new.profile_id
    );

    return new;
  end if;

  /*
   * Sonuçlandı ve reddedildi bildirimleri
   * admin_update_profile_report fonksiyonunda
   * zaten oluşturulmaktadır.
   *
   * Burada yalnızca inceleme aşaması eklenir.
   */
  if old.status is distinct from new.status
     and new.status = 'reviewing' then

    insert into public.notifications (
      user_id,
      type,
      title,
      message,
      related_user_id
    )
    values (
      new.reporter_id,
      'report_reviewing',
      'Şikâyetiniz inceleniyor',
      'Moderasyon ekibimiz bildiriminizi değerlendirmeye başladı.',
      new.profile_id
    );

  end if;

  return new;
end;
$function$;


drop trigger if exists
  notify_profile_reporter_on_report_change_trigger
on public.profile_reports;

create trigger
  notify_profile_reporter_on_report_change_trigger
after insert or update of status
on public.profile_reports
for each row
execute function
  public.notify_profile_reporter_on_report_change();


revoke execute
on function public.notify_profile_reporter_on_report_change()
from public, anon, authenticated;

commit;
