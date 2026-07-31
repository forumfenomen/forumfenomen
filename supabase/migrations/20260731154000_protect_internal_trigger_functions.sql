begin;

/*
 * Bu fonksiyonlar yalnızca PostgreSQL trigger veya
 * event trigger mekanizması tarafından çalıştırılmalıdır.
 *
 * Tarayıcıdaki anon/authenticated istemcilerin bunları
 * doğrudan RPC olarak çağırmasına izin verilmez.
 */
revoke execute
on function public.handle_new_user()
from public, anon, authenticated;

revoke execute
on function public.notify_on_comment_like()
from public, anon, authenticated;

revoke execute
on function public.notify_on_new_comment()
from public, anon, authenticated;

revoke execute
on function public.notify_on_new_follower()
from public, anon, authenticated;

revoke execute
on function public.protect_profile_role()
from public, anon, authenticated;

revoke execute
on function public.rls_auto_enable()
from public, anon, authenticated;

revoke execute
on function public.set_profile_updated_at()
from public, anon, authenticated;

revoke execute
on function public.set_topic_comment_updated_at()
from public, anon, authenticated;

revoke execute
on function public.set_topic_updated_at()
from public, anon, authenticated;

revoke execute
on function public.sync_topic_comment_count()
from public, anon, authenticated;

revoke execute
on function public.update_follow_request_timestamp()
from public, anon, authenticated;

revoke execute
on function public.validate_topic_comment_parent()
from public, anon, authenticated;


/*
 * Postgres rolüyle gelecekte oluşturulan fonksiyonların
 * PUBLIC EXECUTE yetkisiyle otomatik açılmasını engelle.
 *
 * Yeni istemci RPC'lerine gereken yetki migration içinde
 * açıkça grant edilmelidir.
 */
alter default privileges
for role postgres
in schema public
revoke execute on functions
from public;

commit;
