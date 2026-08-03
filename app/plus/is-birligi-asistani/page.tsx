"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import {
  getForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./page.module.css";

type Theme = "dark" | "light";
type WorkspaceTab =
  | "price"
  | "analyse"
  | "reply";

const translations = {
  tr: {
    backToPlus: "Plus'a dön",
    plusTool: "FORUMFENOMEN PLUS ARACI",
    title: "İş Birliği Asistanı",
    description:
      "Marka iş birliklerinde fiyatını belirle, teklifleri analiz et ve profesyonel yanıtlarını hazırla.",
    priceTab: "Fiyat Hesapla",
    analyseTab: "Teklifi Analiz Et",
    replyTab: "Yanıt Hazırla",
    active: "AKTİF",
    soon: "YAKINDA",
    formTitle: "İş birliği detayları",
    accountAnalysisTitle: "Hesabını otomatik analiz et",
    accountAnalysisDescription:
      "Kullanıcı adını girerek herkese açık performans verilerini analiz et veya hesabını bağlayarak daha güvenilir sonuç al.",
    username: "Kullanıcı adı",
    usernamePlaceholder: "@kullaniciadi",
    analyseAccount: "Hesabı Analiz Et",
    connectAccount: "Hesabımı Bağla",
    manualEntry: "Manuel giriş",
    automaticAnalysis: "Otomatik analiz",
    analysisPreview: "Analiz sonucu burada görünecek",
    analysisPreviewDescription:
      "Takipçi, ortalama izlenme ve etkileşim verileri bulunabildiğinde form alanlarına aktarılacak.",
    publicDataNotice:
      "Kullanıcı adıyla yapılan analiz yalnızca erişilebilen herkese açık verilere dayanır.",
    formDescription:
      "Teklifin kapsamını gir. Hesaplama motoru tüm ayrıntıları birlikte değerlendirecek.",
    platform: "Platform",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    followers: "Takipçi sayısı",
    followersPlaceholder: "Örn. 25.000",
    averageViews: "Ortalama izlenme",
    averageViewsPlaceholder: "Örn. 18.500",
    engagement: "Etkileşim oranı",
    engagementPlaceholder: "Örn. %4,8",
    contentType: "İçerik türü",
    reel: "Reels",
    story: "Story",
    post: "Gönderi",
    video: "Video",
    quantity: "İçerik adedi",
    delivery: "Teslim süresi",
    sevenDays: "7 gün",
    fourteenDays: "14 gün",
    thirtyDays: "30 gün",
    usageTitle: "Kullanım ve reklam hakları",
    organicOnly: "Sadece organik paylaşım",
    paidAds: "Reklamlarda kullanım",
    rawFiles: "Ham görüntü teslimi",
    exclusivity: "Rakip marka kısıtlaması",
    calculate: "Fiyat aralığını hesapla",
    previewLabel: "CANLI ÖNİZLEME",
    previewTitle: "Tahmini iş birliği değeri",
    previewDescription:
      "Bilgileri tamamladığında önerilen fiyat aralığın burada görünecek.",
    recommendedOffer: "Önerilen teklif",
    negotiationRange: "Pazarlık aralığı",
    minimumPrice: "Önerilen alt sınır",
    waiting: "Bilgiler bekleniyor",
    factorsTitle: "Hesaplamaya dahil edilenler",
    factorOne: "Takipçi ve ortalama izlenme ilişkisi",
    factorTwo: "İçerik üretim ve teslim kapsamı",
    factorThree: "Kullanım hakkı ve reklam süresi",
    factorFour: "Münhasırlık ve ham görüntü talepleri",
    notice:
      "Gösterilecek tutarlar kesin piyasa fiyatı değil, karar desteği sağlayan tahmini aralıklardır.",
    howTitle: "Asistan nasıl çalışacak?",
    howOneTitle: "Verilerini gir",
    howOneText:
      "Performansını ve markanın istediği içerikleri belirt.",
    howTwoTitle: "Kapsamı değerlendir",
    howTwoText:
      "Kullanım hakları, teslim süresi ve ek talepler hesaba katılır.",
    howThreeTitle: "Teklifini hazırla",
    howThreeText:
      "Fiyat aralığı ve pazarlık alt sınırı birlikte oluşturulur.",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    createTopic: "Konu Oluştur",
    blog: "Blog",
    profile: "Profil",
    changeTheme: "Temayı değiştir",
  },
  en: {
    backToPlus: "Back to Plus",
    plusTool: "FORUMFENOMEN PLUS TOOL",
    title: "Collaboration Assistant",
    description:
      "Set your pricing, analyse brand offers and prepare professional replies.",
    priceTab: "Calculate Price",
    analyseTab: "Analyse Offer",
    replyTab: "Prepare Reply",
    active: "ACTIVE",
    soon: "COMING SOON",
    formTitle: "Collaboration details",
    accountAnalysisTitle: "Analyse your account automatically",
    accountAnalysisDescription:
      "Enter a username to analyse available public performance data or connect your account for more reliable results.",
    username: "Username",
    usernamePlaceholder: "@username",
    analyseAccount: "Analyse Account",
    connectAccount: "Connect My Account",
    manualEntry: "Manual entry",
    automaticAnalysis: "Automatic analysis",
    analysisPreview: "Analysis results will appear here",
    analysisPreviewDescription:
      "Follower, average-view and engagement data will be transferred into the form when available.",
    publicDataNotice:
      "Username analysis is based only on accessible public information.",
    formDescription:
      "Enter the scope of the offer. The pricing engine will evaluate all details together.",
    platform: "Platform",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    followers: "Follower count",
    followersPlaceholder: "Example: 25,000",
    averageViews: "Average views",
    averageViewsPlaceholder: "Example: 18,500",
    engagement: "Engagement rate",
    engagementPlaceholder: "Example: 4.8%",
    contentType: "Content type",
    reel: "Reels",
    story: "Story",
    post: "Post",
    video: "Video",
    quantity: "Content quantity",
    delivery: "Delivery period",
    sevenDays: "7 days",
    fourteenDays: "14 days",
    thirtyDays: "30 days",
    usageTitle: "Usage and advertising rights",
    organicOnly: "Organic publishing only",
    paidAds: "Paid advertising usage",
    rawFiles: "Raw footage delivery",
    exclusivity: "Competitor exclusivity",
    calculate: "Calculate pricing range",
    previewLabel: "LIVE PREVIEW",
    previewTitle: "Estimated collaboration value",
    previewDescription:
      "Your suggested pricing range will appear here after completing the details.",
    recommendedOffer: "Suggested offer",
    negotiationRange: "Negotiation range",
    minimumPrice: "Suggested minimum",
    waiting: "Waiting for information",
    factorsTitle: "Included in the calculation",
    factorOne: "Follower and average-view relationship",
    factorTwo: "Content production and delivery scope",
    factorThree: "Usage rights and advertising period",
    factorFour: "Exclusivity and raw-footage requests",
    notice:
      "Displayed amounts will be decision-support estimates, not guaranteed market prices.",
    howTitle: "How will the assistant work?",
    howOneTitle: "Enter your data",
    howOneText:
      "Provide your performance and requested content details.",
    howTwoTitle: "Evaluate the scope",
    howTwoText:
      "Usage rights, delivery time and additional requests are assessed.",
    howThreeTitle: "Prepare your offer",
    howThreeText:
      "A pricing range and negotiation minimum are generated together.",
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

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
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

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
      />
      <circle
        cx="17.4"
        cy="6.7"
        r="1"
        className="brandDot"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M14.2 3v11.1a4.6 4.6 0 1 1-3.7-4.5" />
      <path d="M14.2 3c.8 2.8 2.5 4.5 5.3 5.1" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="5.5"
        width="19"
        height="13"
        rx="4"
      />
      <path
        d="m10 9 5 3-5 3V9Z"
        className="brandFill"
      />
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

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
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

export default function CollaborationAssistantPage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [activeTab, setActiveTab] =
    useState<WorkspaceTab>("price");

  const [selectedPlatform, setSelectedPlatform] =
    useState("instagram");

  const [selectedContent, setSelectedContent] =
    useState("reel");

  const [analysisPlatform, setAnalysisPlatform] =
    useState("instagram");

  const [accountUsername, setAccountUsername] =
    useState("");

  const [selectedDelivery, setSelectedDelivery] =
    useState("seven");

  const [usageRights, setUsageRights] = useState({
    organic: true,
    ads: false,
    raw: false,
    exclusivity: false,
  });

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

  function toggleUsage(
    key: keyof typeof usageRights
  ) {
    setUsageRights((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  const t = translations[language];

  const tabs = [
    {
      id: "price" as WorkspaceTab,
      label: t.priceTab,
      icon: <CalculatorIcon />,
      enabled: true,
    },
    {
      id: "analyse" as WorkspaceTab,
      label: t.analyseTab,
      icon: <DocumentIcon />,
      enabled: false,
    },
    {
      id: "reply" as WorkspaceTab,
      label: t.replyTab,
      icon: <MessageIcon />,
      enabled: false,
    },
  ];

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

        <section className={styles.workspaceHero}>
          <div className={styles.heroGlow} />

          <Link
            href="/plus"
            className={styles.backLink}
          >
            <ArrowLeftIcon />
            {t.backToPlus}
          </Link>

          <div className={styles.heroMain}>
            <div className={styles.heroIcon}>
              <SparkleIcon />
            </div>

            <div>
              <span>{t.plusTool}</span>
              <h1>{t.title}</h1>
              <p>{t.description}</p>
            </div>
          </div>
        </section>

        <nav className={styles.toolTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? styles.activeTab
                  : ""
              }
              disabled={!tab.enabled}
              onClick={() => {
                if (tab.enabled) {
                  setActiveTab(tab.id);
                }
              }}
            >
              <span className={styles.tabIcon}>
                {tab.icon}
              </span>

              <span className={styles.tabText}>
                <strong>{tab.label}</strong>
                <small>
                  {tab.enabled
                    ? t.active
                    : t.soon}
                </small>
              </span>

              {!tab.enabled && (
                <LockIcon />
              )}
            </button>
          ))}
        </nav>

        <section className={styles.workspaceGrid}>
          <div className={styles.formCard}>
            <div className={styles.cardHeading}>
              <span>
                <CalculatorIcon />
              </span>

              <div>
                <h2>{t.formTitle}</h2>
                <p>{t.formDescription}</p>
              </div>
            </div>

            <section className={styles.accountAnalysisCard}>
              <div className={styles.analysisHeading}>
                <div className={styles.analysisHeadingIcon}>
                  <SparkleIcon />
                </div>

                <div>
                  <span>{t.automaticAnalysis}</span>
                  <h3>{t.accountAnalysisTitle}</h3>
                  <p>{t.accountAnalysisDescription}</p>
                </div>
              </div>

              <div className={styles.analysisPlatformGrid}>
                {[
                  {
                    id: "instagram",
                    label: t.instagram,
                    icon: <InstagramIcon />,
                  },
                  {
                    id: "tiktok",
                    label: t.tiktok,
                    icon: <TikTokIcon />,
                  },
                  {
                    id: "youtube",
                    label: t.youtube,
                    icon: <YouTubeIcon />,
                  },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    className={
                      analysisPlatform === platform.id
                        ? styles.selectedAnalysisPlatform
                        : ""
                    }
                    onClick={() =>
                      setAnalysisPlatform(platform.id)
                    }
                  >
                    <span>{platform.icon}</span>
                    {platform.label}
                  </button>
                ))}
              </div>

              <div className={styles.usernameRow}>
                <label>
                  <span>{t.username}</span>

                  <input
                    type="text"
                    value={accountUsername}
                    placeholder={t.usernamePlaceholder}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) =>
                      setAccountUsername(event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className={styles.analyseAccountButton}
                  disabled={!accountUsername.trim()}
                >
                  <SparkleIcon />
                  {t.analyseAccount}
                </button>
              </div>

              <div className={styles.analysisResultPlaceholder}>
                <div className={styles.analysisResultIcon}>
                  <DocumentIcon />
                </div>

                <div>
                  <strong>{t.analysisPreview}</strong>
                  <p>{t.analysisPreviewDescription}</p>
                </div>
              </div>

              <div className={styles.analysisFooter}>
                <p>{t.publicDataNotice}</p>

                <button type="button" disabled>
                  {t.connectAccount}
                </button>
              </div>
            </section>

            <div className={styles.manualDivider}>
              <span>{t.manualEntry}</span>
            </div>

            <div className={styles.formSection}>
              <label>{t.platform}</label>

              <div className={styles.optionGridThree}>
                {[
                  {
                    id: "instagram",
                    label: t.instagram,
                    icon: <InstagramIcon />,
                  },
                  {
                    id: "tiktok",
                    label: t.tiktok,
                    icon: <TikTokIcon />,
                  },
                  {
                    id: "youtube",
                    label: t.youtube,
                    icon: <YouTubeIcon />,
                  },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    className={
                      selectedPlatform ===
                      platform.id
                        ? styles.selectedOption
                        : ""
                    }
                    onClick={() =>
                      setSelectedPlatform(
                        platform.id
                      )
                    }
                  >
                    <span>{platform.icon}</span>
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGrid}>
              <label>
                <span>{t.followers}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={
                    t.followersPlaceholder
                  }
                />
              </label>

              <label>
                <span>{t.averageViews}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={
                    t.averageViewsPlaceholder
                  }
                />
              </label>

              <label>
                <span>{t.engagement}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={
                    t.engagementPlaceholder
                  }
                />
              </label>
            </div>

            <div className={styles.formSection}>
              <label>{t.contentType}</label>

              <div className={styles.optionGridFour}>
                {[
                  {
                    id: "reel",
                    label: t.reel,
                  },
                  {
                    id: "story",
                    label: t.story,
                  },
                  {
                    id: "post",
                    label: t.post,
                  },
                  {
                    id: "video",
                    label: t.video,
                  },
                ].map((contentType) => (
                  <button
                    key={contentType.id}
                    type="button"
                    className={
                      selectedContent ===
                      contentType.id
                        ? styles.selectedOption
                        : ""
                    }
                    onClick={() =>
                      setSelectedContent(
                        contentType.id
                      )
                    }
                  >
                    {contentType.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGridTwo}>
              <label>
                <span>{t.quantity}</span>

                <select defaultValue="1">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </label>

              <div className={styles.deliveryField}>
                <span>{t.delivery}</span>

                <div className={styles.deliveryOptions}>
                  {[
                    {
                      id: "seven",
                      label: t.sevenDays,
                    },
                    {
                      id: "fourteen",
                      label: t.fourteenDays,
                    },
                    {
                      id: "thirty",
                      label: t.thirtyDays,
                    },
                  ].map((delivery) => (
                    <button
                      key={delivery.id}
                      type="button"
                      className={
                        selectedDelivery ===
                        delivery.id
                          ? styles.selectedDelivery
                          : ""
                      }
                      onClick={() =>
                        setSelectedDelivery(
                          delivery.id
                        )
                      }
                    >
                      {delivery.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <label>{t.usageTitle}</label>

              <div className={styles.usageGrid}>
                {[
                  {
                    key: "organic" as const,
                    label: t.organicOnly,
                  },
                  {
                    key: "ads" as const,
                    label: t.paidAds,
                  },
                  {
                    key: "raw" as const,
                    label: t.rawFiles,
                  },
                  {
                    key: "exclusivity" as const,
                    label: t.exclusivity,
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={
                      usageRights[option.key]
                        ? styles.selectedUsage
                        : ""
                    }
                    onClick={() =>
                      toggleUsage(option.key)
                    }
                  >
                    <span className={styles.checkbox}>
                      {usageRights[
                        option.key
                      ] && <CheckIcon />}
                    </span>

                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.calculateButton}
              disabled
            >
              <SparkleIcon />
              {t.calculate}
            </button>
          </div>

          <aside className={styles.previewCard}>
            <div className={styles.previewTop}>
              <span>{t.previewLabel}</span>

              <div className={styles.previewPulse}>
                <i />
                {t.waiting}
              </div>
            </div>

            <div className={styles.previewIntro}>
              <div className={styles.previewIcon}>
                <SparkleIcon />
              </div>

              <h2>{t.previewTitle}</h2>
              <p>{t.previewDescription}</p>
            </div>

            <div className={styles.pricePreview}>
              <article>
                <span>
                  {t.recommendedOffer}
                </span>
                <strong>— TL</strong>
              </article>

              <article>
                <span>
                  {t.negotiationRange}
                </span>
                <strong>— / — TL</strong>
              </article>

              <article>
                <span>{t.minimumPrice}</span>
                <strong>— TL</strong>
              </article>
            </div>

            <div className={styles.factorBox}>
              <h3>{t.factorsTitle}</h3>

              {[
                t.factorOne,
                t.factorTwo,
                t.factorThree,
                t.factorFour,
              ].map((factor) => (
                <div key={factor}>
                  <CheckIcon />
                  <span>{factor}</span>
                </div>
              ))}
            </div>

            <p className={styles.notice}>
              {t.notice}
            </p>
          </aside>
        </section>

        <section className={styles.howSection}>
          <div className={styles.sectionHeading}>
            <span>3 ADIM</span>
            <h2>{t.howTitle}</h2>
          </div>

          <div className={styles.howGrid}>
            {[
              {
                number: "01",
                title: t.howOneTitle,
                text: t.howOneText,
              },
              {
                number: "02",
                title: t.howTwoTitle,
                text: t.howTwoText,
              },
              {
                number: "03",
                title: t.howThreeTitle,
                text: t.howThreeText,
              },
            ].map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
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