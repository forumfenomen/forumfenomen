"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

import {
  getForumLanguage,
  setForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";
import { createClient } from "@/lib/supabase/client";

type Theme = "dark" | "light";

type CategoryId =
  | "platforms"
  | "content"
  | "growth"
  | "money"
  | "education"
  | "legal";

type TabId = "popular" | "new" | "following";

type LocalizedText = {
  tr: string;
  en: string;
};

type Subcategory = {
  id: string;
  databaseId?: number;
  slug?: string;
  label: LocalizedText;
};

type CategoryDefinition = {
  id: CategoryId;
  databaseId?: number;
  slug?: string;
  title: LocalizedText;
  description: LocalizedText;
  accent: string;
  icon: ReactNode;
  subcategories: Subcategory[];
};

type Topic = {
  id: number | string;
  category: CategoryId;
  subcategoryId: string;
  title: LocalizedText;
  tag: LocalizedText;
  author: string;
  createdAt?: string;
  ageHours?: number;
  comments: number;
  views: number;
  followed: boolean;
};

type TopicRow = {
  id: string;
  author_id: string | null;
  content_profile_id: string | null;
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

type CategoryGroupRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

type CategoryRow = {
  id: number;
  group_id: number;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

const categoryGroupMap: Record<
  string,
  CategoryId
> = {
  platformlar: "platforms",
  "icerik-uretimi": "content",
  buyume: "growth",
  "para-kazanma": "money",
  egitim: "education",
  yasal: "legal",
};

const subcategoryIdMap: Record<
  string,
  string
> = {
  instagram: "instagram",
  tiktok: "tiktok",
  youtube: "youtube",

  "yapay-zeka": "ai",
  "video-edit": "video-edit",
  "kamera-ekipman": "camera",
  "thumbnail-kapak-tasarimi": "thumbnail",

  seo: "seo",
  algoritmalar: "algorithms",
  "hashtag-anahtar-kelimeler": "hashtags",
  "viral-analizleri": "viral",

  "marka-is-birlikleri": "brand-deals",
  ugc: "ugc",
  affiliate: "affiliate",
  "youtube-para-kazanma": "youtube-money",
  "tiktok-para-kazanma": "tiktok-money",

  "reklam-kurallari": "ad-rules",
  "vergi-mevzuati": "tax",
  sozlesmeler: "contracts",
  "telif-haklari": "copyright",
};

const topicVisualMap: Record<
  CategoryId,
  {
    icon: string;
    iconClass: string;
  }
> = {
  platforms: {
    icon: "◎",
    iconClass: "social",
  },
  content: {
    icon: "AI",
    iconClass: "ai",
  },
  growth: {
    icon: "↗",
    iconClass: "social",
  },
  money: {
    icon: "₺",
    iconClass: "business",
  },
  education: {
    icon: "▶",
    iconClass: "video",
  },
  legal: {
    icon: "§",
    iconClass: "business",
  },
};

function formatRelativeTime(
  value: string,
  language: ForumLanguage
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return language === "tr"
      ? "Az önce"
      : "Just now";
  }

  const elapsedMilliseconds =
    Date.now() - date.getTime();

  const elapsedMinutes = Math.max(
    0,
    Math.floor(
      elapsedMilliseconds / (1000 * 60)
    )
  );

  if (elapsedMinutes < 1) {
    return language === "tr"
      ? "Az önce"
      : "Just now";
  }

  if (elapsedMinutes < 60) {
    return language === "tr"
      ? `${elapsedMinutes} dakika önce`
      : `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"
      } ago`;
  }

  const elapsedHours = Math.floor(
    elapsedMinutes / 60
  );

  if (elapsedHours < 24) {
    return language === "tr"
      ? `${elapsedHours} saat önce`
      : `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"
      } ago`;
  }

  const elapsedDays = Math.floor(
    elapsedHours / 24
  );

  return language === "tr"
    ? `${elapsedDays} gün önce`
    : `${elapsedDays} day${elapsedDays === 1 ? "" : "s"
    } ago`;
}

const ui = {
  tr: {
    pageTitle: "Kategoriler",
    pageDescription:
      "İçerik üretimi, büyüme, para kazanma ve dijital dünyaya dair tüm başlıkları keşfet.",
    chooseCategory: "Bir kategori seç",
    all: "Tümü",
    popular: "Popüler",
    new: "Yeni",
    following: "Takip Edilen",
    topics: "Konular",
    searchPlaceholder: "Kategori veya konu ara...",
    educationBadge: "Çok Yakında",
    educationTitle: "ForumFenomen Eğitim",
    educationMessage:
      "Çok yakında eğitim programımız açıklanacak.",
    educationDescription:
      "Yeni eğitim programları, içerik üretim rehberleri ve özel ders duyuruları burada yayınlanacak.",
    noTopics: "Bu seçimde henüz gösterilecek konu bulunmuyor.",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    blog: "Blog",
    profile: "Profil",
    createTopic: "Konu Oluştur",
    notifications: "Bildirimler",
    search: "Ara",
    theme: "Temayı değiştir",
    hoursAgo: "saat önce",
    categoryTopics: "kategori konusu",
  },
  en: {
    pageTitle: "Categories",
    pageDescription:
      "Explore every topic about content creation, growth, monetization and the digital world.",
    chooseCategory: "Choose a category",
    all: "All",
    popular: "Popular",
    new: "New",
    following: "Following",
    topics: "Topics",
    searchPlaceholder: "Search categories or topics...",
    educationBadge: "Coming Soon",
    educationTitle: "ForumFenomen Education",
    educationMessage:
      "Our training program will be announced very soon.",
    educationDescription:
      "New training programs, content creation guides and special lesson announcements will be published here.",
    noTopics: "There are no topics to display for this selection yet.",
    home: "Home",
    categories: "Categories",
    blog: "Blog",
    profile: "Profile",
    createTopic: "Create Topic",
    notifications: "Notifications",
    search: "Search",
    theme: "Change theme",
    hoursAgo: "hours ago",
    categoryTopics: "category topics",
  },
} as const;

function PlatformIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="4" />
      <path d="M9 9.5h6M9 13h3.5" />
      <circle cx="17" cy="8" r="1" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
      <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
      <path d="M5.5 14.5 6.3 17l2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8.8-2.5Z" />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18V9" />
      <path d="M10 18V6" />
      <path d="M16 18v-4" />
      <path d="m4 11 5-5 4 4 7-7" />
      <path d="M16 3h4v4" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="4" />
      <path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
      <circle cx="16.5" cy="12.5" r=".6" />
      <path d="M7 6V4h10v2" />
    </svg>
  );
}

function EducationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12v4.5c2.8 2 7.2 2 10 0V12" />
      <path d="M21 9v6" />
    </svg>
  );
}

function LegalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v17" />
      <path d="M7 5h10" />
      <path d="m6 7-3 6h6L6 7Z" />
      <path d="m18 7-3 6h6l-3-6Z" />
      <path d="M8 21h8" />
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
      <path d="M14 3v5h5" />
      <path d="M9 12h6M9 16h6" />
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}


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

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 18.5 3.5 21l.7-4A8 8 0 1 1 20 13a8 8 0 0 1-12.2 6.8L5 18.5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function InstagramTopicIcon() {
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
        className="ff-social-dot"
      />
    </svg>
  );
}

function YouTubeTopicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M21 12c0 3.2-.4 5.2-1.2 6-.8.8-3.4 1.2-7.8 1.2S5 18.8 4.2 18C3.4 17.2 3 15.2 3 12s.4-5.2 1.2-6C5 5.2 7.6 4.8 12 4.8s7 .4 7.8 1.2c.8.8 1.2 2.8 1.2 6Z" />
      <path
        d="m10 9 5 3-5 3V9Z"
        className="ff-youtube-play"
      />
    </svg>
  );
}

function TikTokTopicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M14 3v10.2a4.3 4.3 0 1 1-3.7-4.25" />
      <path d="M14 3c.65 3.05 2.35 4.75 5 5.15" />
    </svg>
  );
}

function VideoEditTopicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
      />
      <path d="m10 9 5 3-5 3V9Z" />
      <path d="M7 3v4M17 3v4" />
    </svg>
  );
}

function CameraTopicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 7h3l1.4-2h5.2L16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <circle
        cx="12"
        cy="13"
        r="3.5"
      />
    </svg>
  );
}

function ThumbnailTopicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
      />
      <circle
        cx="8"
        cy="9"
        r="1.5"
      />
      <path d="m5 17 4.5-4.5 3 3 2.5-2.5 4 4" />
    </svg>
  );
}

function SeoTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
      <path d="M7.5 11.5 10 9l2 2 3-3" />
    </svg>
  );
}

function AlgorithmsTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" />
      <path d="M7 5h10M6 7l5 10M18 7l-5 10" />
    </svg>
  );
}

function HashtagsTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3 7 21M17 3l-2 18M4 9h16M3 15h16" />
    </svg>
  );
}

function ViralTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
      <path d="m3 13 6-5 5 3 7-7" />
    </svg>
  );
}

function BrandDealsTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 12 3 3a3 3 0 0 0 4.2 0l4.3-4.3a3 3 0 0 0-4.2-4.2L13 8.8" />
      <path d="m16 12-3-3a3 3 0 0 0-4.2 0l-4.3 4.3a3 3 0 0 0 4.2 4.2L11 15.2" />
    </svg>
  );
}

function UgcTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-4 2.3-6 5.5-6s5 2 5.5 6" />
      <rect x="15" y="5" width="6" height="10" rx="2" />
      <path d="M17.5 12h1" />
    </svg>
  );
}

function AffiliateTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M7 17H5a4 4 0 0 1 0-8h4" />
      <path d="M17 7h2a4 4 0 0 1 0 8h-4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function YouTubeMoneyTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="4" />
      <path d="m9.5 9 5 3-5 3V9Z" />
      <path d="M18 8.5v7" />
    </svg>
  );
}

function AdRulesTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 13V8l12-4v13L4 13Z" />
      <path d="M8 14v5H5v-6" />
      <path d="M19 8v5" />
    </svg>
  );
}

function TaxTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18H6V3Z" />
      <path d="M9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" />
    </svg>
  );
}

function ContractsTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9l3 3v15H6V3Z" />
      <path d="M15 3v4h4M9 11h6M9 15h6" />
      <path d="m10 19 1.5 1.5L15 17" />
    </svg>
  );
}

function CopyrightTopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 9.5a4 4 0 1 0 0 5" />
    </svg>
  );
}

