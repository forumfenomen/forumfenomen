"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  getForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";

import styles from "./forum-footer.module.css";

const copy = {
  tr: {
    slogan: "Keşfet, paylaş, konuş!",
    about: "Hakkımızda",
    contact: "İletişim",
    legal: "Yasal Merkez",
    privacy: "Gizlilik",
    cookies: "Çerez Tercihleri",
    rights: "Tüm hakları saklıdır.",
    preparing:
      "Bu sayfa bir sonraki aşamada hazırlanacak.",
  },

  en: {
    slogan: "Discover, share, connect!",
    about: "About Us",
    contact: "Contact",
    legal: "Legal Center",
    privacy: "Privacy",
    cookies: "Cookie Preferences",
    rights: "All rights reserved.",
    preparing:
      "This page will be prepared in the next stage.",
  },
} as const;

export default function ForumFooter() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [notice, setNotice] =
    useState<string | null>(null);

  useEffect(() => {
    setLanguage(getForumLanguage());
  }, []);

  const t = copy[language];

  function showTemporaryNotice(
    pageName: string
  ) {
    setNotice(
      `${pageName}: ${t.preparing}`
    );

    window.setTimeout(() => {
      setNotice(null);
    }, 2400);
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandArea}>
          <Image
            className={styles.logo}
            src="/forumfenomen-logo-transparent.png"
            alt="ForumFenomen"
            width={460}
            height={140}
            sizes="180px"
          />

          <p>{t.slogan}</p>
        </div>

        <nav
          className={styles.links}
          aria-label={
            language === "tr"
              ? "Bilgi ve yasal bağlantılar"
              : "Information and legal links"
          }
        >
          <button
            type="button"
            onClick={() =>
              showTemporaryNotice(
                t.about
              )
            }
          >
            {t.about}
          </button>

          <span aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() =>
              showTemporaryNotice(
                t.contact
              )
            }
          >
            {t.contact}
          </button>

          <span aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() =>
              showTemporaryNotice(
                t.legal
              )
            }
          >
            {t.legal}
          </button>

          <span aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() =>
              showTemporaryNotice(
                t.privacy
              )
            }
          >
            {t.privacy}
          </button>

          <span aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() =>
              showTemporaryNotice(
                t.cookies
              )
            }
          >
            {t.cookies}
          </button>
        </nav>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} ForumFenomen
          <span>·</span>
          {t.rights}
        </div>
      </div>

      {notice && (
        <div
          className={styles.notice}
          role="status"
        >
          {notice}
        </div>
      )}
    </footer>
  );
}
