"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  getForumLanguage,
  setForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";

import { createClient } from "@/lib/supabase/client";

import styles from "./page.module.css";

type Theme = "dark" | "light";

type CategoryId =
  | "platforms"
  | "content"
  | "growth"
  | "money"
  | "education"
  | "legal";

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

type SavedDraft = {
  category: CategoryId;
  subcategory: string | null;
  title: string;
  content: string;
  tags: string[];
  pollEnabled: boolean;
  pollOptions: string[];
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

const categoryGroupMap: Record<string, CategoryId> = {
  platformlar: "platforms",
  "icerik-uretimi": "content",
  buyume: "growth",
  "para-kazanma": "money",
  egitim: "education",
  yasal: "legal",
};

const subcategoryIdMap: Record<string, string> = {
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

const DRAFT_KEY =
  "forumfenomen-topic-draft-v1";

const translations = {
  tr: {
    eyebrow: "ForumFenomen Topluluğu",
    title: "Yeni Konu Oluştur",
    description:
      "Fikrini paylaş, doğru kategoriye ekle ve topluluğun görüşünü al.",
    editorTitle: "Konu Bilgileri",
    editorDescription:
      "Konu başlığını, kategorisini ve açıklamasını düzenle.",
    categoryTitle: "Ana Kategori",
    categoryDescription:
      "Konuna en uygun ana kategoriyi seç.",
    subcategoryTitle: "Alt Kategori",
    subcategoryDescription:
      "Konunun daha kolay bulunması için ilgili alt kategoriyi seç.",
    topicTitle: "Konu Başlığı",
    titlePlaceholder:
      "Konunu açık ve anlaşılır bir başlıkla özetle...",
    titleHint: "En az 10, en fazla 120 karakter.",
    contentTitle: "Konu İçeriği",
    contentPlaceholder:
      "Sorunu, fikrini veya paylaşmak istediğin bilgiyi ayrıntılı biçimde anlat...",
    contentHint:
      "İstersen konunla ilgili ek bilgi veya açıklama yazabilirsin.",
    tagsTitle: "Etiketler",
    tagsPlaceholder: "Etiket yaz ve Enter'a bas",
    tagsHint: "En fazla 5 etiket ekleyebilirsin.",
    mediaTitle: "Görsel veya Dosya",
    mediaDescription:
      "Konunu destekleyen bir görsel seçebilirsin.",
    selectFile: "Görsel Seç",
    changeFile: "Görseli Değiştir",
    removeFile: "Kaldır",
    pollTitle: "Anket Ekle",
    pollDescription:
      "Topluluğun seçenekler arasında oy kullanmasını sağla.",
    pollOption: "Anket seçeneği",
    addOption: "Seçenek Ekle",
    removeOption: "Seçeneği kaldır",
    guidelinesTitle: "İyi Bir Konu İçin",
    guidelineOne:
      "Başlığı kısa, açık ve anlaşılır yaz.",
    guidelineTwo:
      "Doğru kategori ve alt kategoriyi seç.",
    guidelineThree:
      "Kişisel bilgi, hakaret veya yanıltıcı içerik paylaşma.",
    guidelineFour:
      "Aynı konunun daha önce açılmadığını kontrol et.",
    progressTitle: "Konu Hazırlığı",
    progressComplete: "tamamlandı",
    draftTitle: "Yayın",
    saveDraft: "Taslağı Kaydet",
    loadDraft: "Taslağı Yükle",
    preview: "Ön İzleme",
    publish: "Konuyu Yayınla",
    publishing: "Yayınlanıyor...",
    publishSuccess:
      "Konu başarıyla yayınlandı.",
    publishError:
      "Konu yayınlanırken bir hata oluştu. Lütfen tekrar dene.",
    sessionExpired:
      "Oturumun bulunamadı. Konu yayınlamak için tekrar giriş yapmalısın.",
    publishingNote:
      "Konu yayınlandığında ForumFenomen topluluğunda görünür.",
    savedMessage:
      "Taslak bu tarayıcıya başarıyla kaydedildi.",
    loadedMessage:
      "Kaydedilen taslak forma yüklendi.",
    previewTitle: "Konu Ön İzlemesi",
    closePreview: "Ön izlemeyi kapat",
    noTitle: "Başlık henüz yazılmadı",
    noContent: "Konu içeriği henüz yazılmadı.",
    loginRequiredTitle: "Konuyu yayınlamak için giriş yapmalısın",
    loginRequiredDescription:
      "Konu bilgilerin hazır. Üyelik sistemi aktif olduğunda giriş yaparak yayınlayabileceksin.",
    goLogin: "Giriş Sayfasına Git",
    continueEditing: "Düzenlemeye Devam Et",
    educationNote:
      "Eğitim programları yakında açıklanacak. Eğitimle ilgili fikir ve beklentilerini bu kategoride paylaşabilirsin.",
    allFieldsNotice:
      "Yayınlamak için kategori, alt kategori ve konu başlığını tamamla.",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    createTopic: "Konu Oluştur",
    blog: "Blog",
    profile: "Profil",
    changeTheme: "Temayı değiştir",
    notifications: "Bildirimler",
    backHome: "Ana akışa dön",
  },

  en: {
    eyebrow: "ForumFenomen Community",
    title: "Create a New Topic",
    description:
      "Share your idea, choose the right category and hear from the community.",
    editorTitle: "Topic Information",
    editorDescription:
      "Set the title, category and content of your topic.",
    categoryTitle: "Main Category",
    categoryDescription:
      "Choose the main category that best matches your topic.",
    subcategoryTitle: "Subcategory",
    subcategoryDescription:
      "Choose a subcategory to make your topic easier to discover.",
    topicTitle: "Topic Title",
    titlePlaceholder:
      "Summarize your topic with a clear and understandable title...",
    titleHint: "Use between 10 and 120 characters.",
    contentTitle: "Topic Content",
    contentPlaceholder:
      "Describe your question, idea or information in detail...",
    contentHint:
      "Add extra details or context if you want.",
    tagsTitle: "Tags",
    tagsPlaceholder: "Type a tag and press Enter",
    tagsHint: "You can add up to 5 tags.",
    mediaTitle: "Image or File",
    mediaDescription:
      "You may choose an image that supports your topic.",
    selectFile: "Select Image",
    changeFile: "Change Image",
    removeFile: "Remove",
    pollTitle: "Add a Poll",
    pollDescription:
      "Let the community vote between different choices.",
    pollOption: "Poll option",
    addOption: "Add Option",
    removeOption: "Remove option",
    guidelinesTitle: "For a Good Topic",
    guidelineOne:
      "Write a short, clear and understandable title.",
    guidelineTwo:
      "Choose the correct category and subcategory.",
    guidelineThree:
      "Do not share personal information, insults or misleading content.",
    guidelineFour:
      "Check whether the same topic has already been created.",
    progressTitle: "Topic Progress",
    progressComplete: "completed",
    draftTitle: "Publish",
    saveDraft: "Save Draft",
    loadDraft: "Load Draft",
    preview: "Preview",
    publish: "Publish Topic",
    publishing: "Publishing...",
    publishSuccess:
      "The topic was published successfully.",
    publishError:
      "An error occurred while publishing the topic. Please try again.",
    sessionExpired:
      "Your session could not be found. Please sign in again to publish a topic.",
    publishingNote:
      "Once published, the topic will appear in the ForumFenomen community.",
    savedMessage:
      "The draft was successfully saved in this browser.",
    loadedMessage:
      "The saved draft was loaded into the form.",
    previewTitle: "Topic Preview",
    closePreview: "Close preview",
    noTitle: "The title has not been written yet",
    noContent: "The topic content has not been written yet.",
    loginRequiredTitle: "You must sign in to publish the topic",
    loginRequiredDescription:
      "Your topic is ready. You will be able to publish it after signing in when membership is active.",
    goLogin: "Go to Sign In",
    continueEditing: "Continue Editing",
    educationNote:
      "Training programs will be announced soon. You can share your ideas and expectations about education in this category.",
    allFieldsNotice:
      "Complete the category, subcategory and topic title before publishing.",
    home: "Home",
    categories: "Categories",
    createTopic: "Create Topic",
    blog: "Blog",
    profile: "Profile",
    changeTheme: "Change theme",
    notifications: "Notifications",
    backHome: "Return to feed",
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
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18V9M10 18V6M16 18v-4" />
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
      <path d="M12 3v17M7 5h10" />
      <path d="m6 7-3 6h6L6 7ZM18 7l-3 6h6l-3-6Z" />
      <path d="M8 21h8" />
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


function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
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

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h12l2 2v16H5V3Z" />
      <path d="M8 3v6h8V3M8 21v-7h8v7" />
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

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 4 18 8-18 8 3-8-3-8Z" />
      <path d="M6 12h15" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m5 18 5-5 3 3 2-2 4 4" />
    </svg>
  );
}

function PollIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7l9 9-7 7-9-9V4Z" />
      <circle cx="8" cy="8" r="1.2" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
    </svg>
  );
}