function CategorySubcategoryIcon({
  subcategoryId,
  fallback,
}: {
  subcategoryId: string;
  fallback: ReactNode;
}) {
  switch (subcategoryId) {
    case "instagram":
      return <InstagramTopicIcon />;

    case "tiktok":
      return <TikTokTopicIcon />;

    case "youtube":
      return <YouTubeTopicIcon />;

    case "video-edit":
      return <VideoEditTopicIcon />;

    case "camera":
      return <CameraTopicIcon />;

    case "thumbnail":
      return <ThumbnailTopicIcon />;

    case "seo":
      return <SeoTopicIcon />;

    case "algorithms":
      return <AlgorithmsTopicIcon />;

    case "hashtags":
      return <HashtagsTopicIcon />;

    case "viral":
      return <ViralTopicIcon />;

    case "brand-deals":
      return <BrandDealsTopicIcon />;

    case "ugc":
      return <UgcTopicIcon />;

    case "affiliate":
      return <AffiliateTopicIcon />;

    case "youtube-money":
      return <YouTubeMoneyTopicIcon />;

    case "ad-rules":
      return <AdRulesTopicIcon />;

    case "tax":
      return <TaxTopicIcon />;

    case "contracts":
      return <ContractsTopicIcon />;

    case "copyright":
      return <CopyrightTopicIcon />;

    default:
      return <>{fallback}</>;
  }
}

const categories: CategoryDefinition[] = [
  {
    id: "platforms",
    title: {
      tr: "Platformlar",
      en: "Platforms",
    },
    description: {
      tr: "Instagram, TikTok ve YouTube hakkında tüm tartışmalar.",
      en: "All discussions about Instagram, TikTok and YouTube.",
    },
    accent: "#e646d7",
    icon: <PlatformIcon />,
    subcategories: [
      {
        id: "instagram",
        label: {
          tr: "Instagram",
          en: "Instagram",
        },
      },
      {
        id: "tiktok",
        label: {
          tr: "TikTok",
          en: "TikTok",
        },
      },
      {
        id: "youtube",
        label: {
          tr: "YouTube",
          en: "YouTube",
        },
      },
    ],
  },
  {
    id: "content",
    title: {
      tr: "İçerik Üretimi",
      en: "Content Creation",
    },
    description: {
      tr: "İçerik hazırlamak için kullanılan yöntemler, araçlar ve ekipmanlar.",
      en: "Methods, tools and equipment used to create content.",
    },
    accent: "#7064ff",
    icon: <ContentIcon />,
    subcategories: [
      {
        id: "ai",
        label: {
          tr: "Yapay Zeka",
          en: "Artificial Intelligence",
        },
      },
      {
        id: "video-edit",
        label: {
          tr: "Video Edit",
          en: "Video Editing",
        },
      },
      {
        id: "camera",
        label: {
          tr: "Kamera & Ekipman",
          en: "Camera & Equipment",
        },
      },
      {
        id: "thumbnail",
        label: {
          tr: "Thumbnail & Kapak Tasarımı",
          en: "Thumbnail & Cover Design",
        },
      },
    ],
  },
  {
    id: "growth",
    title: {
      tr: "Büyüme",
      en: "Growth",
    },
    description: {
      tr: "Hesap büyütme, algoritmalar, SEO ve viral içerik stratejileri.",
      en: "Account growth, algorithms, SEO and viral content strategies.",
    },
    accent: "#36c9a2",
    icon: <GrowthIcon />,
    subcategories: [
      {
        id: "seo",
        label: {
          tr: "SEO",
          en: "SEO",
        },
      },
      {
        id: "algorithms",
        label: {
          tr: "Algoritmalar",
          en: "Algorithms",
        },
      },
      {
        id: "hashtags",
        label: {
          tr: "Hashtag & Anahtar Kelimeler",
          en: "Hashtags & Keywords",
        },
      },
      {
        id: "viral",
        label: {
          tr: "Viral Analizleri",
          en: "Viral Analysis",
        },
      },
    ],
  },
  {
    id: "money",
    title: {
      tr: "Para Kazanma",
      en: "Monetization",
    },
    description: {
      tr: "İş birlikleri, UGC, affiliate ve platform gelirleri.",
      en: "Brand deals, UGC, affiliate marketing and platform revenue.",
    },
    accent: "#f0b545",
    icon: <MoneyIcon />,
    subcategories: [
      {
        id: "brand-deals",
        label: {
          tr: "Marka İş Birlikleri",
          en: "Brand Collaborations",
        },
      },
      {
        id: "ugc",
        label: {
          tr: "UGC",
          en: "UGC",
        },
      },
      {
        id: "affiliate",
        label: {
          tr: "Affiliate",
          en: "Affiliate Marketing",
        },
      },
      {
        id: "youtube-money",
        label: {
          tr: "YouTube Para Kazanma",
          en: "YouTube Monetization",
        },
      },
      {
        id: "tiktok-money",
        label: {
          tr: "TikTok Para Kazanma",
          en: "TikTok Monetization",
        },
      },
    ],
  },
  {
    id: "education",
    title: {
      tr: "Eğitim",
      en: "Education",
    },
    description: {
      tr: "ForumFenomen eğitim programları ve özel içerikler.",
      en: "ForumFenomen training programs and exclusive content.",
    },
    accent: "#0EA5E9",
    icon: <EducationIcon />,
    subcategories: [],
  },
  {
    id: "legal",
    title: {
      tr: "Yasal Mevzuat",
      en: "Legal Regulations",
    },
    description: {
      tr: "Reklam, vergi, sözleşme ve telif hakları hakkında bilgiler.",
      en: "Information about advertising, tax, contracts and copyright.",
    },
    accent: "#ff4f83",
    icon: <LegalIcon />,
    subcategories: [
      {
        id: "ad-rules",
        label: {
          tr: "Reklam Kuralları",
          en: "Advertising Rules",
        },
      },
      {
        id: "tax",
        label: {
          tr: "Vergi Mevzuatı",
          en: "Tax Legislation",
        },
      },
      {
        id: "contracts",
        label: {
          tr: "Sözleşmeler",
          en: "Contracts",
        },
      },
      {
        id: "copyright",
        label: {
          tr: "Telif Hakları",
          en: "Copyright",
        },
      },
    ],
  },
];

