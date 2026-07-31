begin;

create or replace function
  public.notify_topic_reporter_on_report_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  /*
   * Yeni konu şikâyeti oluşturuldu.
   */
  if tg_op = 'INSERT' then

    insert into public.notifications (
      user_id,
      type,
      title,
      message,
      related_topic_id
    )
    values (
      new.reporter_id,
      'report_received',
      'Şikâyetiniz bize ulaştı',
      'Bildiriminiz moderasyon ekibimize iletildi. İnceleme sürecini 24 saat içinde tamamlamayı hedefliyoruz. Sonuç hakkında tekrar bilgilendirileceksiniz.',
      new.topic_id
    );

    return new;
  end if;

  /*
   * Şikâyetin durumu değişti.
   */
  if old.status is distinct from new.status then

    if new.status = 'reviewing' then

      insert into public.notifications (
        user_id,
        type,
        title,
        message,
        related_topic_id
      )
      values (
        new.reporter_id,
        'report_reviewing',
        'Şikâyetiniz inceleniyor',
        'Moderasyon ekibimiz bildiriminizi değerlendirmeye başladı.',
        new.topic_id
      );

    elsif new.status = 'resolved' then

      insert into public.notifications (
        user_id,
        type,
        title,
        message,
        related_topic_id
      )
      values (
        new.reporter_id,
        'report_resolved',
        'Şikâyetiniz sonuçlandı',
        'Bildiriminiz incelendi ve gerekli moderasyon işlemi uygulandı.',
        new.topic_id
      );

    elsif new.status = 'dismissed' then

      insert into public.notifications (
        user_id,
        type,
        title,
        message,
        related_topic_id
      )
      values (
        new.reporter_id,
        'report_dismissed',
        'Şikâyetiniz incelendi',
        'Yapılan değerlendirmede topluluk kurallarını ihlal eden bir durum tespit edilmedi.',
        new.topic_id
      );

    end if;
  end if;

  return new;
end;
$function$;


/*
 * Aynı isimde eski trigger varsa çift bildirim
 * oluşmasını önlemek için önce kaldır.
 */
drop trigger if exists
  notify_topic_reporter_on_report_change_trigger
on public.topic_reports;

create trigger
  notify_topic_reporter_on_report_change_trigger
after insert or update of status
on public.topic_reports
for each row
execute function
  public.notify_topic_reporter_on_report_change();


/*
 * Fonksiyon yalnızca trigger tarafından çalıştırılır.
 */
revoke execute
on function public.notify_topic_reporter_on_report_change()
from public, anon, authenticated;

commit;
