"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import {
  getForumLanguage,
  setForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./page.module.css";

type Theme = "dark" | "light";

const translations = {
  tr: {
    premiumLabel: "FORUMFENOMEN PLUS",
    title: "Üret, büyü ve iş birliklerini daha güçlü yönet.",
    description:
      "İçerik üreticileri için geliştirilen yapay zekâ destekli profesyonel araçlara tek üyelikle eriş.",
    membershipButton: "Plus Üyeliği Yakında",
    firstTool: "İLK PLUS ARACI",
    assistantTitle: "İş Birliği Asistanı",
    assistantDescription:
      "Marka tekliflerini analiz et, içerik bedelini hesapla ve profesyonel karşı teklifini saniyeler içinde hazırla.",
    priceTitle: "Fiyatını Hesapla",
    priceDescription:
      "İzlenme, etkileşim, içerik türü ve kullanım haklarına göre teklif aralığını oluştur.",
    analyseTitle: "Teklifi Analiz Et",
    analyseDescription:
      "Markanın mesajındaki düşük bütçe, uzun kullanım hakkı ve belirsiz maddeleri tespit et.",
    negotiationTitle: "Pazarlığını Güçlendir",
    negotiationDescription:
      "Profesyonel karşı teklif, e-posta ve DM yanıtlarını hazırla.",
    openAssistant: "Asistanı Aç",
    comingSoon: "YAKINDA",
    upcomingTitle: "Sıradaki Plus araçları",
    hashtagTitle: "Hashtag Stratejisti",
    hashtagDescription:
      "İçeriğine uygun geniş, orta ve niş hashtag setleri oluştur.",
    viralTitle: "Viral İçerik Bulucu",
    viralDescription:
      "Yükselen içerik fırsatlarını ve paylaşım fikirlerini keşfet.",
    profileTitle: "Profil Analizi",
    profileDescription:
      "Profilini, bio metnini ve içerik sunumunu puanla.",
    reelsTitle: "Reels Senaryo Yazarı",
    reelsDescription:
      "Hook, sahne akışı, ekran yazısı ve CTA içeren senaryolar üret.",
    includedTitle: "Plus ile neler açılacak?",
    includedOne: "Yapay zekâ destekli içerik araçları",
    includedTwo: "İş birliği fiyat ve teklif analizleri",
    includedThree: "Kayıtlı analiz ve çalışma geçmişi",
    includedFour: "Yeni Plus araçlarına erken erişim",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    createTopic: "Konu Oluştur",
    blog: "Blog",
    profile: "Profil",
    changeTheme: "Temayı değiştir",
  },
  en: {
    premiumLabel: "FORUMFENOMEN PLUS",
    title: "Create, grow and manage brand collaborations professionally.",
    description:
      "Access AI-powered professional tools developed for creators with a single membership.",
    membershipButton: "Plus Membership Coming Soon",
    firstTool: "FIRST PLUS TOOL",
    assistantTitle: "Collaboration Assistant",
    assistantDescription:
      "Analyse brand offers, calculate content pricing and prepare professional counteroffers in seconds.",
    priceTitle: "Calculate Your Price",
    priceDescription:
      "Create a pricing range based on views, engagement, content type and usage rights.",
    analyseTitle: "Analyse the Offer",
    analyseDescription:
      "Detect low budgets, extensive usage rights and unclear terms in brand messages.",
    negotiationTitle: "Strengthen Negotiations",
    negotiationDescription:
      "Prepare professional counteroffers, emails and direct-message replies.",
    openAssistant: "Open Assistant",
    comingSoon: "COMING SOON",
    upcomingTitle: "Upcoming Plus tools",
    hashtagTitle: "Hashtag Strategist",
    hashtagDescription:
      "Create broad, medium and niche hashtag sets for your content.",
    viralTitle: "Viral Content Finder",
    viralDescription:
      "Discover rising content opportunities and publishing ideas.",
    profileTitle: "Profile Analysis",
    profileDescription:
      "Score your profile, biography and content presentation.",
    reelsTitle: "Reels Script Writer",
    reelsDescription:
      "Generate scripts with hooks, scenes, captions and calls to action.",
    includedTitle: "What will Plus unlock?",
    includedOne: "AI-powered creator tools",
    includedTwo: "Collaboration pricing and offer analysis",
    includedThree: "Saved analysis and work history",
    includedFour: "Early access to new Plus tools",
    home: "Home",
    categories: "Categories",
    createTopic: "Create Topic",
    blog: "Blog",
    profile: "Profile",
    changeTheme: "Change theme",
  },
} as const;

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" />
    </svg>
  );
}

function SearchDocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v6" />
      <path d="M14 3v5h5" />
      <circle cx="15.5" cy="16.5" r="3.5" />
      <path d="m18 19 3 3" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 10v10h13V10" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M4.5 21c.7-5 3.2-7 7.5-7s6.8 2 7.5 7" />
    </svg>
  );
}

