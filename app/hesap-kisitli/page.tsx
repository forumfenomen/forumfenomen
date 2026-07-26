import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import styles from "./page.module.css";

type AccountAccess = {
  account_status: string;
  suspended_until: string | null;
  moderation_reason: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Istanbul",
    }
  ).format(new Date(value));
}

export default async function RestrictedAccountPage() {
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsData?.claims?.sub ===
    "string"
      ? claimsData.claims.sub
      : null;

  if (!userId) {
    redirect("/giris");
  }

  const { data } = await supabase.rpc(
    "get_current_account_access"
  );

  const account =
    (
      data?.[0] ?? null
    ) as AccountAccess | null;

  if (
    !account ||
    account.account_status === "active"
  ) {
    redirect("/akis");
  }

  const isBanned =
    account.account_status ===
    "banned";

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}>
          {isBanned ? "!" : "⏳"}
        </div>

        <span className={styles.eyebrow}>
          HESAP ERİŞİMİ
        </span>

        <h1>
          {isBanned
            ? "Hesabınız yasaklandı"
            : "Hesabınız geçici olarak askıya alındı"}
        </h1>

        <p className={styles.description}>
          {isBanned
            ? "ForumFenomen topluluk kuralları kapsamında hesabınızın erişimi durduruldu."
            : "Belirlenen askı süresi sona erene kadar ForumFenomen özelliklerini kullanamazsınız."}
        </p>

        {account.moderation_reason ? (
          <div className={styles.infoBox}>
            <span>İşlem sebebi</span>

            <strong>
              {
                account.moderation_reason
              }
            </strong>
          </div>
        ) : null}

        {!isBanned &&
        account.suspended_until ? (
          <div className={styles.infoBox}>
            <span>Askı bitiş tarihi</span>

            <strong>
              {formatDate(
                account.suspended_until
              )}
            </strong>
          </div>
        ) : null}

        <form
          action="/auth/signout"
          method="post"
        >
          <button type="submit">
            Oturumu kapat
          </button>
        </form>
      </section>
    </main>
  );
}