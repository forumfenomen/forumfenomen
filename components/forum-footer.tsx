"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getForumLanguage,
  subscribeForumLanguage,
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
  },

  en: {
    slogan: "Discover, share, connect!",
    about: "About Us",
    contact: "Contact",
    legal: "Legal Center",
    privacy: "Privacy",
    cookies: "Cookie Preferences",
    rights: "All rights reserved.",
  },
} as const;

export default function ForumFooter() {
  const pathname = usePathname();

  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  useEffect(() => {
    setLanguage(getForumLanguage());

    return subscribeForumLanguage(
      setLanguage
    );
  }, []);

  const t = copy[language];

  return (
    <footer
      className={`${styles.footer} ${pathname === "/akis"
        ? styles.homeFooter
        : ""
        } 
        }`}
    >
      <div className={styles.inner}>
        <div className={styles.brandArea}>
          <Image
            className={styles.logo}
            src="/forumfenomen-logo-transparent.png"
            alt="ForumFenomen"
            width={460}
            height={140}
            sizes="220px"
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
          <Link
            className={styles.footerLink}
            href="/hakkimizda"
          >
            {t.about}
          </Link>

          <span aria-hidden="true">•</span>

          <Link
            className={styles.footerLink}
            href="/iletisim"
          >
            {t.contact}
          </Link>

          <span aria-hidden="true">•</span>

          <Link
            className={styles.footerLink}
            href="/yasal"
          >
            {t.legal}
          </Link>

          <span aria-hidden="true">•</span>

          <Link
            className={styles.footerLink}
            href="/yasal/gizlilik"
          >
            {t.privacy}
          </Link>

          <span aria-hidden="true">•</span>

          <Link
            className={styles.footerLink}
            href="/yasal/cerez-politikasi"
          >
            {t.cookies}
          </Link>
        </nav>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} ForumFenomen

          <span>·</span>

          {t.rights}
        </div>
      </div>
    </footer>
  );
}
