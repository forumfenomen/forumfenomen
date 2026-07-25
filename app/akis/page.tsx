"use client";

import ForumFooter from "@/components/forum-footer";
import SiteSearch from "@/components/site-search";
import { createClient } from "@/lib/supabase/client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getForumLanguage,
  setForumLanguage,
} from "@/lib/forumfenomen-language";

type Language = "tr" | "en";
type Theme = "light" | "dark";

type Post = {
  id?: string;
  icon: string;
  iconClass: string;
  titleTr: string;
  titleEn: string;
  categoryTr: string;
  categoryEn: string;
  author: string;
  timeTr: string;
  timeEn: string;
  comments: string;
  views: string;
};

type TopicRow = {
  id: string;
  title: string;
  created_at: string;
  comment_count: number;
  view_count: number;

  categories: {
    id: number;
    slug: string;
    name: string;

    category_groups: {
      slug: string;
      name: string;
    } | null;
  } | null;

  profiles: {
    display_name: string | null;
    username: string | null;
  } | null;
};

const posts: Post[] = [
  {
    icon: "AI",
    iconClass: "ai",
    titleTr: "Yapay zekâ ile içerik üretmek: Nereden başlamalıyım?",
    titleEn: "Creating content with AI: Where should I start?",
    categoryTr: "Teknoloji",
    categoryEn: "Technology",
    author: "Emre",
    timeTr: "2 saat önce",
    timeEn: "2 hours ago",
    comments: "128",
    views: "1,2 B",
  },
  {
    icon: "◎",
    iconClass: "social",
    titleTr: "Instagram algoritması artık nasıl çalışıyor?",
    titleEn: "How does the Instagram algorithm work now?",
    categoryTr: "Sosyal Medya",
    categoryEn: "Social Media",
    author: "Selin",
    timeTr: "3 saat önce",
    timeEn: "3 hours ago",
    comments: "96",
    views: "980",
  },
  {
    icon: "🎮",
    iconClass: "game",
    titleTr: "En iyi hikâyeli oyunlar için önerilerinizi bekliyorum!",
    titleEn: "What are the best story-driven games?",
    categoryTr: "Oyun",
    categoryEn: "Gaming",
    author: "Mert",
    timeTr: "5 saat önce",
    timeEn: "5 hours ago",
    comments: "75",
    views: "870",
  },
  {
    icon: "▶",
    iconClass: "video",
    titleTr: "YouTube’da büyümenin en etkili yolları",
    titleEn: "The most effective ways to grow on YouTube",
    categoryTr: "Eğitim",
    categoryEn: "Education",
    author: "Ali",
    timeTr: "6 saat önce",
    timeEn: "6 hours ago",
    comments: "64",
    views: "650",
  },
  {
    icon: "#",
    iconClass: "business",
    titleTr: "Freelance çalışmak isteyenler için tavsiyeler",
    titleEn: "Advice for people who want to work freelance",
    categoryTr: "Girişimcilik",
    categoryEn: "Entrepreneurship",
    author: "Zeynep",
    timeTr: "7 saat önce",
    timeEn: "7 hours ago",
    comments: "42",
    views: "320",
  },
  {
    icon: "✈",
    iconClass: "travel",
    titleTr: "Tek başına seyahat edecekler için öneriler",
    titleEn: "Tips for people travelling alone",
    categoryTr: "Seyahat",
    categoryEn: "Travel",
    author: "Deniz",
    timeTr: "8 saat önce",
    timeEn: "8 hours ago",
    comments: "38",
    views: "290",
  },
  {
    icon: "♫",
    iconClass: "music",
    titleTr: "Son zamanlarda keşfettiğiniz en iyi şarkılar",
    titleEn: "The best songs you have discovered recently",
    categoryTr: "Müzik",
    categoryEn: "Music",
    author: "Ece",
    timeTr: "9 saat önce",
    timeEn: "9 hours ago",
    comments: "51",
    views: "410",
  },
];

const categoryVisualMap: Record<
  string,
  {
    icon: string;
    iconClass: string;
  }
> = {
  platformlar: {
    icon: "◎",
    iconClass: "social",
  },

  "icerik-uretimi": {
    icon: "AI",
    iconClass: "ai",
  },

  buyume: {
    icon: "↗",
    iconClass: "social",
  },

  "para-kazanma": {
    icon: "₺",
    iconClass: "business",
  },

  egitim: {
    icon: "▶",
    iconClass: "video",
  },

  yasal: {
    icon: "§",
    iconClass: "business",
  },
};

