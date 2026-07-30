/*
 * ForumFenomen
 * Güvenli konu görüntülenme sayacı — Aşama 1
 *
 * Amaç:
 * - Aynı ziyaretçinin aynı konuyu sürekli artırmasını engellemek
 * - Görüntülenme artırma işlemini yalnızca sunucu tarafına açmak
 * - Ham IP, kullanıcı ajanı veya kişisel veri saklamamak
 * - Mevcut increment_topic_view RPC'sini henüz kapatmadan
 *   yeni altyapıyı hazırlamak
 *
 * Bu migration:
 * - topic_view_events tablosunu oluşturur
 * - record_topic_view(uuid, text) fonksiyonunu oluşturur
 * - Yeni fonksiyonu yalnızca service_role rolüne açar
 * - Mevcut increment_topic_view fonksiyonunu değiştirmez
 */

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';


/* =========================================================
   GÖRÜNTÜLENME OLAYLARI
   =========================================================
 *
 * viewer_hash:
 * - Next.js sunucusunda üretilecek SHA-256 HMAC değeridir
 * - Ham IP, cookie veya kullanıcı ajanı saklanmaz
 *
 * viewed_on:
 * - Aynı ziyaretçi + aynı konu + aynı UTC günü için
 *   yalnızca tek kayıt tutulur
 */

create table if not exists public.topic_view_events (
  id bigint
    generated always as identity
    primary key,

  topic_id uuid
    not null
    references public.topics(id)
    on delete cascade,

  viewer_hash text
    not null,

  viewed_on date
    not null
    default (
      timezone(
        'UTC',
        now()
      )::date
    ),

  created_at timestamp with time zone
    not null
    default now(),

  constraint topic_view_events_viewer_hash_check
    check (
      viewer_hash ~ '^[a-f0-9]{64}$'
    ),

  constraint topic_view_events_unique_daily_view
    unique (
      topic_id,
      viewer_hash,
      viewed_on
    )
);


/*
 * İleride eski görüntülenme kayıtlarını temizlerken
 * tarih bazlı işlemleri hızlandırır.
 */

create index if not exists
  topic_view_events_viewed_on_idx
on public.topic_view_events (viewed_on);


/*
 * Tablo doğrudan istemci tarafından okunamaz veya yazılamaz.
 * Yalnızca güvenli SECURITY DEFINER fonksiyonu kullanılır.
 */

alter table public.topic_view_events
  enable row level security;

revoke all
on table public.topic_view_events
from public, anon, authenticated;


/* =========================================================
   GÜVENLİ GÖRÜNTÜLENME FONKSİYONU
   =========================================================
 *
 * Fonksiyon:
 * - Yalnızca published konuları kabul eder
 * - viewer_hash formatını doğrular
 * - Aynı UTC günündeki tekrarları saymaz
 * - İlk geçerli kayıtta topics.view_count değerini artırır
 * - Tekrarda mevcut sayıyı değiştirmeden döndürür
 */

create or replace function public.record_topic_view(
  p_topic_id uuid,
  p_viewer_hash text
)
returns bigint
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_current_view_count bigint;
  v_inserted_event_id bigint;
begin
  if p_topic_id is null then
    raise exception 'INVALID_TOPIC_ID';
  end if;

  if
    p_viewer_hash is null
    or p_viewer_hash !~ '^[a-f0-9]{64}$'
  then
    raise exception 'INVALID_VIEWER_HASH';
  end if;

  /*
   * Konu satırını kilitle:
   * Aynı anda gelen iki geçerli isteğin sayaç üzerinde
   * yarışmasını engeller.
   */
  select
    coalesce(t.view_count, 0)
  into
    v_current_view_count
  from public.topics t
  where
    t.id = p_topic_id
    and t.status = 'published'
  for update;

  /*
   * Konu yoksa veya published değilse bilgi sızdırmadan
   * sıfır döndür.
   */
  if not found then
    return 0::bigint;
  end if;

  /*
   * Aynı ziyaretçinin aynı UTC günündeki tekrar isteği
   * unique constraint nedeniyle yeni kayıt oluşturmaz.
   */
  insert into public.topic_view_events (
    topic_id,
    viewer_hash
  )
  values (
    p_topic_id,
    p_viewer_hash
  )
  on conflict (
    topic_id,
    viewer_hash,
    viewed_on
  )
  do nothing
  returning id
  into v_inserted_event_id;

  /*
   * Yeni olay oluştuysa sayaç bir artırılır.
   */
  if v_inserted_event_id is not null then
    update public.topics
    set view_count =
      coalesce(view_count, 0) + 1
    where id = p_topic_id
      and status = 'published'
    returning view_count
    into v_current_view_count;
  end if;

  return coalesce(
    v_current_view_count,
    0
  );
end;
$function$;


/*
 * PostgreSQL fonksiyonları varsayılan olarak PUBLIC
 * çalıştırma izni alabileceği için izinleri açıkça kapat.
 */

revoke execute
on function public.record_topic_view(
  uuid,
  text
)
from public, anon, authenticated;


/*
 * Fonksiyon yalnızca Supabase secret key kullanan
 * sunucu istemcisi tarafından çağrılabilir.
 */

grant execute
on function public.record_topic_view(
  uuid,
  text
)
to service_role;


comment on table public.topic_view_events is
  'Günlük tekilleştirilmiş konu görüntülenme olayları. Ham ziyaretçi verisi saklanmaz.';

comment on function public.record_topic_view(
  uuid,
  text
) is
  'Yalnızca server-side service_role tarafından çağrılan tekilleştirilmiş konu görüntülenme sayacı.';


commit;


/* =========================================================
   MIGRATION SONRASI DOĞRULAMA
   ========================================================= */

select
  c.relname as table_name,

  c.relrowsecurity as rls_enabled,

  (
    select count(*)
    from pg_policies policy_data
    where policy_data.schemaname = 'public'
      and policy_data.tablename =
          'topic_view_events'
  ) as policy_count

from pg_class c

inner join pg_namespace n
  on n.oid = c.relnamespace

where
  n.nspname = 'public'
  and c.relname = 'topic_view_events';


select
  p.proname as function_name,

  pg_get_function_identity_arguments(
    p.oid
  ) as arguments,

  case
    when p.prosecdef
      then 'SECURITY DEFINER'
    else 'SECURITY INVOKER'
  end as security_mode,

  array_to_string(
    p.proconfig,
    ', '
  ) as function_settings,

  has_function_privilege(
    'anon',
    p.oid,
    'EXECUTE'
  ) as anon_can_execute,

  has_function_privilege(
    'authenticated',
    p.oid,
    'EXECUTE'
  ) as authenticated_can_execute,

  has_function_privilege(
    'service_role',
    p.oid,
    'EXECUTE'
  ) as service_role_can_execute

from pg_proc p

inner join pg_namespace n
  on n.oid = p.pronamespace

where
  n.nspname = 'public'
  and p.proname = 'record_topic_view'
  and pg_get_function_identity_arguments(
    p.oid
  ) = 'p_topic_id uuid, p_viewer_hash text';