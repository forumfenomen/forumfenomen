import type { Metadata } from "next";
import Image from "next/image";

import styles from "../site-gate.module.css";

export const metadata: Metadata = {
  title: "ForumFenomen | Test Erişimi",
  robots: {
    index: false,
    follow: false,
  },
};

type TestAccessPageProps = {
  searchParams: Promise<{
    hata?: string;
  }>;
};

export default async function TestAccessPage({
  searchParams,
}: TestAccessPageProps) {
  const params = await searchParams;

  const hasPasswordError =
    params.hata === "sifre";

  const hasSystemError =
    params.hata === "sistem";

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
          YETKİLİ TEST ERİŞİMİ
        </span>

        <h1 className={styles.title}>
          Test alanına giriş
        </h1>

        <p className={styles.description}>
          Bu alan yalnızca ForumFenomen test
          kullanıcıları içindir.
        </p>

        <form
          method="post"
          action="/api/test-access"
          className={styles.form}
        >
          <label className={styles.label}>
            Test şifresi

            <input
              type="password"
              name="password"
              required
              minLength={10}
              autoComplete="current-password"
              className={styles.input}
            />
          </label>

          <button
            type="submit"
            className={styles.button}
          >
            Test alanına gir
          </button>
        </form>

        {hasPasswordError ? (
          <div
            className={styles.error}
            role="alert"
          >
            Test şifresi hatalı.
          </div>
        ) : null}

        {hasSystemError ? (
          <div
            className={styles.error}
            role="alert"
          >
            Test erişimi şu anda kullanılamıyor.
          </div>
        ) : null}

        <p className={styles.note}>
          Erişim bilgilerini yetkisiz kişilerle
          paylaşma.
        </p>
      </section>
    </main>
  );
}