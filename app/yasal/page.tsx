"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import InfoPageShell from "@/components/info-page-shell";
import {
  legalDocuments,
} from "@/components/legal-documents";
import {
  getForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";

import styles from "@/components/info-pages.module.css";

const copy = {
  tr: {
    eyebrow: "Bilgi ve Güvenlik",
    title: "Yasal Merkez",
    description:
      "ForumFenomen’in kullanım, gizlilik, veri güvenliği, topluluk ve moderasyon belgelerine buradan ulaşabilirsin.",

    noticeTitle: "Taslak Yapı",
    noticeText:
      "Sayfaların tasarımı ve belge yapısı hazırlandı. Resmî unvan, iletişim bilgileri ve teknik veri akışları kesinleştirildikten sonra metinler hukuk kontrolünden geçirilerek yayınlanmalıdır.",
  },

  en: {
    eyebrow: "Information and Safety",
    title: "Legal Center",
    description:
      "Access ForumFenomen documents about usage, privacy, data security, community and moderation.",

    noticeTitle: "Draft Structure",
    noticeText:
      "The design and document structure are ready. Texts must be finalized and legally reviewed after the official identity, contact details and technical data flows are confirmed.",
  },
} as const;

export default function LegalCenterPage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  useEffect(() => {
    setLanguage(getForumLanguage());
  }, []);

  const t = copy[language];

  return (
    <InfoPageShell
      language={language}
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      <section className={styles.noticeCard}>
        <h2>{t.noticeTitle}</h2>

        <p>{t.noticeText}</p>
      </section>

      <div className={styles.legalGrid}>
        {legalDocuments.map((document) => (
          <Link
            key={document.key}
            href={document.route}
            className={styles.documentCard}
          >
            <span className={styles.documentIcon}>
              {document.icon}
            </span>

            <div>
              <h2>
                {document.title[language]}
              </h2>

              <p>
                {document.summary[language]}
              </p>
            </div>

            <span
              className={styles.documentArrow}
              aria-hidden="true"
            >
              ›
            </span>
          </Link>
        ))}
      </div>
    </InfoPageShell>
  );
}