export default function PlusPage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem(
        "forumfenomen-theme"
      );

    const resolvedTheme: Theme =
      storedTheme === "light"
        ? "light"
        : "dark";

    setTheme(resolvedTheme);
    document.documentElement.dataset.theme =
      resolvedTheme;

    setLanguage(getForumLanguage());
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(nextTheme);

    document.documentElement.dataset.theme =
      nextTheme;

    window.localStorage.setItem(
      "forumfenomen-theme",
      nextTheme
    );
  }


  const t = translations[language];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className="ff-feed-header">
          <Link
            href="/akis"
            className="ff-feed-logo-wrap"
            aria-label="ForumFenomen"
          >
            <Image
              className="ff-feed-logo"
              src="/forumfenomen-logo-transparent.png"
              alt="ForumFenomen"
              width={460}
              height={140}
              priority
            />
          </Link>

          <div className="ff-feed-header-actions">

            <button
              type="button"
              className="ff-round-action"
              onClick={toggleTheme}
              aria-label={t.changeTheme}
              title={t.changeTheme}
            >
              {theme === "dark" ? (
                <MoonIcon />
              ) : (
                <SunIcon />
              )}
            </button>

            <NotificationBell />

            <SiteSearch language={language} />
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroGlowOne} />
          <div className={styles.heroGlowTwo} />

          <div className={styles.heroContent}>
            <span className={styles.premiumBadge}>
              <SparkleIcon />
              {t.premiumLabel}
            </span>

            <h1>{t.title}</h1>

            <p>{t.description}</p>

            <button
              type="button"
              className={styles.membershipButton}
              disabled
            >
              <SparkleIcon />
              {t.membershipButton}
            </button>
          </div>

          <div className={styles.heroOrb}>
            <span className={styles.orbRingOne} />
            <span className={styles.orbRingTwo} />

            <div className={styles.orbCore}>
              <SparkleIcon />
              <strong>PLUS</strong>
            </div>
          </div>
        </section>

        <section className={styles.assistantCard}>
          <div className={styles.assistantHeader}>
            <div>
              <span>{t.firstTool}</span>
              <h2>{t.assistantTitle}</h2>
              <p>{t.assistantDescription}</p>
            </div>

            <div className={styles.assistantLogo}>
              <SparkleIcon />
            </div>
          </div>

          <div className={styles.featureGrid}>
            <article>
              <span className={styles.featureIcon}>
                <CalculatorIcon />
              </span>

              <div>
                <h3>{t.priceTitle}</h3>
                <p>{t.priceDescription}</p>
              </div>
            </article>

            <article>
              <span className={styles.featureIcon}>
                <SearchDocumentIcon />
              </span>

              <div>
                <h3>{t.analyseTitle}</h3>
                <p>{t.analyseDescription}</p>
              </div>
            </article>

            <article>
              <span className={styles.featureIcon}>
                <MessageIcon />
              </span>

              <div>
                <h3>{t.negotiationTitle}</h3>
                <p>{t.negotiationDescription}</p>
              </div>
            </article>
          </div>

          <Link
            href="/plus/is-birligi-asistani"
            className={styles.assistantButton}
          >
            <SparkleIcon />
            {t.openAssistant}
          </Link>
        </section>

        <section className={styles.includedSection}>
          <div className={styles.sectionHeading}>
            <span>PLUS</span>
            <h2>{t.includedTitle}</h2>
          </div>

          <div className={styles.includedGrid}>
            {[
              t.includedOne,
              t.includedTwo,
              t.includedThree,
              t.includedFour,
            ].map((item) => (
              <article key={item}>
                <span>
                  <CheckIcon />
                </span>

                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.upcomingSection}>
          <div className={styles.sectionHeading}>
            <span>{t.comingSoon}</span>
            <h2>{t.upcomingTitle}</h2>
          </div>

          <div className={styles.upcomingGrid}>
            {[
              {
                title: t.hashtagTitle,
                description:
                  t.hashtagDescription,
                icon: "#",
              },
              {
                title: t.viralTitle,
                description:
                  t.viralDescription,
                icon: "↗",
              },
              {
                title: t.profileTitle,
                description:
                  t.profileDescription,
                icon: "◎",
              },
              {
                title: t.reelsTitle,
                description:
                  t.reelsDescription,
                icon: "▶",
              },
            ].map((tool) => (
              <article key={tool.title}>
                <span className={styles.upcomingIcon}>
                  {tool.icon}
                </span>

                <div>
                  <small>{t.comingSoon}</small>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>

                <LockIcon />
              </article>
            ))}
          </div>
        </section>

        <ForumFooter />
      </div>

      <nav
        className="ff-bottom-nav"
        aria-label="ForumFenomen"
      >
        <Link href="/akis">
          <HomeIcon />
          <span>{t.home}</span>
        </Link>

        <Link href="/kategoriler">
          <GridIcon />
          <span>{t.categories}</span>
        </Link>

        <Link
          href="/konu-ac"
          className="ff-center-nav-button"
          aria-label={t.createTopic}
          title={t.createTopic}
        >
          <span className="ff-center-nav-glow" />

          <span className="ff-center-nav-image">
            <Image
              src="/forumfenomen-icon-master.png"
              alt=""
              fill
              sizes="70px"
              priority
            />
          </span>
        </Link>

        <Link href="/blog">
          <BlogIcon />
          <span>{t.blog}</span>
        </Link>

        <Link href="/profil">
          <UserIcon />
          <span>{t.profile}</span>
        </Link>
      </nav>
    </main>
  );
}