import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/admin-nav";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./admin.module.css";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (claimsError || !userId) {
    redirect("/giris");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(`
        role,
        display_name,
        username
      `)
      .eq("id", userId)
      .maybeSingle();

  if (
    profileError ||
    !profile ||
    !["admin", "moderator"].includes(
      profile.role
    )
  ) {
    redirect("/akis");
  }

  const displayName =
    profile.display_name?.trim() ||
    profile.username?.replace(/^@/, "").trim() ||
    "ForumFenomen Yönetici";

  return (
    <main className={styles.page}>
      <div className={styles.adminShell}>
        <aside className={styles.sidebar}>
          <Link
            href="/admin"
            className={styles.brand}
            aria-label="ForumFenomen Admin"
          >
            <Image
              src="/forumfenomen-logo-transparent.png"
              alt="ForumFenomen"
              width={460}
              height={140}
              priority
            />
          </Link>

          <span className={styles.adminLabel}>
            YÖNETİM PANELİ
          </span>

          <AdminNav />

          <div className={styles.adminUser}>
            <span className={styles.adminAvatar}>
              {displayName
                .slice(0, 1)
                .toLocaleUpperCase("tr-TR")}
            </span>

            <div>
              <strong>{displayName}</strong>
              <small>{profile.role}</small>
            </div>
          </div>

          <Link
            href="/akis"
            className={styles.backLink}
          >
            ← Siteye dön
          </Link>
        </aside>

        <section className={styles.contentArea}>
          {children}
        </section>
      </div>
    </main>
  );
}