const topics: Topic[] = [
  {
    id: 1,
    category: "platforms",
    subcategoryId: "instagram",
    title: {
      tr: "Instagram erişimleri son dönemde neden düştü?",
      en: "Why has Instagram reach dropped recently?",
    },
    tag: {
      tr: "Instagram",
      en: "Instagram",
    },
    author: "Ece",
    ageHours: 1,
    comments: 64,
    views: 650,
    followed: true,
  },
  {
    id: 2,
    category: "platforms",
    subcategoryId: "tiktok",
    title: {
      tr: "TikTok algoritmasında ilk 3 saniyenin önemi",
      en: "Why the first 3 seconds matter on TikTok",
    },
    tag: {
      tr: "TikTok",
      en: "TikTok",
    },
    author: "Deniz",
    ageHours: 3,
    comments: 41,
    views: 520,
    followed: false,
  },
  {
    id: 3,
    category: "platforms",
    subcategoryId: "youtube",
    title: {
      tr: "YouTube Shorts izlenme stratejisi",
      en: "YouTube Shorts view strategy",
    },
    tag: {
      tr: "YouTube",
      en: "YouTube",
    },
    author: "Selin",
    ageHours: 5,
    comments: 79,
    views: 840,
    followed: true,
  },
  {
    id: 4,
    category: "platforms",
    subcategoryId: "instagram",
    title: {
      tr: "Reels mi carousel gönderileri mi daha etkili?",
      en: "Are Reels or carousel posts more effective?",
    },
    tag: {
      tr: "Instagram",
      en: "Instagram",
    },
    author: "Mert",
    ageHours: 7,
    comments: 35,
    views: 390,
    followed: false,
  },
  {
    id: 5,
    category: "content",
    subcategoryId: "ai",
    title: {
      tr: "ChatGPT ile haftalık içerik planı nasıl hazırlanır?",
      en: "How to create a weekly content plan with ChatGPT",
    },
    tag: {
      tr: "Yapay Zeka",
      en: "Artificial Intelligence",
    },
    author: "Emre",
    ageHours: 2,
    comments: 82,
    views: 760,
    followed: true,
  },
  {
    id: 6,
    category: "content",
    subcategoryId: "video-edit",
    title: {
      tr: "CapCut ile daha profesyonel video düzenleme",
      en: "Professional video editing with CapCut",
    },
    tag: {
      tr: "Video Edit",
      en: "Video Editing",
    },
    author: "Buse",
    ageHours: 4,
    comments: 37,
    views: 440,
    followed: false,
  },
  {
    id: 7,
    category: "content",
    subcategoryId: "camera",
    title: {
      tr: "Yeni başlayanlar için uygun kamera ve mikrofonlar",
      en: "Affordable cameras and microphones for beginners",
    },
    tag: {
      tr: "Kamera & Ekipman",
      en: "Camera & Equipment",
    },
    author: "Can",
    ageHours: 6,
    comments: 56,
    views: 610,
    followed: true,
  },
  {
    id: 8,
    category: "content",
    subcategoryId: "thumbnail",
    title: {
      tr: "Daha fazla tıklanan kapak tasarımlarının ortak noktaları",
      en: "What high-click thumbnail designs have in common",
    },
    tag: {
      tr: "Kapak Tasarımı",
      en: "Cover Design",
    },
    author: "Melis",
    ageHours: 9,
    comments: 29,
    views: 330,
    followed: false,
  },
  {
    id: 9,
    category: "growth",
    subcategoryId: "seo",
    title: {
      tr: "Yeni başlayanlar için sosyal medya SEO rehberi",
      en: "Social media SEO guide for beginners",
    },
    tag: {
      tr: "SEO",
      en: "SEO",
    },
    author: "Ali",
    ageHours: 2,
    comments: 73,
    views: 790,
    followed: true,
  },
  {
    id: 10,
    category: "growth",
    subcategoryId: "algorithms",
    title: {
      tr: "Algoritmalar içerik kalitesini nasıl ölçüyor?",
      en: "How do algorithms measure content quality?",
    },
    tag: {
      tr: "Algoritmalar",
      en: "Algorithms",
    },
    author: "Zeynep",
    ageHours: 4,
    comments: 45,
    views: 540,
    followed: false,
  },
  {
    id: 11,
    category: "growth",
    subcategoryId: "hashtags",
    title: {
      tr: "Hashtag kullanmak hâlâ gerekli mi?",
      en: "Are hashtags still necessary?",
    },
    tag: {
      tr: "Hashtag",
      en: "Hashtags",
    },
    author: "Deniz",
    ageHours: 6,
    comments: 68,
    views: 720,
    followed: true,
  },
  {
    id: 12,
    category: "growth",
    subcategoryId: "viral",
    title: {
      tr: "Viral olan videoların ilk 10 saniye analizi",
      en: "Analyzing the first 10 seconds of viral videos",
    },
    tag: {
      tr: "Viral Analizi",
      en: "Viral Analysis",
    },
    author: "Ece",
    ageHours: 8,
    comments: 38,
    views: 470,
    followed: false,
  },
  {
    id: 13,
    category: "money",
    subcategoryId: "brand-deals",
    title: {
      tr: "Marka iş birliği fiyatı nasıl belirlenmeli?",
      en: "How should you price a brand collaboration?",
    },
    tag: {
      tr: "Marka İş Birliği",
      en: "Brand Collaboration",
    },
    author: "Selin",
    ageHours: 1,
    comments: 88,
    views: 910,
    followed: true,
  },
  {
    id: 14,
    category: "money",
    subcategoryId: "ugc",
    title: {
      tr: "UGC içeriklerinde fiyatlandırma rehberi",
      en: "UGC content pricing guide",
    },
    tag: {
      tr: "UGC",
      en: "UGC",
    },
    author: "Merve",
    ageHours: 3,
    comments: 52,
    views: 630,
    followed: true,
  },
  {
    id: 15,
    category: "money",
    subcategoryId: "affiliate",
    title: {
      tr: "Affiliate gelirini artırmak için uygulanabilir yöntemler",
      en: "Practical ways to increase affiliate revenue",
    },
    tag: {
      tr: "Affiliate",
      en: "Affiliate",
    },
    author: "Mark",
    ageHours: 5,
    comments: 43,
    views: 580,
    followed: false,
  },
  {
    id: 16,
    category: "money",
    subcategoryId: "youtube-money",
    title: {
      tr: "YouTube para kazanma şartlarına daha hızlı ulaşmak",
      en: "Reaching YouTube monetization requirements faster",
    },
    tag: {
      tr: "YouTube Para Kazanma",
      en: "YouTube Monetization",
    },
    author: "Can",
    ageHours: 7,
    comments: 61,
    views: 740,
    followed: false,
  },
  {
    id: 17,
    category: "legal",
    subcategoryId: "ad-rules",
    title: {
      tr: "Sosyal medya reklamlarında iş birliği etiketi zorunlu mu?",
      en: "Is an advertising disclosure required on social media?",
    },
    tag: {
      tr: "Reklam Kuralları",
      en: "Advertising Rules",
    },
    author: "Seda",
    ageHours: 2,
    comments: 76,
    views: 680,
    followed: true,
  },
  {
    id: 18,
    category: "legal",
    subcategoryId: "tax",
    title: {
      tr: "İçerik üreticileri için vergi istisnası nasıl çalışıyor?",
      en: "How does the creator tax exemption work?",
    },
    tag: {
      tr: "Vergi Mevzuatı",
      en: "Tax Legislation",
    },
    author: "Emre",
    ageHours: 4,
    comments: 57,
    views: 620,
    followed: true,
  },
  {
    id: 19,
    category: "legal",
    subcategoryId: "contracts",
    title: {
      tr: "Marka sözleşmesinde dikkat edilmesi gereken maddeler",
      en: "Important clauses in a brand contract",
    },
    tag: {
      tr: "Sözleşmeler",
      en: "Contracts",
    },
    author: "Ceren",
    ageHours: 6,
    comments: 39,
    views: 450,
    followed: false,
  },
  {
    id: 20,
    category: "legal",
    subcategoryId: "copyright",
    title: {
      tr: "Telif ihtarı geldiğinde ilk olarak ne yapılmalı?",
      en: "What should you do first after a copyright notice?",
    },
    tag: {
      tr: "Telif Hakları",
      en: "Copyright",
    },
    author: "Mert",
    ageHours: 8,
    comments: 48,
    views: 510,
    followed: false,
  },
];

