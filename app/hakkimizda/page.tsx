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
      "İçerik üreticilerinin birbirinden öğrendiği, deneyimlerini paylaştığı ve birlikte büyüdüğü bir topluluk oluşturuyoruz.",

    cards: [
      {
        title: "Neden ForumFenomen?",
        text:
          "Bir yerden başlamak zor, değil mi? O hissi çok iyi biliyoruz. İşte tam da bu yüzden içerik üreticilerinin birbirine destek olduğu, deneyimlerini paylaştığı ve birlikte büyüdüğü bir alan olan ForumFenomen’i kurduk. Hepimiz bir gün aynı soruların cevabını bulmak için saatlerce internette dolaştık. Şimdi ise Instagram’da, TikTok’ta ve YouTube’da içerik üreten ya da üretmeye başlamak isteyen herkesin kendini ait hissedebileceği bir buluşma noktası olmayı hedefliyoruz.",
      },
      {
        title: "Topluluk Yaklaşımımız",
        text:
          "Amacımız basit: Birbirimizden öğrenmek, deneyimlerimizi paylaşmak ve birlikte büyümek. Marka iş birliklerinin nasıl kurulduğundan algoritmaların nasıl işlediğine, video çekim ve kurgu tekniklerinden SEO ipuçlarına, yasal süreçlerden içerik üretiminin tüm inceliklerine kadar influencer dünyasına dair birçok konuyu birlikte konuşuyoruz. Bu platformda soru sormak, fikir paylaşmak ve birbirimize destek olmak en değerli şeylerden biri.",
      },
      {
        title: "Kimler İçin?",
        text:
          "UGC üreticileri, influencer adayları, deneyimli içerik üreticileri ve dijital dünyada kendini geliştirmek isteyen herkes için buradayız. Çünkü burada seviye fark etmiyor; yeni başlayan da yıllardır bu işin içinde olan da aynı çatı altında buluşuyor. Önemli olan paylaşmaya ve birlikte büyümeye istekli olman. Unutma, sosyal medyadaki tatlı rekabet hepimize yeter. :)",
      },
      {
        title: "Gelecek Planımız",
        text:
          "ForumFenomen’i yalnızca bir forum değil, içerik üreticilerinin birlikte geliştiği güçlü bir topluluk hâline getirmek istiyoruz. Zamanla daha fazla eğitim, rehber içerik, etkinlik ve faydalı kaynak sunarak içerik üreticilerinin ihtiyaç duyduğu ilk adreslerden biri olmayı hedefliyoruz.",
      },
    ],

    valuesTitle: "Birlikte Yol Alalım",
    valuesText:
      "Sen bir şey öğrenirken belki de başkasına ilham olacaksın. Nitekim senin de paylaşacak, öğretecek ve katkı sağlayacak bir deneyimin var. Sen de aramıza katıl, birlikte yol alalım. ♥️",

    tags: [
      "Bilgi paylaşımı",
      "Karşılıklı destek",
      "İçerik üretimi",
      "Deneyim paylaşımı",
      "Birlikte büyüme",
    ],

    contact: "İletişime Geç",
    legal: "Yasal Merkezi Görüntüle",
  },

  en: {
    eyebrow: "ForumFenomen",
    title: "About Us",
    description:
      "We are building a community where content creators learn from one another, share their experiences and grow together.",

    cards: [
      {
        title: "Why ForumFenomen?",
        text:
          "Getting started is difficult, isn’t it? We know that feeling very well. That is exactly why we created ForumFenomen: a space where content creators support one another, share their experiences and grow together. At some point, all of us have spent hours searching online for answers to the same questions. Today, we aim to become a meeting place where everyone who creates content—or wants to start creating—on Instagram, TikTok or YouTube can feel that they belong.",
      },
      {
        title: "Our Community Approach",
        text:
          "Our goal is simple: to learn from one another, share our experiences and grow together. From building brand partnerships and understanding algorithms to video production, editing techniques, SEO tips, legal processes and every detail of content creation, we discuss a wide range of topics from the creator world together. Asking questions, sharing ideas and supporting one another are among the things we value most on this platform.",
      },
      {
        title: "Who Is It For?",
        text:
          "We are here for UGC creators, aspiring influencers, experienced content creators and everyone who wants to grow in the digital world. Experience level does not matter here; beginners and people who have been in the industry for years meet under the same roof. What matters is your willingness to share and grow together. Remember, there is enough friendly competition on social media for all of us. :)",
      },
      {
        title: "Our Future Plans",
        text:
          "We want ForumFenomen to become more than a forum: a strong community where content creators develop together. Over time, we aim to provide more training, guides, events and useful resources, and to become one of the first places creators turn to when they need support.",
      },
    ],

    valuesTitle: "Let’s Move Forward Together",
    valuesText:
      "While you are learning something, you may inspire someone else. You also have experiences worth sharing, teaching and contributing. Join us and let’s move forward together. ♥️",

    tags: [
      "Knowledge sharing",
      "Mutual support",
      "Content creation",
      "Experience sharing",
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