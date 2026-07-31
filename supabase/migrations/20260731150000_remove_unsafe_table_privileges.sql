begin;

/*
 * İstemci rollerinin tablo yapısını değiştirmesine,
 * trigger oluşturmasına veya tabloları TRUNCATE
 * etmesine izin verilmemeli.
 *
 * Normal SELECT / INSERT / UPDATE / DELETE
 * işlemleri korunur.
 */
revoke truncate, trigger, references
on all tables in schema public
from public, anon, authenticated;

/*
 * Gelecekte postgres rolüyle oluşturulan tablolara
 * bu tehlikeli yetkilerin tekrar otomatik verilmesini
 * engelle.
 */
alter default privileges
for role postgres
in schema public
revoke truncate, trigger, references
on tables
from public, anon, authenticated;

commit;