const categories: CategoryDefinition[] = [
  {
    id: "platforms",
    title: {
      tr: "Platformlar",
      en: "Platforms",
    },
    description: {
      tr: "Instagram, TikTok ve YouTube",
      en: "Instagram, TikTok and YouTube",
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
      tr: "Yapay zeka, video ve ekipman",
      en: "AI, video and equipment",
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
      tr: "SEO, algoritma ve viral analiz",
      en: "SEO, algorithms and viral analysis",
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
      tr: "İş birlikleri, UGC ve affiliate",
      en: "Collaborations, UGC and affiliate",
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
          en: "Affiliate",
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
      tr: "Eğitim programları ve öneriler",
      en: "Training programs and suggestions",
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
      tr: "Reklam, vergi, sözleşme ve telif",
      en: "Advertising, tax, contracts and copyright",
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

function getPlainTextFromHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/div>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeTopicHtml(html: string) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(
    html,
    "text/html"
  );

  const allowedTags = new Set([
    "P",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "H3",
    "UL",
    "OL",
    "LI",
    "BLOCKQUOTE",
    "A",
  ]);

  documentNode.body
    .querySelectorAll("*")
    .forEach((element) => {
      if (!allowedTags.has(element.tagName)) {
        element.replaceWith(
          ...Array.from(element.childNodes)
        );

        return;
      }

      Array.from(element.attributes).forEach(
        (attribute) => {
          const attributeName =
            attribute.name.toLowerCase();

          if (
            element.tagName === "A" &&
            attributeName === "href"
          ) {
            return;
          }

          element.removeAttribute(
            attribute.name
          );
        }
      );

      if (element.tagName === "A") {
        const href =
          element.getAttribute("href")?.trim() ??
          "";

        if (
          !href.startsWith("https://") &&
          !href.startsWith("http://")
        ) {
          element.removeAttribute("href");
        } else {
          element.setAttribute(
            "target",
            "_blank"
          );

          element.setAttribute(
            "rel",
            "noopener noreferrer nofollow"
          );
        }
      }
    });

  return documentNode.body.innerHTML.trim();
}

const editorEmojis = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🥰", "😎",
  "🤔", "😮", "😢", "😭", "😡", "🤯", "🥳", "🤩",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "🤝", "👀",
  "❤️", "💜", "💙", "💚", "🧡", "🔥", "✨", "⭐",
  "🚀", "💡", "🎯", "🏆", "📱", "💻", "📸", "🎥",
  "💰", "📈", "📊", "✅", "❌", "⚠️", "📌", "🔗",
] as const;
export default function CreateTopicPage() {
  const router = useRouter();

  const editorRef =
    useRef<HTMLDivElement | null>(null);

  const savedSelectionRef =
    useRef<Range | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [categoryData, setCategoryData] =
    useState<CategoryDefinition[]>(categories);

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("platforms");

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string | null>("instagram");

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [tagInput, setTagInput] =
    useState("");

  const [tags, setTags] =
    useState<string[]>([]);

  const [attachment, setAttachment] =
    useState<File | null>(null);

  const [attachmentUrl, setAttachmentUrl] =
    useState<string | null>(null);

  const [pollEnabled, setPollEnabled] =
    useState(false);

  const [pollOptions, setPollOptions] =
    useState(["", ""]);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [emojiMenuOpen, setEmojiMenuOpen] =
    useState(false);

  const [boldActive, setBoldActive] =
    useState(false);

  const [italicActive, setItalicActive] =
    useState(false);

  const [loginNotice, setLoginNotice] =
    useState(false);

  const [isPublishing, setIsPublishing] =
    useState(false);

  const [publishMessage, setPublishMessage] =
    useState<"success" | "error" | null>(null);

  const [draftMessage, setDraftMessage] =
    useState<"saved" | "loaded" | null>(null);

  const [hasSavedDraft, setHasSavedDraft] =
    useState(false);

  useEffect(() => {
    const savedLanguage =
      getForumLanguage();

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

    setHasSavedDraft(
      Boolean(
        window.localStorage.getItem(
          DRAFT_KEY
        )
      )
    );
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      const supabase = createClient();

      const [groupsResult, categoriesResult] =
        await Promise.all([
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
          "Konu oluşturma kategorileri alınamadı:",
          groupsResult.error?.message ??
          categoriesResult.error?.message
        );

        return;
      }

      const groupRows =
        (groupsResult.data ?? []) as CategoryGroupRow[];

      const categoryRows =
        (categoriesResult.data ?? []) as CategoryRow[];

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
                  subcategory.group_id === group.id
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
                      fallbackSubcategory?.label.en ??
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
                  fallbackCategory.description.tr,
              },

              subcategories,
            },
          ];
        });

      if (
        nextCategories.length ===
        categories.length
      ) {
        setCategoryData(nextCategories);
      }
    }

    void loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!attachment) {
      setAttachmentUrl(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(attachment);

    setAttachmentUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [attachment]);

  useEffect(() => {
    const editor = editorRef.current;

    if (
      editor &&
      editor.innerHTML !== content
    ) {
      editor.innerHTML = content;
    }
  }, [content]);
  const t = translations[language];

  const activeCategory =
    categoryData.find(
      (category) =>
        category.id === selectedCategory
    ) ??
    categoryData[0] ??
    categories[0];

  const titleValid =
    title.trim().length >= 10;

  const contentText = useMemo(
    () => getPlainTextFromHtml(content),
    [content]
  );

  const contentValid =
    contentText.length >= 40;

  const activeSubcategory =
    activeCategory.subcategories.find(
      (subcategory) =>
        subcategory.id === selectedSubcategory
    );

  const subcategoryValid =
    Boolean(activeSubcategory?.databaseId);

  const completedSteps = [
    Boolean(selectedCategory),
    subcategoryValid,
    titleValid,
  ].filter(Boolean).length;

  const progress =
    Math.round((completedSteps / 3) * 100);

  const canPublish =
    titleValid &&
    subcategoryValid;

  const activeSubcategoryLabel =
    activeSubcategory?.label[language];

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

  function selectCategory(
    category: CategoryDefinition
  ) {
    setSelectedCategory(category.id);

    setSelectedSubcategory(
      category.subcategories[0]?.id ?? null
    );
  }
  function rememberEditorSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0
    ) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (
      editor.contains(
        range.commonAncestorContainer
      )
    ) {
      savedSelectionRef.current =
        range.cloneRange();
    }
  }

  function restoreEditorSelection() {
    const selection = window.getSelection();
    const savedRange =
      savedSelectionRef.current;

    if (!selection || !savedRange) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
  function applyEditorCommand(
    command: string,
    value?: string
  ) {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();
    restoreEditorSelection();

    document.execCommand(
      command,
      false,
      value
    );

    setContent(editor.innerHTML);

    setBoldActive(
      document.queryCommandState("bold")
    );

    setItalicActive(
      document.queryCommandState("italic")
    );

    rememberEditorSelection();
  }

  function insertEditorLink() {
    const url = window.prompt(
      language === "tr"
        ? "Bağlantı adresini gir:"
        : "Enter the link address:",
      "https://"
    );

    if (!url) {
      return;
    }

    applyEditorCommand(
      "createLink",
      url
    );
  }

  function insertEditorEmoji(
    emoji: string
  ) {
    applyEditorCommand(
      "insertText",
      emoji
    );

    setEmojiMenuOpen(false);
  }

  function addTag() {
    const normalizedTag =
      tagInput
        .trim()
        .replace(/^#/, "");

    if (
      !normalizedTag ||
      tags.length >= 5 ||
      tags.some(
        (tag) =>
          tag.toLocaleLowerCase() ===
          normalizedTag.toLocaleLowerCase()
      )
    ) {
      setTagInput("");
      return;
    }

    setTags(
      (current) => [
        ...current,
        normalizedTag,
      ]
    );

    setTagInput("");
  }

  function handleTagSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    addTag();
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setAttachment(selectedFile);
  }

  function updatePollOption(
    index: number,
    value: string
  ) {
    setPollOptions(
      (current) =>
        current.map(
          (option, optionIndex) =>
            optionIndex === index
              ? value
              : option
        )
    );
  }

  function addPollOption() {
    if (pollOptions.length >= 5) {
      return;
    }

    setPollOptions(
      (current) => [
        ...current,
        "",
      ]
    );
  }

  function removePollOption(
    index: number
  ) {
    if (pollOptions.length <= 2) {
      return;
    }

    setPollOptions(
      (current) =>
        current.filter(
          (_, optionIndex) =>
            optionIndex !== index
        )
    );
  }

  function saveDraft() {
    const draft: SavedDraft = {
      category: selectedCategory,
      subcategory:
        selectedSubcategory,
      title,
      content,
      tags,
      pollEnabled,
      pollOptions,
    };

    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify(draft)
    );

    setHasSavedDraft(true);
    setDraftMessage("saved");

    window.setTimeout(() => {
      setDraftMessage(null);
    }, 2600);
  }

  function loadDraft() {
    const savedDraft =
      window.localStorage.getItem(
        DRAFT_KEY
      );

    if (!savedDraft) {
      return;
    }

    try {
      const draft =
        JSON.parse(
          savedDraft
        ) as SavedDraft;

      setSelectedCategory(
        draft.category
      );

      setSelectedSubcategory(
        draft.subcategory
      );

      setTitle(draft.title ?? "");
      setContent(draft.content ?? "");
      setTags(draft.tags ?? []);

      setPollEnabled(
        Boolean(draft.pollEnabled)
      );

      setPollOptions(
        draft.pollOptions?.length >= 2
          ? draft.pollOptions
          : ["", ""]
      );

      setDraftMessage("loaded");

      window.setTimeout(() => {
        setDraftMessage(null);
      }, 2600);
    }
    catch {
      window.localStorage.removeItem(
        DRAFT_KEY
      );

      setHasSavedDraft(false);
    }
  }

  async function handlePublish() {
    if (
      !canPublish ||
      !activeSubcategory?.databaseId ||
      isPublishing
    ) {
      return;
    }

    setIsPublishing(true);
    setPublishMessage(null);
    setLoginNotice(false);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoginNotice(true);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const sanitizedContent =
        sanitizeTopicHtml(content);

      const {
        data: createdTopic,
        error,
      } = await supabase
        .from("topics")
        .insert({
          author_id: user.id,
          category_id:
            activeSubcategory.databaseId,
          title: title.trim(),
          content: sanitizedContent,
        })
        .select("id")
        .single();

      if (error) {
        console.error(
          "Konu yayınlama hatası:",
          error.message
        );

        setPublishMessage("error");
        return;
      }

      if (!createdTopic?.id) {
        setPublishMessage("error");
        return;
      }

      window.localStorage.removeItem(
        DRAFT_KEY
      );

      setHasSavedDraft(false);

      router.replace(
        `/konu/${createdTopic.id}`
      );
    } catch (error) {
      console.error(
        "Beklenmeyen konu yayınlama hatası:",
        error
      );

      setPublishMessage("error");
    } finally {
      setIsPublishing(false);
    }
  }

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

        {loginNotice && (
          <section className={styles.loginNotice}>
            <span className={styles.loginNoticeIcon}>
              <InfoIcon />
            </span>

            <div>
              <h2>
                {t.loginRequiredTitle}
              </h2>

              <p>
                {
                  t.loginRequiredDescription
                }
              </p>
            </div>

            <div className={styles.loginNoticeActions}>
              <button
                type="button"
                onClick={() =>
                  setLoginNotice(false)
                }
              >
                {t.continueEditing}
              </button>

              <Link href="/giris">
                {t.goLogin}
              </Link>
            </div>
          </section>
        )}

        {draftMessage && (
          <div className={styles.draftMessage}>
            <CheckIcon />

            {draftMessage === "saved"
              ? t.savedMessage
              : t.loadedMessage}
          </div>
        )}

        {publishMessage && (
          <div
            className={styles.draftMessage}
            role="status"
            aria-live="polite"
          >
            {publishMessage === "success" ? (
              <CheckIcon />
            ) : (
              <InfoIcon />
            )}

            {publishMessage === "success"
              ? t.publishSuccess
              : t.publishError}
          </div>
        )}

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span>{t.eyebrow}</span>

            <h1>{t.title}</h1>

            <p>{t.description}</p>
          </div>

          <div
            className={styles.heroProgress}
            style={
              {
                "--progress":
                  `${progress}%`,
              } as CSSProperties
            }
          >
            <div>
              <strong>
                {progress}%
              </strong>

              <span>
                {t.progressComplete}
              </span>
            </div>
          </div>
        </section>

        <div className={styles.editorLayout}>
          <section className={styles.editorPanel}>
            <div className={styles.panelHeading}>
              <div>
                <span>
                  ForumFenomen
                </span>

                <h2>
                  {t.editorTitle}
                </h2>

                <p>
                  {t.editorDescription}
                </p>
              </div>

              <div
                className={styles.selectedCategoryBadge}
                style={
                  {
                    "--accent":
                      activeCategory.accent,
                  } as CSSProperties
                }
              >
                {activeCategory.icon}

                <span>
                  {
                    activeCategory
                      .title[language]
                  }
                </span>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span>01</span>

                <div>
                  <h3>
                    {t.categoryTitle}
                  </h3>

                  <p>
                    {
                      t.categoryDescription
                    }
                  </p>
                </div>
              </div>

              <div className={styles.categoryGrid}>
                {categoryData.map(
                  (category) => {
                    const active =
                      category.id ===
                      selectedCategory;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        className={
                          active
                            ? styles.activeCategory
                            : ""
                        }
                        style={
                          {
                            "--accent":
                              category.accent,
                          } as CSSProperties
                        }
                        onClick={() =>
                          selectCategory(
                            category
                          )
                        }
                      >
                        <span>
                          {category.icon}
                        </span>

                        <strong>
                          {
                            category.title[
                            language
                            ]
                          }
                        </strong>

                        <small>
                          {
                            category
                              .description[
                            language
                            ]
                          }
                        </small>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span>02</span>

                <div>
                  <h3>
                    {
                      t.subcategoryTitle
                    }
                  </h3>

                  <p>
                    {
                      t.subcategoryDescription
                    }
                  </p>
                </div>
              </div>

              {activeCategory.subcategories.length > 0 ? (
                <div
                  className={styles.subcategoryList}
                  style={
                    {
                      "--accent":
                        activeCategory.accent,
                    } as CSSProperties
                  }
                >
                  {activeCategory.subcategories.map(
                    (subcategory) => (
                      <button
                        key={subcategory.id}
                        type="button"
                        className={
                          selectedSubcategory ===
                            subcategory.id
                            ? styles.activeSubcategory
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
              ) : (
                <div className={styles.educationNote}>
                  <EducationIcon />
                  <p>{t.educationNote}</p>
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span>03</span>

                <div>
                  <h3>
                    {t.topicTitle}
                  </h3>

                  <p>
                    {t.titleHint}
                  </p>
                </div>
              </div>

              <div
                className={
                  title.length > 0 &&
                    !titleValid
                    ? `${styles.inputShell} ${styles.inputInvalid}`
                    : styles.inputShell
                }
              >
                <input
                  type="text"
                  value={title}
                  maxLength={120}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.titlePlaceholder
                  }
                />

                <span>
                  {title.length}/120
                </span>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span>04</span>

                <div>
                  <h3>
                    {t.contentTitle}
                  </h3>

                  <p>
                    {t.contentHint}
                  </p>
                </div>
              </div>

              <div className={styles.editorShell}>
                <div className={styles.toolbar}>
                  <button
                    type="button"
                    className={
                      boldActive
                        ? styles.toolbarActive
                        : ""
                    }
                    onClick={() =>
                      applyEditorCommand("bold")
                    }
                    aria-pressed={boldActive}
                    aria-label="Bold"
                    title={
                      language === "tr"
                        ? "Kalın"
                        : "Bold"
                    }
                  >
                    <strong>B</strong>
                  </button>

                  <button
                    type="button"
                    className={
                      italicActive
                        ? styles.toolbarActive
                        : ""
                    }
                    onClick={() =>
                      applyEditorCommand("italic")
                    }
                    aria-pressed={italicActive}
                    aria-label="Italic"
                    title={
                      language === "tr"
                        ? "İtalik"
                        : "Italic"
                    }
                  >
                    <em>I</em>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyEditorCommand(
                        "formatBlock",
                        "h3"
                      )
                    }
                    aria-label="Heading"
                    title={
                      language === "tr"
                        ? "Ara Başlık"
                        : "Subheading"
                    }
                  >
                    H
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyEditorCommand(
                        "insertUnorderedList"
                      )
                    }
                    aria-label="List"
                    title={
                      language === "tr"
                        ? "Liste"
                        : "List"
                    }
                  >
                    ≡
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyEditorCommand(
                        "formatBlock",
                        "blockquote"
                      )
                    }
                    aria-label="Quote"
                    title={
                      language === "tr"
                        ? "Alıntı"
                        : "Quote"
                    }
                  >
                    “
                  </button>

                  <button
                    type="button"
                    onClick={insertEditorLink}
                    aria-label="Link"
                    title={
                      language === "tr"
                        ? "Bağlantı"
                        : "Link"
                    }
                  >
                    ↗
                  </button>

                  <div className={styles.emojiPickerWrap}>
                    <button
                      type="button"
                      className={
                        emojiMenuOpen
                          ? styles.toolbarActive
                          : ""
                      }
                      onMouseDown={(event) => {
                        event.preventDefault();

                        rememberEditorSelection();

                        setEmojiMenuOpen(
                          (current) => !current
                        );
                      }}
                      aria-label="Emoji"
                      title="Emoji"
                      aria-expanded={
                        emojiMenuOpen
                      }
                    >
                      ☺
                    </button>

                    {emojiMenuOpen && (
                      <div
                        className={styles.emojiPicker}
                        role="dialog"
                        aria-label={
                          language === "tr"
                            ? "Emoji seç"
                            : "Choose emoji"
                        }
                      >
                        <div
                          className={
                            styles.emojiPickerHeader
                          }
                        >
                          <strong>
                            {language === "tr"
                              ? "Emoji Seç"
                              : "Choose Emoji"}
                          </strong>

                          <button
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();

                              setEmojiMenuOpen(false);
                            }}
                            aria-label={
                              language === "tr"
                                ? "Emoji panelini kapat"
                                : "Close emoji panel"
                            }
                          >
                            <CloseIcon />
                          </button>
                        </div>

                        <div
                          className={
                            styles.emojiGrid
                          }
                        >
                          {editorEmojis.map(
                            (emoji) => (
                              <button
                                type="button"
                                key={emoji}
                                onMouseDown={(
                                  event
                                ) => {
                                  event.preventDefault();

                                  insertEditorEmoji(
                                    emoji
                                  );
                                }}
                              >
                                {emoji}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  ref={editorRef}
                  className={styles.richEditor}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder={
                    t.contentPlaceholder
                  }
                  onMouseUp={
                    rememberEditorSelection
                  }
                  onKeyUp={
                    rememberEditorSelection
                  }
                  onFocus={
                    rememberEditorSelection
                  }
                  onInput={(event) => {
                    setContent(
                      event.currentTarget.innerHTML
                    );

                    rememberEditorSelection();
                  }}
                  onPaste={(event) => {
                    event.preventDefault();

                    const pastedText =
                      event.clipboardData.getData(
                        "text/plain"
                      );

                    document.execCommand(
                      "insertText",
                      false,
                      pastedText
                    );
                  }}
                  role="textbox"
                  aria-multiline="true"
                  aria-label={t.contentTitle}
                />

                <div className={styles.editorFooter}>
                  <span>
                    Markdown
                  </span>

                  <span>
                    {contentText.length}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span>05</span>

                <div>
                  <h3>{t.tagsTitle}</h3>
                  <p>{t.tagsHint}</p>
                </div>
              </div>

              <form
                className={styles.tagForm}
                onSubmit={handleTagSubmit}
              >
                <TagIcon />

                <input
                  type="text"
                  value={tagInput}
                  disabled={tags.length >= 5}
                  onChange={(event) =>
                    setTagInput(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.tagsPlaceholder
                  }
                />

                <button
                  type="submit"
                  disabled={
                    !tagInput.trim() ||
                    tags.length >= 5
                  }
                >
                  <PlusIcon />
                </button>
              </form>

              {tags.length > 0 && (
                <div className={styles.tagList}>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setTags(
                          (current) =>
                            current.filter(
                              (item) =>
                                item !== tag
                            )
                        )
                      }
                    >
                      #{tag}
                      <CloseIcon />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span>06</span>

                <div>
                  <h3>{t.mediaTitle}</h3>
                  <p>
                    {
                      t.mediaDescription
                    }
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                disabled
                onChange={handleFileChange}
              />

              {attachmentUrl ? (
                <div className={styles.attachmentPreview}>
                  <img
                    src={attachmentUrl}
                    alt=""
                  />

                  <div>
                    <strong>
                      {attachment?.name}
                    </strong>

                    <span>
                      {attachment
                        ? `${Math.ceil(
                          attachment.size /
                          1024
                        )} KB`
                        : ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAttachment(null);

                      if (
                        fileInputRef.current
                      ) {
                        fileInputRef.current.value =
                          "";
                      }
                    }}
                    aria-label={
                      t.removeFile
                    }
                  >
                    <TrashIcon />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`${styles.uploadButton} ${styles.uploadButtonDisabled}`}
                  disabled
                  aria-disabled="true"
                >
                  <span>
                    <ImageIcon />
                  </span>

                  <div>
                    <strong>
                      {t.selectFile}
                    </strong>

                    <small>
                      PNG, JPG, WEBP
                    </small>
                  </div>

                  <span className={styles.comingSoonBadge}>
                    Yakında
                  </span>
                </button>
              )}
            </div>

            <div className={styles.formSection}>
              <div className={styles.pollHeading}>
                <div className={styles.sectionLabel}>
                  <span>07</span>

                  <div>
                    <h3>
                      {t.pollTitle}
                    </h3>

                    <p>
                      {
                        t.pollDescription
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={
                    pollEnabled
                      ? styles.toggleActive
                      : styles.toggle
                  }
                  onClick={() =>
                    setPollEnabled(
                      (current) =>
                        !current
                    )
                  }
                  aria-pressed={
                    pollEnabled
                  }
                >
                  <span />
                </button>
              </div>

              {pollEnabled && (
                <div className={styles.pollOptions}>
                  {pollOptions.map(
                    (option, index) => (
                      <div key={index}>
                        <PollIcon />

                        <input
                          type="text"
                          value={option}
                          maxLength={80}
                          onChange={(event) =>
                            updatePollOption(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`${t.pollOption} ${index + 1
                            }`}
                        />

                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              removePollOption(
                                index
                              )
                            }
                            aria-label={
                              t.removeOption
                            }
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    )
                  )}

                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      className={styles.addPollOption}
                      onClick={addPollOption}
                    >
                      <PlusIcon />
                      {t.addOption}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className={styles.sidebar}>
            <section className={styles.guidelinesCard}>
              <div className={styles.sidebarHeading}>
                <span>
                  <InfoIcon />
                </span>

                <div>
                  <small>
                    ForumFenomen
                  </small>

                  <h2>
                    {t.guidelinesTitle}
                  </h2>
                </div>
              </div>

              <ul>
                <li>
                  <CheckIcon />
                  {t.guidelineOne}
                </li>

                <li>
                  <CheckIcon />
                  {t.guidelineTwo}
                </li>

                <li>
                  <CheckIcon />
                  {t.guidelineThree}
                </li>

                <li>
                  <CheckIcon />
                  {t.guidelineFour}
                </li>
              </ul>
            </section>

            <section className={styles.progressCard}>
              <div className={styles.progressHeading}>
                <div>
                  <span>
                    {t.progressTitle}
                  </span>

                  <strong>
                    {progress}%
                  </strong>
                </div>

                <span
                  className={styles.progressRing}
                  style={
                    {
                      "--progress":
                        `${progress * 3.6}deg`,
                      "--accent":
                        activeCategory.accent,
                    } as CSSProperties
                  }
                />
              </div>

              <div className={styles.progressTrack}>
                <span
                  style={
                    {
                      width:
                        `${progress}%`,
                      "--accent":
                        activeCategory.accent,
                    } as CSSProperties
                  }
                />
              </div>

              <div className={styles.progressChecklist}>
                <span
                  className={
                    selectedCategory
                      ? styles.completed
                      : ""
                  }
                >
                  <CheckIcon />
                  {t.categoryTitle}
                </span>

                <span
                  className={
                    subcategoryValid
                      ? styles.completed
                      : ""
                  }
                >
                  <CheckIcon />
                  {t.subcategoryTitle}
                </span>

                <span
                  className={
                    titleValid
                      ? styles.completed
                      : ""
                  }
                >
                  <CheckIcon />
                  {t.topicTitle}
                </span>
              </div>
            </section>

            <section className={styles.actionCard}>
              <div>
                <span>
                  {t.draftTitle}
                </span>

                <p>
                  {t.publishingNote}
                </p>
              </div>

              <button
                type="button"
                className={styles.saveButton}
                onClick={saveDraft}
              >
                <SaveIcon />
                {t.saveDraft}
              </button>

              {hasSavedDraft && (
                <button
                  type="button"
                  className={styles.loadButton}
                  onClick={loadDraft}
                >
                  <SaveIcon />
                  {t.loadDraft}
                </button>
              )}

              <button
                type="button"
                className={styles.previewButton}
                onClick={() =>
                  setPreviewOpen(true)
                }
              >
                <EyeIcon />
                {t.preview}
              </button>

              <button
                type="button"
                className={styles.publishButton}
                disabled={!canPublish || isPublishing}
                onClick={handlePublish}
                aria-busy={isPublishing}
                style={
                  {
                    "--accent":
                      activeCategory.accent,
                  } as CSSProperties
                }
              >
                <SendIcon />

                {isPublishing
                  ? t.publishing
                  : t.publish}
              </button>

              {!canPublish && (
                <small className={styles.validationMessage}>
                  {
                    t.allFieldsNotice
                  }
                </small>
              )}
            </section>
          </aside>
        </div>
      </div>

      {previewOpen && (
        <div
          className={styles.previewOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={t.previewTitle}
        >
          <button
            type="button"
            className={styles.previewBackdrop}
            onClick={() =>
              setPreviewOpen(false)
            }
            aria-label={
              t.closePreview
            }
          />

          <article className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <div>
                <span>
                  {t.previewTitle}
                </span>

                <small>
                  {
                    activeCategory
                      .title[language]
                  }

                  {activeSubcategoryLabel
                    ? ` · ${activeSubcategoryLabel}`
                    : ""}
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewOpen(false)
                }
                aria-label={
                  t.closePreview
                }
              >
                <CloseIcon />
              </button>
            </div>

            {attachmentUrl && (
              <img
                className={styles.previewImage}
                src={attachmentUrl}
                alt=""
              />
            )}

            <div className={styles.previewContent}>
              <span
                className={styles.previewCategory}
                style={
                  {
                    "--accent":
                      activeCategory.accent,
                  } as CSSProperties
                }
              >
                {activeCategory.icon}

                {
                  activeCategory
                    .title[language]
                }
              </span>

              <h1>
                {title.trim() ||
                  t.noTitle}
              </h1>

              {contentText ? (
                <div
                  className={styles.previewArticleBody}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeTopicHtml(content),
                  }}
                />
              ) : (
                <p>{t.noContent}</p>
              )}

              {tags.length > 0 && (
                <div className={styles.previewTags}>
                  {tags.map((tag) => (
                    <span key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {pollEnabled && (
                <div className={styles.previewPoll}>
                  <strong>
                    {t.pollTitle}
                  </strong>

                  {pollOptions
                    .filter(
                      (option) =>
                        option.trim()
                    )
                    .map(
                      (option, index) => (
                        <span key={index}>
                          <i />
                          {option}
                        </span>
                      )
                    )}
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      <ForumFooter />


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
          aria-current="page"
          aria-label={t.createTopic}
          title={t.createTopic}
        >
          <span className="ff-center-nav-glow" />

          <span className="ff-center-nav-image">
            <Image
              src="/forumfenomen-icon-256.png"
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





