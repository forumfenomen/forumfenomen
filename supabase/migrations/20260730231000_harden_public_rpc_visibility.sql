/*
 * ForumFenomen
 * Public RPC görünürlük güvenliği
 *
 * Güçlendirilen fonksiyonlar:
 * - get_topic_save_count(uuid)
 * - search_public_profiles(text, integer)
 *
 * Amaç:
 * - Yayınlanmamış veya erişilemeyen konuların kaydetme
 *   sayısının dışarı sızmasını engellemek
 * - Askıya alınmış, yasaklanmış veya gizli profillerin
 *   genel kullanıcı aramasında görünmesini engellemek
 *
 * Uyumluluk:
 * - Fonksiyon isimleri değişmez
 * - Parametreler değişmez
 * - Dönüş tipleri değişmez
 * - Mevcut Next.js RPC çağrıları bozulmaz
 * - RLS ve tablo policy’leri değiştirilmez
 */

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';


/* =========================================================
   KONU KAYDETME SAYISI
   =========================================================
 *
 * Anonim kullanıcı:
 * - Yalnızca published konuların sayısını görebilir.
 *
 * Giriş yapan konu sahibi:
 * - Kendi yayınlanmamış konusunun sayısını da görebilir.
 *
 * Erişilemeyen veya bulunmayan konu:
 * - 0 döndürülür.
 */

create or replace function public.get_topic_save_count(
  p_topic_id uuid
)
returns bigint
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    case
      when exists (
        select 1
        from public.topics t
        where t.id = p_topic_id
          and (
            t.status = 'published'
            or (
              auth.uid() is not null
              and t.author_id = auth.uid()
            )
          )
      )
      then (
        select count(*)::bigint
        from public.saved_topics st
        where st.topic_id = p_topic_id
      )
      else 0::bigint
    end;
$function$;


/* =========================================================
   GENEL PROFİL ARAMASI
   =========================================================
 *
 * Arama sonucuna yalnızca:
 * - account_status = active
 * - profile_visibility = public
 * profiller dahil edilir.
 *
 * Sonuç sınırı:
 * - En az 1
 * - En fazla 20
 *
 * Kullanıcının yazdığı % ve _ karakterleri wildcard olarak
 * değil, normal arama karakterleri olarak değerlendirilir.
 */

create or replace function public.search_public_profiles(
  p_query text,
  p_limit integer default 10
)
returns table (
  id uuid,
  display_name text,
  username text,
  avatar_url text
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_query text;
  v_escaped_query text;
  v_limit integer;
begin
  v_query := trim(
    coalesce(p_query, '')
  );

  if char_length(v_query) < 2 then
    return;
  end if;

  /*
   * ILIKE içinde kullanıcı girdisinin wildcard olarak
   * çalışmasını engelle.
   */
  v_escaped_query :=
    replace(v_query, '\', '\\');

  v_escaped_query :=
    replace(v_escaped_query, '%', '\%');

  v_escaped_query :=
    replace(v_escaped_query, '_', '\_');

  v_limit := greatest(
    1,
    least(
      coalesce(p_limit, 10),
      20
    )
  );

  return query
  select
    p.id,
    p.display_name,
    p.username,
    p.avatar_url
  from public.profiles p
  where
    p.account_status = 'active'
    and p.profile_visibility = 'public'
    and p.username is not null
    and (
      p.username ilike
        '%' || v_escaped_query || '%'
        escape '\'

      or coalesce(
        p.display_name,
        ''
      ) ilike
        '%' || v_escaped_query || '%'
        escape '\'
    )
  order by
    case
      when lower(p.username) =
           lower(v_query)
        then 0

      when lower(p.username) like
           lower(v_escaped_query) || '%'
           escape '\'
        then 1

      when lower(
        coalesce(
          p.display_name,
          ''
        )
      ) like
        lower(v_escaped_query) || '%'
        escape '\'
        then 2

      else 3
    end,
    p.username
  limit v_limit;
end;
$function$;


commit;


/* =========================================================
   MIGRATION SONRASI DOĞRULAMA
   Beklenen sonuç: 2 satır
   ========================================================= */

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
  ) as authenticated_can_execute

from pg_proc p

inner join pg_namespace n
  on n.oid = p.pronamespace

where
  n.nspname = 'public'
  and (
    (
      p.proname = 'get_topic_save_count'
      and pg_get_function_identity_arguments(
        p.oid
      ) = 'p_topic_id uuid'
    )
    or
    (
      p.proname = 'search_public_profiles'
      and pg_get_function_identity_arguments(
        p.oid
      ) = 'p_query text, p_limit integer'
    )
  )

order by p.proname;