const subcategoryEnglishMap: Record<
  string,
  string
> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  "yapay-zeka": "Artificial Intelligence",
  "video-edit": "Video Editing",
  "kamera-ekipman": "Camera & Equipment",
  "thumbnail-kapak-tasarimi":
    "Thumbnail & Cover Design",
  seo: "SEO",
  algoritmalar: "Algorithms",
  "hashtag-anahtar-kelimeler":
    "Hashtags & Keywords",
  "viral-analizleri": "Viral Analysis",
  "marka-is-birlikleri":
    "Brand Collaborations",
  ugc: "UGC",
  affiliate: "Affiliate",
  "youtube-para-kazanma":
    "YouTube Monetization",
  "tiktok-para-kazanma":
    "TikTok Monetization",
  "reklam-kurallari":
    "Advertising Rules",
  "vergi-mevzuati":
    "Tax Regulations",
  sozlesmeler: "Contracts",
  "telif-haklari": "Copyright",
};

function formatRelativeTime(
  value: string,
  language: Language
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return language === "tr"
      ? "Az önce"
      : "Just now";
  }

  const differenceInSeconds = Math.round(
    (date.getTime() - Date.now()) / 1000
  );

  const formatter =
    new Intl.RelativeTimeFormat(language, {
      numeric: "auto",
    });

  const absoluteSeconds = Math.abs(
    differenceInSeconds
  );

  if (absoluteSeconds < 60) {
    return language === "tr"
      ? "Az önce"
      : "Just now";
  }

  const differenceInMinutes = Math.round(
    differenceInSeconds / 60
  );

  if (Math.abs(differenceInMinutes) < 60) {
    return formatter.format(
      differenceInMinutes,
      "minute"
    );
  }

  const differenceInHours = Math.round(
    differenceInMinutes / 60
  );

  if (Math.abs(differenceInHours) < 24) {
    return formatter.format(
      differenceInHours,
      "hour"
    );
  }

  const differenceInDays = Math.round(
    differenceInHours / 24
  );

  if (Math.abs(differenceInDays) < 30) {
    return formatter.format(
      differenceInDays,
      "day"
    );
  }

  const differenceInMonths = Math.round(
    differenceInDays / 30
  );

  if (Math.abs(differenceInMonths) < 12) {
    return formatter.format(
      differenceInMonths,
      "month"
    );
  }

  const differenceInYears = Math.round(
    differenceInMonths / 12
  );

  return formatter.format(
    differenceInYears,
    "year"
  );
}

const copy = {
  tr: {
    heroStart: "Keşfet, paylaş,",
    heroAccent: "konuş!",
    slogan: "Fikirler buluşur, fenomenler konuşur.",
    newTopic: "Yeni Konu Aç",
    featured: "Öne Çıkan Konular",
    seeAll: "Tümünü Gör",
    search: "Konu, kullanıcı veya kategori ara...",
    trends: "Güncel Trendler",
    trendsCount: "56 yeni konu",
    popular: "Popüler Tartışmalar",
    popularCount: "32 yeni konu",
    community: "Toplulukta Öne Çıkanlar",
    communityCount: "18 yeni konu",
    following: "Takip Ettiklerin",
    followingCount: "12 yeni konu",
    ad: "REKLAM",
    adTitle: "Markanızı ForumFenomen’de gösterin",
    adText: "Mobil ve masaüstü reklam alanı",
    advertise: "Reklam Ver",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    blog: "Blog",
    profile: "Profil",
    openTopic: "Yeni konu aç",
  },
  en: {
    heroStart: "Discover, share,",
    heroAccent: "connect!",
    slogan: "Ideas meet, phenomena speak.",
    newTopic: "Create New Topic",
    featured: "Featured Topics",
    seeAll: "View All",
    search: "Search topics, users or categories...",
    trends: "Current Trends",
    trendsCount: "56 new topics",
    popular: "Popular Discussions",
    popularCount: "32 new topics",
    community: "Community Highlights",
    communityCount: "18 new topics",
    following: "Following",
    followingCount: "12 new topics",
    ad: "ADVERTISEMENT",
    adTitle: "Show your brand on ForumFenomen",
    adText: "Mobile and desktop advertising space",
    advertise: "Advertise",
    home: "Home",
    categories: "Categories",
    blog: "Blog",
    profile: "Profile",
    openTopic: "Create new topic",
  },
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.8" />
      <path d="m16.2 16.2 4.1 4.1" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
      <path d="M10 21h4" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.5 8.5 0 1 0 20.2 15.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.7" r="1" className="ff-social-dot" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4 19 20M19 4 5 20" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12c0 3.2-.4 5.2-1.2 6-.8.8-3.4 1.2-7.8 1.2S5 18.8 4.2 18C3.4 17.2 3 15.2 3 12s.4-5.2 1.2-6C5 5.2 7.6 4.8 12 4.8s7 .4 7.8 1.2c.8.8 1.2 2.8 1.2 6Z" />
      <path d="m10 9 5 3-5 3V9Z" className="ff-youtube-play" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3v10.2a4.3 4.3 0 1 1-3.7-4.25" />
      <path d="M14 3c.65 3.05 2.35 4.75 5 5.15" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.48A8.5 8.5 0 0 1 7.4 17.6L3 19l1.35-4.15A7.5 7.5 0 1 1 20 11.5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3.5h12v17l-6-3.8-6 3.8v-17Z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6V3Z" />
      <path d="M15 3v5h5M9 12h7M9 16h7" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.7-4.3 3.2-6.5 7.5-6.5s6.8 2.2 7.5 6.5" />
    </svg>
  );
}