export default function CategoriesPage() {

  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [categoryData, setCategoryData] =
    useState<CategoryDefinition[]>(categories);

  const [topicData, setTopicData] =
    useState<Topic[]>(topics);

  const [topicsLoading, setTopicsLoading] =
    useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("platforms");

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<TabId>("new");

  const categoryDetailRef =
    useRef<HTMLElement | null>(null);


  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const groupSlug =
      params.get("group");

    const categorySlug =
      params.get("category");

    const shouldFocusCategory =
      params.get("focus") === "category";

    if (!groupSlug) {
      return;
    }

    const targetGroup =
      categoryData.find(
        (category) =>
          category.slug === groupSlug
      );

    if (!targetGroup) {
      return;
    }

    setSelectedCategory(
      targetGroup.id
    );

    setActiveTab("new");

    if (categorySlug) {
      const targetSubcategory =
        targetGroup.subcategories.find(
          (subcategory) =>
            subcategory.slug === categorySlug
        );

      setSelectedSubcategory(
        targetSubcategory?.id ?? null
      );
    } else {
      setSelectedSubcategory(null);
    }

    if (!shouldFocusCategory) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });

      return;
    }

    const scrollTimer =
      window.setTimeout(() => {
        const target =
          categoryDetailRef.current;

        if (!target) {
          return;
        }

        const targetTop =
          target.getBoundingClientRect().top +
          window.scrollY -
          18;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: "smooth",
        });

        const cleanUrl =
          new URL(window.location.href);

        cleanUrl.searchParams.delete("focus");

        window.history.replaceState(
          window.history.state,
          "",
          `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
        );

      }, 180);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [categoryData]);



  useEffect(() => {
    const savedLanguage = getForumLanguage();

    setLanguage(savedLanguage);
    setForumLanguage(savedLanguage);

    const savedTheme =
      window.localStorage.getItem(
        "forumfenomen-theme"
      );

    const resolvedTheme: Theme =
      savedTheme === "light"
        ? "light"
        : "dark";

    setTheme(resolvedTheme);

    document.documentElement.dataset.theme =
      resolvedTheme;
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      const supabase = createClient();

      const [
        groupsResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from("category_groups")
          .select(
            "id, slug, name, description, sort_order, is_active"
          )
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("categories")
          .select(
            "id, group_id, slug, name, description, sort_order, is_active"
          )
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          }),
      ]);

      if (!isActive) {
        return;
      }

      if (
        groupsResult.error ||
        categoriesResult.error
      ) {
        console.error(
          "Kategoriler Supabase üzerinden alınamadı:",
          groupsResult.error?.message ??
          categoriesResult.error?.message
        );

        return;
      }

      const groupRows =
        (groupsResult.data ??
          []) as CategoryGroupRow[];

      const categoryRows =
        (categoriesResult.data ??
          []) as CategoryRow[];

      const nextCategories =
        groupRows.flatMap((group) => {
          const categoryId =
            categoryGroupMap[group.slug];

          const fallbackCategory =
            categories.find(
              (category) =>
                category.id === categoryId
            );

          if (
            !categoryId ||
            !fallbackCategory
          ) {
            return [];
          }

          const subcategories =
            categoryRows
              .filter(
                (subcategory) =>
                  subcategory.group_id ===
                  group.id
              )
              .sort(
                (a, b) =>
                  a.sort_order - b.sort_order
              )
              .map((subcategory) => {
                const localId =
                  subcategoryIdMap[
                  subcategory.slug
                  ] ?? subcategory.slug;

                const fallbackSubcategory =
                  fallbackCategory.subcategories.find(
                    (item) =>
                      item.id === localId
                  );

                return {
                  id: localId,
                  databaseId: subcategory.id,
                  slug: subcategory.slug,

                  label: {
                    tr: subcategory.name,

                    en:
                      fallbackSubcategory
                        ?.label.en ??
                      subcategory.name,
                  },
                };
              });

          return [
            {
              ...fallbackCategory,

              databaseId: group.id,
              slug: group.slug,

              title: {
                ...fallbackCategory.title,
                tr: group.name,
              },

              description: {
                ...fallbackCategory.description,

                tr:
                  group.description.trim() ||
                  fallbackCategory
                    .description.tr,
              },

              subcategories,
            },
          ];
        });

      if (
        nextCategories.length ===
        categories.length
      ) {
        setCategoryData(
          nextCategories
        );
      }
    }

    void loadCategories();

    return () => {
      isActive = false;
    };
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
        author_id,
        content_profile_id,
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
        )
      `)
        .eq("status", "published")
        .order("created_at", {
          ascending: false,
        })
        .limit(100);

      if (!isActive) {
        return;
      }

      if (error) {
        console.error(
          "Kategori konuları alınamadı:",
          error.message
        );

        setTopicsLoading(false);
        return;
      }

      const topicRows =
        (data ?? []) as unknown as Omit<
          TopicRow,
          "profiles"
        >[];

      type TopicAuthorProfile = {
        topic_id: string;
        id: string;
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
      };

      let authorProfileRows:
        TopicAuthorProfile[] = [];

      type ManagedContentProfile = {
        id: string;
        display_name: string | null;
        username: string | null;
      };

      let managedProfileRows:
        ManagedContentProfile[] = [];

      const contentProfileIds = Array.from(
        new Set(
          topicRows
            .map(
              (topic) =>
                topic.content_profile_id
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        )
      );

      if (contentProfileIds.length > 0) {
        const {
          data: managedProfiles,
          error: managedProfilesError,
        } = await supabase
          .from("content_profiles")
          .select(`
      id,
      display_name,
      username
    `)
          .in("id", contentProfileIds)
          .eq("is_active", true)
          .eq("is_archived", false);

        if (!isActive) {
          return;
        }

        if (managedProfilesError) {
          console.error(
            "Kategori içerik profilleri alınamadı:",
            managedProfilesError.message
          );
        } else {
          managedProfileRows =
            (managedProfiles ??
              []) as ManagedContentProfile[];
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (sessionError) {
        console.error(
          "Kategori kullanıcı oturumu alınamadı:",
          sessionError.message
        );
      }

      const user = session?.user ?? null;

      /*
       * Yalnızca oturum açmış kullanıcılar
       * gerçek konu sahibi adlarını görür.
       */
      if (user && topicRows.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase.rpc(
          "get_topic_author_profiles",
          {
            p_topic_ids: topicRows.map(
              (topic) => topic.id
            ),
          }
        );

        if (!isActive) {
          return;
        }

        if (profileError) {
          console.error(
            "Kategori konu sahipleri alınamadı:",
            profileError.message
          );
        } else {
          authorProfileRows =
            (profileData ??
              []) as TopicAuthorProfile[];
        }
      }

      const authorProfileMap = new Map(
        authorProfileRows.map((profile) => [
          profile.topic_id,
          profile,
        ])
      );

      const managedProfileMap = new Map(
        managedProfileRows.map((profile) => [
          profile.id,
          profile,
        ])
      );

      const nextTopics = topicRows.flatMap(
        (topic) => {
          const groupSlug =
            topic.categories?.category_groups
              ?.slug ?? "";

          const categoryId =
            categoryGroupMap[groupSlug];

          const subcategorySlug =
            topic.categories?.slug ?? "";

          const subcategoryId =
            subcategoryIdMap[
            subcategorySlug
            ] ?? subcategorySlug;

          if (
            !categoryId ||
            !subcategoryId
          ) {
            return [];
          }

          const fallbackCategory =
            categories.find(
              (category) =>
                category.id === categoryId
            );

          const fallbackSubcategory =
            fallbackCategory?.subcategories.find(
              (subcategory) =>
                subcategory.id ===
                subcategoryId
            );


          const categoryName =
            topic.categories?.name ??
            "Genel";

          const managedProfile =
            topic.content_profile_id
              ? managedProfileMap.get(
                topic.content_profile_id
              )
              : null;

          const authorProfile =
            authorProfileMap.get(topic.id);

          const authorName =
            managedProfile
              ?.display_name
              ?.trim() ||
            managedProfile
              ?.username
              ?.replace(/^@/, "")
              .trim() ||
            authorProfile
              ?.display_name
              ?.trim() ||
            authorProfile
              ?.username
              ?.replace(/^@/, "")
              .trim() ||
            "ForumFenomen Üyesi";

          return [
            {
              id: topic.id,
              category: categoryId,
              subcategoryId,
              title: {
                tr: topic.title,
                en: topic.title,
              },
              tag: {
                tr: categoryName,
                en:
                  fallbackSubcategory
                    ?.label.en ??
                  categoryName,
              },
              author: authorName,
              createdAt: topic.created_at,
              comments:
                topic.comment_count ?? 0,
              views:
                topic.view_count ?? 0,
              followed: false,
            },
          ];
        }
      );

      setTopicData(nextTopics);
      setTopicsLoading(false);
    }

    void loadTopics();

    return () => {
      isActive = false;
    };
  }, []);

  const t = ui[language];

  const activeCategory =
    categoryData.find(
      (category) =>
        category.id === selectedCategory
    ) ??
    categoryData[0] ??
    categories[0];

  const visibleTopics = useMemo(() => {
    let result = topicData.filter(
      (topic) =>
        topic.category === selectedCategory
    );

    if (selectedSubcategory) {
      result = result.filter(
        (topic) =>
          topic.subcategoryId ===
          selectedSubcategory
      );
    }


    if (activeTab === "following") {
      result = result.filter(
        (topic) => topic.followed
      );
    }

    const sortNewestFirst = (
      first: Topic,
      second: Topic
    ) => {
      const firstTime = first.createdAt
        ? new Date(first.createdAt).getTime()
        : Number.MAX_SAFE_INTEGER -
        (first.ageHours ?? 0);

      const secondTime = second.createdAt
        ? new Date(second.createdAt).getTime()
        : Number.MAX_SAFE_INTEGER -
        (second.ageHours ?? 0);

      return secondTime - firstTime;
    };

    if (
      activeTab === "new" ||
      activeTab === "following"
    ) {
      return [...result].sort(
        sortNewestFirst
      );
    }

    /*
     * Popüler sekmesinde etkileşim puanı eşitse
     * daha yeni konu önce gösterilir.
     */
    return [...result].sort(
      (first, second) => {
        const firstScore =
          first.comments + first.views / 10;

        const secondScore =
          second.comments + second.views / 10;

        if (secondScore !== firstScore) {
          return secondScore - firstScore;
        }

        return sortNewestFirst(
          first,
          second
        );
      }
    );
  }, [
    activeTab,
    language,
    selectedCategory,
    selectedSubcategory,
    topicData,
  ]);

  function selectCategory(
    categoryId: CategoryId
  ) {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setActiveTab("new");

  }

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    window.localStorage.setItem(
      "forumfenomen-theme",
      nextTheme
    );

    document.documentElement.dataset.theme =
      nextTheme;
  }

  function handleBottomNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (window.location.pathname === href) {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <main className="ff-categories-page">
      <div className="ff-categories-shell">
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
              aria-label={t.theme}
              title={t.theme}
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


        <section className="ff-category-intro">
          <div>
            <span className="ff-category-eyebrow">
              ForumFenomen
            </span>

            <h1>{t.pageTitle}</h1>

            <p>{t.pageDescription}</p>
          </div>

          <div className="ff-category-intro-orbit">
            <span />
            <span />
            <span />
          </div>
        </section>

        <section
          className="ff-category-grid"
          aria-label={t.chooseCategory}
        >
          {categoryData.map((category) => {
            const active =
              category.id ===
              selectedCategory;

            return (
              <button
                key={category.id}
                type="button"
                className={
                  active
                    ? "ff-category-card active"
                    : "ff-category-card"
                }
                style={
                  {
                    "--category-accent":
                      category.accent,
                  } as CSSProperties
                }
                onClick={() =>
                  selectCategory(
                    category.id
                  )
                }
                aria-pressed={active}
              >
                <span className="ff-category-card-icon">
                  {category.icon}
                </span>

                <span className="ff-category-card-title">
                  {category.title[language]}
                </span>
              </button>
            );
          })}
        </section>

        <section
          ref={categoryDetailRef}
          className="ff-category-detail"

          style={
            {
              "--category-accent":
                activeCategory.accent,
            } as CSSProperties
          }
        >
          <div className="ff-category-detail-heading">
            <span className="ff-category-detail-icon">
              {activeCategory.icon}
            </span>

            <div>
              <h2>
                {
                  activeCategory.title[
                  language
                  ]
                }
              </h2>

              <p>
                {
                  activeCategory
                    .description[language]
                }
              </p>
            </div>
          </div>

          {selectedCategory ===
            "education" ? (
            <div className="ff-education-announcement">
              <span className="ff-education-badge">
                {t.educationBadge}
              </span>

              <h3>
                {t.educationTitle}
              </h3>

              <strong>
                {t.educationMessage}
              </strong>

              <p>
                {t.educationDescription}
              </p>
            </div>
          ) : (
            <div className="ff-subcategory-list">
              <button
                type="button"
                className={
                  selectedSubcategory === null
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSelectedSubcategory(
                    null
                  )
                }
              >
                {t.all}
              </button>

              {activeCategory.subcategories.map(
                (subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    className={
                      selectedSubcategory ===
                        subcategory.id
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedSubcategory(
                        subcategory.id
                      )
                    }
                  >
                    {
                      subcategory.label[
                      language
                      ]
                    }
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {selectedCategory !== "education" && (
          <section
            className="ff-category-topic-section"
            style={
              {
                "--category-accent":
                  activeCategory.accent,
              } as CSSProperties
            }
          >
            <div className="ff-category-tabs">
              <button
                type="button"
                className={
                  activeTab === "popular"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("popular")
                }
              >
                {t.popular}
              </button>

              <button
                type="button"
                className={
                  activeTab === "new"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("new")
                }
              >
                {t.new}
              </button>

              <button
                type="button"
                className={
                  activeTab === "following"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "following"
                  )
                }
              >
                {t.following}
              </button>
            </div>

            <div className="ff-category-list-heading">
              <h2>{t.topics}</h2>

              <span>
                {visibleTopics.length}{" "}
                {t.categoryTopics}
              </span>
            </div>

            <div
              className="ff-category-topic-list"
              aria-busy={topicsLoading}
            >
              {visibleTopics.length > 0 ? (
                visibleTopics.map((topic) => (
                  <article
                    key={topic.id}
                    className="ff-topic-card ff-category-feed-topic"
                  >
                    <div
                      className={`ff-topic-icon ${topicVisualMap[topic.category]
                        .iconClass
                        } ff-category-feed-icon`}
                    >
                      <CategorySubcategoryIcon
                        subcategoryId={topic.subcategoryId}
                        fallback={
                          topicVisualMap[topic.category].icon
                        }
                      />
                    </div>

                    <div className="ff-topic-main">
                      <h3>
                        <Link
                          href={`/konu/${topic.id}`}
                          scroll={true}
                          onClick={() => {
                            window.scrollTo(0, 0);
                            document.documentElement.scrollTop = 0;
                            document.body.scrollTop = 0;
                          }}
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                          }}
                        >
                          {topic.title[language]}
                        </Link>
                      </h3>

                      <div className="ff-topic-meta">
                        <span
                          className="ff-category ff-category-feed-tag"
                          style={
                            {
                              "--category-accent":
                                activeCategory.accent,
                            } as CSSProperties
                          }
                        >
                          {topic.tag[language]}
                        </span>

                        <span>{topic.author}</span>

                        <i>•</i>

                        <span>
                          {topic.createdAt
                            ? formatRelativeTime(
                              topic.createdAt,
                              language
                            )
                            : language === "tr"
                              ? `${topic.ageHours ?? 0} saat önce`
                              : `${topic.ageHours ?? 0} hours ago`}
                        </span>
                      </div>
                    </div>

                    <div className="ff-topic-stats">
                      <span>
                        <CommentIcon />
                        {topic.comments}
                      </span>

                      <span>
                        <EyeIcon />
                        {topic.views}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="ff-category-empty">
                  <SearchIcon />
                  <p>{t.noTopics}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <ForumFooter />


      <nav
        className="ff-bottom-nav"
        aria-label="ForumFenomen"
      >
        <Link
          href="/akis"
          onClick={(event) =>
            handleBottomNavigation(event, "/akis")
          }
        >
          <HomeIcon />
          <span>{t.home}</span>
        </Link>

        <Link
          href="/kategoriler"
          className="active"
          aria-current="page"
          onClick={(event) =>
            handleBottomNavigation(
              event,
              "/kategoriler"
            )
          }
        >
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

        <Link
          href="/blog"
          onClick={(event) =>
            handleBottomNavigation(event, "/blog")
          }
        >
          <BlogIcon />
          <span>{t.blog}</span>
        </Link>

        <Link
          href="/profil"
          onClick={(event) =>
            handleBottomNavigation(event, "/profil")
          }
        >
          <UserIcon />
          <span>{t.profile}</span>
        </Link>
      </nav>
    </main>
  );
}



