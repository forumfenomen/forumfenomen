"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import InfoPageShell from "@/components/info-page-shell";
import {
  getLegalDocument,
  type LegalDocumentKey,
} from "@/components/legal-documents";
import {
  getForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";

import styles from "@/components/info-pages.module.css";

type Props = {
  documentKey: LegalDocumentKey;
};

const copy = {
  tr: {
    eyebrow: "ForumFenomen Yasal Merkezi",
    draft: "Taslak belge",
    update: "Yayın öncesi hukuk kontrolü gerekir",
    noticeTitle: "Henüz Nihai Metin Değildir",
    notice:
      "Bu sayfa tasarım ve içerik iskeletidir. ForumFenomen’in resmî bilgileri ve kullanılan teknik servisler kesinleştikten sonra belge tamamlanacaktır.",
    back: "Yasal Merkeze Dön",
  },

  en: {
    eyebrow: "ForumFenomen Legal Center",
    draft: "Draft document",
    update: "Legal review required before publication",
    noticeTitle: "Not Yet a Final Document",
    notice:
      "This page is a design and content structure. It will be completed after ForumFenomen's official information and technical services are finalized.",
    back: "Return to Legal Center",
  },
} as const;

export default function LegalDocumentPage({
  documentKey,
}: Props) {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  useEffect(() => {
    setLanguage(getForumLanguage());
  }, []);

  const document =
    getLegalDocument(documentKey);

  if (!document) {
    return null;
  }

  const t = copy[language];

  return (
    <InfoPageShell
      language={language}
      eyebrow={t.eyebrow}
      title={document.title[language]}
      description={document.summary[language]}
    >
      <div className={styles.documentMeta}>
        <span className={styles.draftBadge}>
          {t.draft}
        </span>

        <span className={styles.updateBadge}>
          {t.update}
        </span>
      </div>

      <section className={styles.noticeCard}>
        <h2>{t.noticeTitle}</h2>

        <p>{t.notice}</p>
      </section>

      <div className={styles.documentSections}>
        {document.sections.map(
          (section) => (
            <section
              key={section.title[language]}
              className={styles.documentSection}
            >
              <h2>
                {section.title[language]}
              </h2>

              <p>
                {section.body[language]}
              </p>
            </section>
          )
        )}
      </div>

      <Link
        href="/yasal"
        className={styles.backLink}
      >
        ← {t.back}
      </Link>
    </InfoPageShell>
  );
}