function CommunityGraphic() {
  return (
    <svg
      viewBox="0 0 230 190"
      aria-hidden="true"
      className="ff-community-svg"
    >
      <defs>
        <linearGradient
          id="communityGradientOne"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#ed5df4" />
          <stop offset="0.48" stopColor="#a516f4" />
          <stop offset="1" stopColor="#4c4cff" />
        </linearGradient>

        <linearGradient
          id="communityGradientTwo"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#6d38ff" />
          <stop offset="1" stopColor="#08b8f4" />
        </linearGradient>

        <filter id="communityGlow">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="ff-community-lines">
        <path d="M53 114 104 73 172 101" />
        <path d="M104 73 129 142" />
        <path d="M53 114 129 142 172 101" />
      </g>

      <circle
        cx="105"
        cy="85"
        r="57"
        fill="rgba(112,40,255,.08)"
        stroke="rgba(198,75,255,.24)"
      />

      <path
        d="M48 62h88c13 0 23 10 23 23v27c0 13-10 23-23 23H91l-25 19 6-19H48c-13 0-23-10-23-23V85c0-13 10-23 23-23Z"
        fill="url(#communityGradientOne)"
        filter="url(#communityGlow)"
      />

      <path
        d="M124 92h58c12 0 21 9 21 21v19c0 12-9 21-21 21h-12l5 17-23-17h-28c-12 0-21-9-21-21v-19c0-12 9-21 21-21Z"
        fill="url(#communityGradientTwo)"
        opacity=".92"
      />

      <g className="ff-community-dots">
        <circle cx="64" cy="100" r="7" />
        <circle cx="89" cy="100" r="7" />
        <circle cx="114" cy="100" r="7" />
      </g>

      <g className="ff-community-people">
        <circle cx="48" cy="47" r="12" />
        <circle cx="179" cy="59" r="11" />
        <circle cx="151" cy="166" r="10" />
      </g>

      <g className="ff-community-stars">
        <path d="m190 29 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
        <path d="m30 156 1.5 4.5L36 162l-4.5 1.5L30 168l-1.5-4.5L24 162l4.5-1.5L30 156Z" />
      </g>
    </svg>
  );
}

