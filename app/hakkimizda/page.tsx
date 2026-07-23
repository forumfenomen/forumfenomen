"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import InfoPageShell from "@/components/info-page-shell";
import {
  getForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";

import styles from "@/components/info-pages.module.css";

const copy = {
  tr: {
    eyebrow: "ForumFenomen",
    title: "Hakkımızda",
    description:
      "İçerik üreticilerinin fikirlerini, deneyimlerini ve bilgilerini güvenli bir toplulukta buluşturuyoruz.",

    cards: [
      {
        title: "Neden ForumFenomen?",
        text:
          "Sosyal medya platformları hızla değişiyor. ForumFenomen, içerik üreticilerinin gerçek deneyimlerden öğrenebileceği kalıcı bir bilgi alanı oluşturmak için tasarlandı.",
      },
      {
        title: "Kimler İçin?",
        text:
          "Yeni başlayanlardan profesyonel içerik üreticilerine, UGC üreticilerinden marka yöneticilerine kadar sosyal medya ekosistemindeki herkese açıktır.",
      },
      {
        title: "Topluluk Yaklaşımımız",
        text:
          "Saygılı tartışmayı, kaynak gösterilen bilgiyi, şeffaflığı ve üyelerin birbirine yardımcı olduğu sağlıklı bir topluluk kültürünü destekliyoruz.",
      },
      {
        title: "Gelecek Planımız",
        text:
          "Forum yapısının ardından eğitim programları, içerik üretici araçları ve mobil uygulama deneyimi geliştirmeyi hedefliyoruz.",
      },
    ],

    valuesTitle: "Değerlerimiz",
    valuesText:
      "ForumFenomen’de içeriklerin faydalı, anlaşılır, güvenli ve topluluğa değer katan nitelikte olmasını önemsiyoruz.",

    tags: [
      "Bilgi paylaşımı",
      "Güvenli topluluk",
      "İçerik üretimi",
      "Şeffaflık",
      "Birlikte büyüme",
    ],

    contact: "İletişime Geç",
    legal: "Yasal Merkezi Görüntüle",
  },

  en: {
    eyebrow: "ForumFenomen",
    title: "About Us",
    description:
      "We bring creators' ideas, experiences and knowledge together in a safe community.",

    cards: [
      {
        title: "Why ForumFenomen?",
        text:
          "Social platforms change quickly. ForumFenomen is designed to create a permanent knowledge space where creators can learn from real experiences.",
      },
      {
        title: "Who Is It For?",
        text:
          "It is open to everyone in the social media ecosystem, from beginners and professional creators to UGC creators and brand managers.",
      },
      {
        title: "Our Community Approach",
        text:
          "We support respectful discussion, sourced information, transparency and a healthy community culture where members help one another.",
      },
      {
        title: "Our Future",
        text:
          "After the forum experience, we aim to develop training programs, creator tools and a mobile application.",
      },
    ],

    valuesTitle: "Our Values",
    valuesText:
      "We care about content being useful, understandable, safe and valuable to the community.",

    tags: [
      "Knowledge sharing",
      "Safe community",
      "Content creation",
      "Transparency",
      "Growing together",
    ],

    contact: "Contact Us",
    legal: "View Legal Center",
  },
} as const;

export default function AboutPage() {
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
      <div className={styles.grid}>
        {t.cards.map((card, index) => (
          <article
            key={card.title}
            className={styles.card}
          >
            <span className={styles.cardNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>

            <h2>{card.title}</h2>

            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <section className={styles.wideCard}>
        <h2>{t.valuesTitle}</h2>

        <p>{t.valuesText}</p>

        <div className={styles.tagList}>
          {t.tags.map((tag) => (
            <span key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.actionRow}>
          <Link
            href="/iletisim"
            className={styles.primaryButton}
          >
            {t.contact}
          </Link>

          <Link
            href="/yasal"
            className={styles.secondaryButton}
          >
            {t.legal}
          </Link>
        </div>
      </section>
    </InfoPageShell>
  );
}
