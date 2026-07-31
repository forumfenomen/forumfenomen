begin;

/*
 * Uygulamadaki tüm public_profiles view sorguları
 * güvenli RPC fonksiyonlarına taşındı.
 *
 * View önceki denemede kaldırılmış olsa bile
 * migration hata vermeden kaydedilir.
 */

drop view if exists public.public_profiles;

commit;