export default function FeedPage() {
  const [language, setLanguage] = useState<Language>("tr");
  const [theme, setTheme] = useState<Theme>("dark");
  const [shared, setShared] = useState(false);

  const [topicPosts, setTopicPosts] =
    useState<Post[]>([]);

  const [topicsLoading, setTopicsLoading] =
    useState(true);

  useEffect(() => {
    const savedLanguage = getForumLanguage();

    const savedTheme = window.localStorage.getItem(
      "forumfenomen-theme"
    );

    if (savedLanguage === "tr" || savedLanguage === "en") {
      setLanguage(savedLanguage);
      setForumLanguage(savedLanguage);
    }

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } else {
      setTheme("dark");
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadTopics() {
      setTopicsLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("topics")
        .select(`
        id,
        title,
        created_at,
        comment_count,
        view_count,
        categories (
          id,
          slug,
          name,
          category_groups (
            slug,
            name
          )
        ),
        profiles (
          display_name,
          username
        )
      `)
        .eq("status", "published")
        .order("is_pinned", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        })
        .limit(20);

      if (!isActive) {
        return;
      }

      if (error) {
        console.error(
          "Akış konuları alınamadı:",
          error.message
        );

        setTopicsLoading(false);
        return;
      }

      const topicRows =
        (data ?? []) as unknown as TopicRow[];

      const nextPosts = topicRows.map(
        (topic) => {
          const groupSlug =
            topic.categories?.category_groups
              ?.slug ?? "";

          const visual =
            categoryVisualMap[groupSlug] ?? {
              icon: "#",
              iconClass: "social",
            };

          const categorySlug =
            topic.categories?.slug ?? "";

          const categoryName =
            topic.categories?.name ??
            (language === "tr"
              ? "Genel"
              : "General");

          const authorName =
            topic.profiles?.display_name?.trim() ||
            topic.profiles?.username
              ?.replace(/^@/, "")
              .trim() ||
            (language === "tr"
              ? "ForumFenomen Üyesi"
              : "ForumFenomen Member");

          return {
            id: topic.id,
            icon: visual.icon,
            iconClass: visual.iconClass,
            titleTr: topic.title,
            titleEn: topic.title,
            categoryTr: categoryName,
            categoryEn:
              subcategoryEnglishMap[
              categorySlug
              ] ?? categoryName,
            author: authorName,
            timeTr: formatRelativeTime(
              topic.created_at,
              "tr"
            ),
            timeEn: formatRelativeTime(
              topic.created_at,
              "en"
            ),
            comments: String(
              topic.comment_count ?? 0
            ),
            views: String(
              topic.view_count ?? 0
            ),
          };
        }
      );

      setTopicPosts(nextPosts);
      setTopicsLoading(false);
    }

    void loadTopics();

    return () => {
      isActive = false;
    };
  }, [language]);

  const toggleTheme = () => {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;

    window.localStorage.setItem(
      "forumfenomen-theme",
      nextTheme
    );
  };

  const shareApp = async () => {
    const shareData = {
      title: "ForumFenomen",
      text:
        language === "tr"
          ? "Keşfet, paylaş, konuş!"
          : "Discover, share, connect!",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.origin
        );

        setShared(true);

        window.setTimeout(() => {
          setShared(false);
        }, 1600);
      }
    } catch {
      // Kullanıcı paylaşma penceresini kapatırsa işlem yapılmaz.
    }
  };
  const t = copy[language];

  const displayPosts =
    topicPosts.length > 0
      ? topicPosts
      : posts;

  return (
    <main className="ff-feed-page">
      <div className="ff-feed-app">
        <header className="ff-feed-header">
          <div className="ff-feed-logo-wrap">
            <Image
              src="/forumfenomen-logo-transparent.png"
              alt="ForumFenomen"
              width={1856}
              height={506}
              priority
              unoptimized
              className="ff-feed-logo"
            />
          </div>

          <div className="ff-feed-header-actions">
            <button
              type="button"
              className="ff-round-action ff-theme-icon-button"
              aria-label={
                theme === "dark"
                  ? "Açık temaya geç"
                  : "Koyu temaya geç"
              }
              title={
                theme === "dark"
                  ? "Açık tema"
                  : "Koyu tema"
              }
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <MoonIcon />
              ) : (
                <SunIcon />
              )}
            </button>
            <button
              type="button"
              className="ff-round-action ff-notification-button"
              aria-label={
                language === "tr"
                  ? "Bildirimler"
                  : "Notifications"
              }
              title={
                language === "tr"
                  ? "Bildirimler"
                  : "Notifications"
              }
            >
              <BellIcon />
            </button>

            <SiteSearch language={language} />

          </div>
        </header>

        <section className="ff-feed-hero">
          <div className="ff-feed-hero-copy">
            <h1>
              {t.heroStart}{" "}
              <span>{t.heroAccent}</span>
            </h1>

            <div className="ff-hero-socials">
              <a
                href="https://www.instagram.com/forumfenomen/"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button instagram"
                aria-label="ForumFenomen Instagram"
                title="Instagram"
              >
                <InstagramIcon />
              </a>

              <a
                href="https://x.com/forumfenomen"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button x"
                aria-label="ForumFenomen X"
                title="X"
              >
                <XIcon />
              </a>

              <a
                href="https://www.youtube.com/@forumfenomen"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button youtube"
                aria-label="ForumFenomen YouTube"
                title="YouTube"
              >
                <YouTubeIcon />
              </a>
              <a
                href="https://www.tiktok.com/@forumfenomen"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button tiktok"
                aria-label="ForumFenomen TikTok"
                title="TikTok"
              >
                <TikTokIcon />
              </a>

              <button
                type="button"
                className={
                  shared
                    ? "ff-hero-social-button share shared"
                    : "ff-hero-social-button share"
                }
                aria-label={
                  language === "tr"
                    ? "ForumFenomen'i paylaş"
                    : "Share ForumFenomen"
                }
                title={
                  shared
                    ? "Bağlantı kopyalandı"
                    : "ForumFenomen'i paylaş"
                }
                onClick={shareApp}
              >
                <ShareIcon />
              </button>
            </div>

            <Link href="/konu-ac" className="ff-new-topic-button">
              <span aria-hidden="true">＋</span>
              {t.newTopic}
            </Link>
          </div>

          <div className="ff-feed-hero-art">
            <div className="ff-hero-orbit" />
            <CommunityGraphic />
          </div>
        </section>

        <section className="ff-featured-section">
          <div className="ff-section-heading">
            <h2>{t.featured}</h2>
            <button type="button">{t.seeAll} ›</button>
          </div>

          <div
            className="ff-topic-list"
            aria-busy={topicsLoading}
          >
            {displayPosts.map((post) => (
              <article
                id={`topic-${post.id ??
                  encodeURIComponent(post.titleTr)
                  }`}
                className="ff-topic-card"
                key={post.id ?? post.titleTr}
              >
                <div className={`ff-topic-icon ${post.iconClass}`}>
                  {post.icon}
                </div>

                <div className="ff-topic-main">
                  <h3>
                    {post.id ? (
                      <Link
                        href={`/konu/${post.id}`}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        {language === "tr"
                          ? post.titleTr
                          : post.titleEn}
                      </Link>
                    ) : (
                      language === "tr"
                        ? post.titleTr
                        : post.titleEn
                    )}
                  </h3>

                  <div className="ff-topic-meta">
                    <span className={`ff-category ${post.iconClass}`}>
                      {language === "tr"
                        ? post.categoryTr
                        : post.categoryEn}
                    </span>

                    <span>{post.author}</span>
                    <i>•</i>

                    <span>
                      {language === "tr"
                        ? post.timeTr
                        : post.timeEn}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="ff-bookmark-button"
                  aria-label="Kaydet"
                >
                  <BookmarkIcon />
                </button>

                <div className="ff-topic-stats">
                  <span>
                    <MessageIcon />
                    {post.comments}
                  </span>

                  <span>
                    <EyeIcon />
                    {post.views}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ff-insight-grid">
          <article>
            <strong>🔥 {t.trends}</strong>
            <span>{t.trendsCount}</span>
          </article>

          <article>
            <strong>↗ {t.popular}</strong>
            <span>{t.popularCount}</span>
          </article>

          <article>
            <strong>👥 {t.community}</strong>
            <span>{t.communityCount}</span>
          </article>

          <article>
            <strong>☆ {t.following}</strong>
            <span>{t.followingCount}</span>
          </article>
        </section>

        <section className="ff-ad-banner">
          <span className="ff-ad-badge">{t.ad}</span>

          <div>
            <strong>{t.adTitle}</strong>
            <p>{t.adText}</p>
          </div>

          <button type="button">{t.advertise}</button>
        </section>
      </div>

      <ForumFooter />


      <nav className="ff-bottom-nav" aria-label="Ana menü">
        <Link href="/akis" className="active">
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
          aria-label={t.openTopic}
        >
          <span className="ff-center-nav-glow" />

          <span className="ff-center-nav-image">
            <Image
              src="/forumfenomen-icon-master.png"
              alt=""
              width={1254}
              height={1254}
              unoptimized
            />
          </span>
        </Link>

        <Link href="/blog">
          <BlogIcon />
          <span>{t.blog}</span>
        </Link>

        <Link href="/profil">
          <ProfileIcon />
          <span>{t.profile}</span>
        </Link>
      </nav>
    </main>
  );
}







