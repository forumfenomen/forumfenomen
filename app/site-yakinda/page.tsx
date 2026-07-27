import type { Metadata } from "next";
import Image from "next/image";

import styles from "../site-gate.module.css";

export const metadata: Metadata = {
  title: "ForumFenomen | Çok Yakında",
  description:
    "ForumFenomen yayın hazırlıklarını sürdürüyor.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SiteComingSoonPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Image
          src="/forumfenomen-logo-transparent.png"
          alt="ForumFenomen"
          width={460}
          height={140}
          priority
          className={styles.logo}
        />

        <span className={styles.eyebrow}>
          YAYIN HAZIRLIĞI
        </span>

        <h1 className={styles.title}>
          Çok yakında buradayız.
        </h1>

        <p className={styles.description}>
          ForumFenomen daha güvenli, daha güçlü
          ve daha kullanışlı bir topluluk deneyimi
          için hazırlanıyor.
        </p>
      </section>
    </main>
  );
}