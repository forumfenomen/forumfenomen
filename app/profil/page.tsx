"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
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

type ProfileRole =
  | "user"
  | "moderator"
  | "admin";

type VisibilityOption =
  | "public"
  | "followers"
  | "following";

type SectionId =
  | "profile"
  | "topics"
  | "comments"
  | "followers"
  | "following"
  | "saved"
  | "notifications"
  | "settings";

type MenuItem = {
  id: SectionId;
  icon: ReactNode;
  count?: number;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  related_report_id: string | null;
  related_topic_id: string | null;
  related_comment_id: string | null;
  related_user_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type SavedTopicRow = {
  topic_id: string;
  created_at: string;

  topics: {
    id: string;
    title: string;
    comment_count: number;
    status: string;

    categories: {
      name: string;
    } | null;
  } | null;
};

type SavedBlogSaveRow = {
  blog_post_id: string;
  created_at: string;
};

type SavedBlogPostRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  reading_time: number | string | null;
  status: string;
  published_at: string | null;
};

type SavedBlogRow = SavedBlogSaveRow & {
  blogPost: SavedBlogPostRow;
};

type ProfileTopicRow = {
  id: string;
  title: string;
  created_at: string;
  comment_count: number;
  status: string;

  categories: {
    name: string;
  } | null;
};

type ProfileCommentRow = {
  id: string;
  content: string;
  created_at: string;
  topic_id: string;
  status: string;

  topics: {
    id: string;
    title: string;
    status: string;
  } | null;
};

type FollowedUserRow = {
  following_id: string;
  created_at: string;

  profiles: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

type FollowerUserRow = {
  follower_id: string;
  created_at: string;

  profiles: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

type FollowRequestRow = {
  id: string;
  requester_id: string;
  created_at: string;

  profiles: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

type ProfileActivity = {
  id: string;
  type: "topic" | "comment" | "saved" | "following";
  title: string;
  detail: string;
  created_at: string;
  href: string | null;
};

const translations = {
  tr: {
    pageTitle: "Profil",
    profile: "Profilim",
    topics: "Konularım",
    comments: "Yorumlarım",
    followers: "Takipçilerim",
    following: "Takip Ettiklerim",
    saved: "Kaydedilenler",
    notifications: "Bildirimler",
    settings: "Ayarlar",
    adminPanel: "Yönetim Paneli",
    moderatorPanel: "Moderatör Paneli",
    plusMembership: "PLUS ÜYELİK",
    logout: "Çıkış Yap",
    editProfile: "Profili Düzenle",
    close: "Kapat",
    save: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    name: "Görünen Ad",
    username: "Kullanıcı Adı",
    bio: "Kısa Biyografi",
    memberBadge: "Üye",
    moderatorBadge: "Moderatör",
    adminBadge: "Yönetici",
    topicCount: "Konu",
    commentCount: "Yorum",
    followerCount: "Takipçi",
    followingCount: "Takip",
    level: "Fenomen Seviyesi",
    levelNumber: "Seviye 7",
    levelProgress: "Bir sonraki seviyeye 580 puan kaldı",
    points: "1.420 / 2.000 puan",
    profileSummary: "Profil Özeti",
    interests: "İlgi Alanları",
    recentActivity: "Son Aktiviteler",
    activityDescription:
      "ForumFenomen üzerindeki son hareketlerin burada görünür.",
    topicsDescription:
      "Açtığın konuları görüntüle, düzenle ve gelen yorumları takip et.",
    commentsDescription:
      "Forumdaki diğer konulara yaptığın son yorumlar.",
    followersDescription:
      "Seni takip eden ForumFenomen kullanıcıları.",
    followingDescription:
      "Takip ettiğin kullanıcılar ve içerik başlıkları.",
    savedDescription:
      "Daha sonra okumak için kaydettiğin konular.",
    notificationsDescription:
      "Bildirim tercihlerini ve son bildirimlerini yönet.",
    settingsDescription:
      "Hesap, gizlilik ve görünüm tercihlerini yönet.",
    searchPlaceholder: "Profil içeriğinde ara...",
    markAllRead: "Tümünü Okundu İşaretle",
    accountSettings: "Hesap Ayarları",
    privacySettings: "Gizlilik",
    appearanceSettings: "Görünüm",
    emailNotifications: "E-posta bildirimleri",
    pushNotifications: "Anlık bildirimler",
    profileVisibility: "Profil görünürlüğü",
    publicProfile: "Herkese Açık",
    themeLabel: "Tema",
    languageLabel: "Dil",
    currentThemeDark: "Koyu",
    currentThemeLight: "Açık",
    currentLanguageTr: "Türkçe",
    currentLanguageEn: "İngilizce",
    adLabel: "REKLAM",
    adTitle: "Markanız burada görünsün ister misiniz?",
    adDescription:
      "ForumFenomen reklam alanında hedef kitlenize ulaşın.",
    advertise: "Reklam Ver",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    createTopic: "Konu Oluştur",
    blog: "Blog",
    profileNav: "Profil",
    changeTheme: "Temayı değiştir",
    search: "Ara",
    notificationTitle: "Bildirimler",
    savedMessage: "Profil bilgileriniz kaydedildi.",
    empty: "Bu bölümde henüz içerik bulunmuyor.",
    bioDefault:
      "Dijital dünya, içerik üretimi ve yeni fikirlerin peşinde.",
  },
  en: {
    pageTitle: "Profile",
    profile: "My Profile",
    topics: "My Topics",
    comments: "My Comments",
    followers: "Followers",
    following: "Following",
    saved: "Saved Topics",
    notifications: "Notifications",
    settings: "Settings",
    adminPanel: "Admin Panel",
    moderatorPanel: "Moderator Panel",
    plusMembership: "PLUS MEMBERSHIP",
    logout: "Log Out",
    editProfile: "Edit Profile",
    close: "Close",
    save: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    name: "Display Name",
    username: "Username",
    bio: "Short Biography",
    memberBadge: "Member",
    moderatorBadge: "Moderator",
    adminBadge: "Administrator",
    topicCount: "Topics",
    commentCount: "Comments",
    followerCount: "Followers",
    followingCount: "Following",
    level: "Fenomen Level",
    levelNumber: "Level 7",
    levelProgress: "580 points remaining until the next level",
    points: "1,420 / 2,000 points",
    profileSummary: "Profile Summary",
    interests: "Interests",
    recentActivity: "Recent Activity",
    activityDescription:
      "Your latest activity on ForumFenomen appears here.",
    topicsDescription:
      "View and manage your topics and follow new replies.",
    commentsDescription:
      "Your latest comments on ForumFenomen topics.",
    followersDescription:
      "ForumFenomen users who follow you.",
    followingDescription:
      "Users and content categories you currently follow.",
    savedDescription:
      "Topics you saved to read later.",
    notificationsDescription:
      "Manage notification preferences and recent alerts.",
    settingsDescription:
      "Manage account, privacy and appearance preferences.",
    searchPlaceholder: "Search profile content...",
    markAllRead: "Mark All as Read",
    accountSettings: "Account Settings",
    privacySettings: "Privacy",
    appearanceSettings: "Appearance",
    emailNotifications: "Email notifications",
    pushNotifications: "Push notifications",
    profileVisibility: "Profile visibility",
    publicProfile: "Public",
    themeLabel: "Theme",
    languageLabel: "Language",
    currentThemeDark: "Dark",
    currentThemeLight: "Light",
    currentLanguageTr: "Turkish",
    currentLanguageEn: "English",
    adLabel: "ADVERTISEMENT",
    adTitle: "Would you like your brand to appear here?",
    adDescription:
      "Reach your target audience in ForumFenomen advertising spaces.",
    advertise: "Advertise",
    home: "Home",
    categories: "Categories",
    createTopic: "Create Topic",
    blog: "Blog",
    profileNav: "Profile",
    changeTheme: "Change theme",
    search: "Search",
    notificationTitle: "Notifications",
    savedMessage: "Your profile details have been saved.",
    empty: "There is no content in this section yet.",
    bioDefault:
      "Exploring the digital world, content creation and new ideas.",
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
      <path d="M10 21h4" />
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

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 18.5 3.5 21l.7-4A8 8 0 1 1 20 13a8 8 0 0 1-12.2 6.8L5 18.5Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6" />
      <path d="M15 15c3.5 0 5.3 1.7 6 5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 20 6v5c0 5.2-3.3 8.5-8 10-4.7-1.5-8-4.8-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5v-3l-2-.7-.6-1.5.9-1.9-2.1-2.1-1.9.9-1.5-.6L11 2H8l-.7 2.6-1.5.6-1.9-.9-2.1 2.1.9 1.9-.6 1.5-2 .7v3l2 .7.6 1.5-.9 1.9 2.1 2.1 1.9-.9 1.5.6L8 22h3l.7-2.6 1.5-.6 1.9.9 2.1-2.1-.9-1.9.6-1.5 2.1-.7Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 5H5v14h5" />
      <path d="M13 8l4 4-4 4" />
      <path d="M17 12H9" />
    </svg>
  );
}

function TopicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20Z" />
      <path d="m13.5 7 3.5 3.5" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

const sampleTopics = {
  tr: [
    {
      title: "Instagram erişimleri son dönemde neden düştü?",
      meta: "Platformlar · 64 yorum",
    },
    {
      title: "Yapay zeka ile içerik planlamanın en kolay yolu",
      meta: "İçerik Üretimi · 38 yorum",
    },
    {
      title: "Affiliate marketing başlangıç önerileri",
      meta: "Para Kazanma · 27 yorum",
    },
  ],
  en: [
    {
      title: "Why has Instagram reach dropped recently?",
      meta: "Platforms · 64 comments",
    },
    {
      title: "The easiest way to plan content with AI",
      meta: "Content Creation · 38 comments",
    },
    {
      title: "Affiliate marketing tips for beginners",
      meta: "Monetization · 27 comments",
    },
  ],
};

const sampleComments = {
  tr: [
    {
      title: "YouTube Shorts ile İlk 100 Bin İzlenme",
      text: "İlk üç saniye ve izlenme süresi gerçekten en kritik iki nokta.",
    },
    {
      title: "UGC içerikleri nasıl fiyatlandırılmalı?",
      text: "Paket fiyatlandırması tek video fiyatından daha mantıklı olabilir.",
    },
    {
      title: "Instagram Bio SEO Nedir?",
      text: "Kullanıcı adı ve açıklamada anahtar kelime kullanmak fark yaratıyor.",
    },
  ],
  en: [
    {
      title: "Your First 100K Views with YouTube Shorts",
      text: "The first three seconds and retention are the two most important factors.",
    },
    {
      title: "How should UGC content be priced?",
      text: "Package pricing may work better than pricing a single video.",
    },
    {
      title: "What Is Instagram Bio SEO?",
      text: "Using keywords in the username and biography can make a difference.",
    },
  ],
};

const sampleActivities = {
  tr: [
    {
      title: "Yeni bir konu oluşturdun",
      detail: "Instagram erişimleri son dönemde neden düştü?",
      time: "2 saat önce",
    },
    {
      title: "Bir yoruma cevap verdin",
      detail: "YouTube Shorts ile İlk 100 Bin İzlenme",
      time: "5 saat önce",
    },
    {
      title: "Bir konuyu kaydettin",
      detail: "Affiliate Marketing Başlangıç Rehberi",
      time: "Dün",
    },
  ],
  en: [
    {
      title: "You created a new topic",
      detail: "Why has Instagram reach dropped recently?",
      time: "2 hours ago",
    },
    {
      title: "You replied to a comment",
      detail: "Your First 100K Views with YouTube Shorts",
      time: "5 hours ago",
    },
    {
      title: "You saved a topic",
      detail: "Beginner's Guide to Affiliate Marketing",
      time: "Yesterday",
    },
  ],
};

const INTEREST_OPTIONS = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Yapay Zeka",
  "İçerik Üretimi",
  "UGC",
  "Affiliate",
  "Girişimcilik",
  "E-Ticaret",
  "SEO",
] as const;

export default function ProfilePage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [activeSection, setActiveSection] =
    useState<SectionId>("profile");

  const profileContentRef =
    useRef<HTMLDivElement | null>(null);

  function openProfileSection(
    section: SectionId
  ) {
    setActiveSection(section);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        profileContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  useEffect(() => {
    const section =
      new URLSearchParams(
        window.location.search
      ).get("section");

    if (section === "followers") {
      setActiveSection("followers");

      requestAnimationFrame(() => {
        document
          .getElementById("profile-main-content")
          ?.scrollIntoView({
            block: "start",
          });
      });
    }
  }, []);


  const [editOpen, setEditOpen] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    privacySaving,
    setPrivacySaving,
  ] = useState(false);

  const [
    privacySaved,
    setPrivacySaved,
  ] = useState(false);

  const [profileName, setProfileName] =
    useState("ForumFenomen Üyesi");

  const [profileRole, setProfileRole] =
    useState<ProfileRole>("user");

  const hasManagementAccess =
    profileRole === "admin" ||
    profileRole === "moderator";

  const managementPanelLabel =
    profileRole === "admin"
      ? translations[language].adminPanel
      : translations[language].moderatorPanel;

  const [username, setUsername] =
    useState("@fenomen");

  const [
    originalUsername,
    setOriginalUsername,
  ] = useState("");

  const [
    usernameIsTemporary,
    setUsernameIsTemporary,
  ] = useState(false);

  const [
    usernameError,
    setUsernameError,
  ] = useState("");

  const [profileBio, setProfileBio] =
    useState("");

  const [selectedInterests, setSelectedInterests] =
    useState<string[]>([]);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [profileEmail, setProfileEmail] =
    useState("");

  const [
    emailNotificationsEnabled,
    setEmailNotificationsEnabled,
  ] = useState(true);

  const [
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
  ] = useState(true);

  const [
    notificationSettingsSaving,
    setNotificationSettingsSaving,
  ] = useState(false);

  const [
    profileVisibility,
    setProfileVisibility,
  ] = useState<VisibilityOption>("public");

  const [
    followersVisibility,
    setFollowersVisibility,
  ] = useState<VisibilityOption>("public");

  const [
    followingVisibility,
    setFollowingVisibility,
  ] = useState<VisibilityOption>("public");

  const [
    commentsVisibility,
    setCommentsVisibility,
  ] = useState<VisibilityOption>("public");

  const [
    likesVisibility,
    setLikesVisibility,
  ] = useState<VisibilityOption>("public");

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationRow[]>([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(true);

  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(0);

  const [savedTopics, setSavedTopics] =
    useState<SavedTopicRow[]>([]);

  const [savedTopicsLoading, setSavedTopicsLoading] =
    useState(true);

  const [removingSavedTopicId, setRemovingSavedTopicId] =
    useState<string | null>(null);

  const [savedBlogs, setSavedBlogs] =
    useState<SavedBlogRow[]>([]);

  const [savedBlogsLoading, setSavedBlogsLoading] =
    useState(true);

  const [removingSavedBlogId, setRemovingSavedBlogId] =
    useState<string | null>(null);

  const [profileTopics, setProfileTopics] =
    useState<ProfileTopicRow[]>([]);

  const [profileTopicsLoading, setProfileTopicsLoading] =
    useState(true);

  const [profileComments, setProfileComments] =
    useState<ProfileCommentRow[]>([]);

  const [profileCommentsLoading, setProfileCommentsLoading] =
    useState(true);

  const [followedUsers, setFollowedUsers] =
    useState<FollowedUserRow[]>([]);

  const [followerUsers, setFollowerUsers] =
    useState<FollowerUserRow[]>([]);

  const [
    followRequests,
    setFollowRequests,
  ] = useState<FollowRequestRow[]>([]);

  const [
    followRequestsLoading,
    setFollowRequestsLoading,
  ] = useState(true);

  const [
    respondingFollowRequestId,
    setRespondingFollowRequestId,
  ] = useState<string | null>(null);

  const [followersLoading, setFollowersLoading] =
    useState(true);

  const [followsLoading, setFollowsLoading] =
    useState(true);

  const [followerCount, setFollowerCount] =
    useState(0);

  const [followingCount, setFollowingCount] =
    useState(0);

  const [unfollowingUserId, setUnfollowingUserId] =
    useState<string | null>(null);

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

    setProfileBio(
      translations[savedLanguage].bioDefault
    );
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAuthenticatedUser() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        window.location.replace("/giris");
        return;
      }

      setIsAuthenticated(true);

      const metadata =
        (user.user_metadata ?? {}) as Record<
          string,
          unknown
        >;

      const googleIdentity =
        user.identities?.find(
          (identity) =>
            identity.provider === "google"
        );

      const identityData =
        (googleIdentity?.identity_data ??
          {}) as Record<string, unknown>;

      function firstText(
        ...values: unknown[]
      ): string | null {
        for (const value of values) {
          if (
            typeof value === "string" &&
            value.trim()
          ) {
            return value.trim();
          }
        }

        return null;
      }

      const firstName = firstText(
        metadata.given_name,
        identityData.given_name
      );

      const lastName = firstText(
        metadata.family_name,
        identityData.family_name
      );

      const combinedName = [
        firstName,
        lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const fallbackName =
        firstText(
          metadata.full_name,
          metadata.name,
          identityData.full_name,
          identityData.name,
          combinedName
        ) ?? "ForumFenomen Üyesi";

      const fallbackAvatar = firstText(
        metadata.avatar_url,
        metadata.picture,
        identityData.avatar_url,
        identityData.picture
      );

      const email = user.email ?? "";

      const emailUsername =
        email
          .split("@")[0]
          ?.toLowerCase()
          .replace(
            /[^a-z0-9._-]/g,
            ""
          ) ?? "";

      const fallbackUsername =
        emailUsername ||
        `fenomen-${user.id.slice(0, 6)}`;

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(`
  display_name,
  username,
  role,
  username_is_temporary,
  avatar_url,
  bio,
  interests,
  profile_visibility,
  followers_visibility,
  following_visibility,
  comments_visibility,
  likes_visibility,
  email_notifications,
  push_notifications
`)
        .eq("id", user.id)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (profileError) {
        console.error(
          "Profil bilgileri alınamadı:",
          profileError.message
        );
      }

      const databaseUsername =
        typeof profile?.username === "string"
          ? profile.username
            .trim()
            .replace(/^@/, "")
          : "";

      const databaseBio =
        typeof profile?.bio === "string" &&
          profile.bio.trim()
          ? profile.bio
          : translations[getForumLanguage()]
            .bioDefault;

      setProfileEmail(email);

      setProfileName(
        typeof profile?.display_name === "string" &&
          profile.display_name.trim()
          ? profile.display_name.trim()
          : fallbackName
      );

      setProfileRole(
        profile?.role === "admin" ||
          profile?.role === "moderator"
          ? profile.role
          : "user"
      );

      const resolvedUsername =
        databaseUsername || fallbackUsername;

      setUsername(`@${resolvedUsername}`);

      setOriginalUsername(resolvedUsername);

      setUsernameIsTemporary(
        profile?.username_is_temporary === true
      );

      setAvatarUrl(
        typeof profile?.avatar_url === "string" &&
          profile.avatar_url.trim()
          ? profile.avatar_url
          : fallbackAvatar
      );

      setProfileBio(databaseBio);

      setProfileVisibility(
        profile?.profile_visibility === "followers" ||
          profile?.profile_visibility === "following"
          ? profile.profile_visibility
          : "public"
      );

      setFollowersVisibility(
        profile?.followers_visibility === "followers" ||
          profile?.followers_visibility === "following"
          ? profile.followers_visibility
          : "public"
      );

      setFollowingVisibility(
        profile?.following_visibility === "followers" ||
          profile?.following_visibility === "following"
          ? profile.following_visibility
          : "public"
      );

      setCommentsVisibility(
        profile?.comments_visibility === "followers" ||
          profile?.comments_visibility === "following"
          ? profile.comments_visibility
          : "public"
      );

      setLikesVisibility(
        profile?.likes_visibility === "followers" ||
          profile?.likes_visibility === "following"
          ? profile.likes_visibility
          : "public"
      );

      setEmailNotificationsEnabled(
        profile?.email_notifications !== false
      );

      setPushNotificationsEnabled(
        profile?.push_notifications !== false
      );

      setSelectedInterests(
        Array.isArray(profile?.interests)
          ? profile.interests.filter(
            (interest): interest is string =>
              typeof interest === "string"
          )
          : []
      );
    }

    void loadAuthenticatedUser();

    return () => {
      isActive = false;
    };
  }, []);


  useEffect(() => {
    let isActive = true;

    const supabase = createClient();

    let notificationChannel:
      ReturnType<typeof supabase.channel> | null =
      null;

    async function loadNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (!user) {
        setNotifications([]);
        setUnreadNotificationCount(0);
        setNotificationsLoading(false);
        return;
      }

      const [listResult, countResult] =
        await Promise.all([
          supabase
            .from("notifications")
            .select(`
            id,
            type,
            title,
            message,
            related_report_id,
            related_comment_id,
            related_topic_id,
            related_user_id,
            is_read,
            read_at,
            created_at
          `)
            .order("created_at", {
              ascending: false,
            })
            .limit(50),

          supabase
            .from("notifications")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("is_read", false),
        ]);

      if (!isActive) {
        return;
      }

      if (listResult.error || countResult.error) {
        console.error(
          "Profil bildirimleri alınamadı:",
          listResult.error?.message ??
          countResult.error?.message
        );

        setNotifications([]);
        setUnreadNotificationCount(0);
        setNotificationsLoading(false);
        return;
      }

      setNotifications(
        (listResult.data ?? []) as NotificationRow[]
      );

      setUnreadNotificationCount(
        countResult.count ?? 0
      );

      setNotificationsLoading(false);
    }

    async function setupRealtimeNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      await loadNotifications();

      if (!user) {
        return;
      }

      notificationChannel = supabase
        .channel(
          `profile-notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void loadNotifications();
          }
        )
        .subscribe((status) => {
          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.error(
              "Profil bildirim Realtime bağlantısı kurulamadı:",
              status
            );
          }
        });
    }

    void setupRealtimeNotifications();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    }, 120_000);

    function handleFocus() {
      void loadNotifications();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      isActive = false;

      window.clearInterval(intervalId);

      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (notificationChannel) {
        void supabase.removeChannel(
          notificationChannel
        );
      }
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSavedTopics() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setSavedTopics([]);
        setSavedTopicsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_topics")
        .select(`
        topic_id,
        created_at,
        topics (
          id,
          title,
          comment_count,
          status,
          categories (
            name
          )
        )
      `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error(
          "Kaydedilen konular alınamadı:",
          error.message
        );

        setSavedTopics([]);
        setSavedTopicsLoading(false);
        return;
      }

      const rows =
        (data ?? []) as unknown as SavedTopicRow[];

      setSavedTopics(
        rows.filter(
          (item) =>
            item.topics &&
            item.topics.status === "published"
        )
      );

      setSavedTopicsLoading(false);
    }

    void loadSavedTopics();

    function handleSavedTopicsChanged() {
      void loadSavedTopics();
    }

    window.addEventListener(
      "focus",
      handleSavedTopicsChanged
    );

    return () => {
      isActive = false;

      window.removeEventListener(
        "focus",
        handleSavedTopicsChanged
      );
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSavedBlogs() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setSavedBlogs([]);
        setSavedBlogsLoading(false);
        return;
      }

      const {
        data: saveData,
        error: saveError,
      } = await supabase
        .from("blog_post_saves")
        .select(`
          blog_post_id,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (!isActive) {
        return;
      }

      if (saveError) {
        console.error(
          "Kaydedilen blog yazıları alınamadı:",
          saveError.message
        );

        setSavedBlogs([]);
        setSavedBlogsLoading(false);
        return;
      }

      const saves =
        (saveData ?? []) as unknown as SavedBlogSaveRow[];

      if (saves.length === 0) {
        setSavedBlogs([]);
        setSavedBlogsLoading(false);
        return;
      }

      const blogPostIds = Array.from(
        new Set(
          saves.map((save) => save.blog_post_id)
        )
      );

      const now = new Date().toISOString();

      const {
        data: postData,
        error: postError,
      } = await supabase
        .from("blog_posts")
        .select(`
          id,
          slug,
          title,
          category,
          reading_time,
          status,
          published_at
        `)
        .in("id", blogPostIds)
        .eq("status", "published")
        .not("published_at", "is", null)
        .lte("published_at", now);

      if (!isActive) {
        return;
      }

      if (postError) {
        console.error(
          "Kaydedilen blog yazılarının detayları alınamadı:",
          postError.message
        );

        setSavedBlogs([]);
        setSavedBlogsLoading(false);
        return;
      }

      const posts =
        (postData ?? []) as unknown as SavedBlogPostRow[];

      const postsById = new Map(
        posts.map(
          (post) =>
            [post.id, post] as const
        )
      );

      const rows = saves
        .map((save) => {
          const blogPost =
            postsById.get(save.blog_post_id);

          if (!blogPost) {
            return null;
          }

          return {
            ...save,
            blogPost,
          };
        })
        .filter(
          (item): item is SavedBlogRow =>
            item !== null
        );

      setSavedBlogs(rows);
      setSavedBlogsLoading(false);
    }

    void loadSavedBlogs();

    function handleSavedBlogsChanged() {
      void loadSavedBlogs();
    }

    window.addEventListener(
      "focus",
      handleSavedBlogsChanged
    );

    return () => {
      isActive = false;

      window.removeEventListener(
        "focus",
        handleSavedBlogsChanged
      );
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadProfileTopics() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setProfileTopics([]);
        setProfileTopicsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("topics")
        .select(`
        id,
        title,
        created_at,
        comment_count,
        status,
        categories (
          name
        )
      `)
        .eq("author_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error(
          "Profil konuları alınamadı:",
          error.message
        );

        setProfileTopics([]);
        setProfileTopicsLoading(false);
        return;
      }

      setProfileTopics(
        (data ?? []) as unknown as ProfileTopicRow[]
      );

      setProfileTopicsLoading(false);
    }

    void loadProfileTopics();

    function handleWindowFocus() {
      void loadProfileTopics();
    }

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      isActive = false;

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadProfileComments() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setProfileComments([]);
        setProfileCommentsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("topic_comments")
        .select(`
        id,
        content,
        created_at,
        topic_id,
        status,
        topics (
          id,
          title,
          status
        )
      `)
        .eq("author_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error(
          "Profil yorumları alınamadı:",
          error.message
        );

        setProfileComments([]);
        setProfileCommentsLoading(false);
        return;
      }

      setProfileComments(
        (data ?? []) as unknown as ProfileCommentRow[]
      );

      setProfileCommentsLoading(false);
    }

    void loadProfileComments();

    function handleWindowFocus() {
      void loadProfileComments();
    }

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      isActive = false;

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadFollowData() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setFollowedUsers([]);
        setFollowerUsers([]);
        setFollowerCount(0);
        setFollowingCount(0);
        setFollowsLoading(false);
        setFollowersLoading(false);
        return;
      }

      const followDataResult =
        await supabase.rpc(
          "get_profile_follow_data",
          {
            p_profile_id: user.id,
          }
        );

      if (!isActive) {
        return;
      }

      if (followDataResult.error) {
        console.error(
          "Guvenli takip bilgileri alinamadi:",
          followDataResult.error.message
        );

        setFollowedUsers([]);
        setFollowerUsers([]);
        setFollowerCount(0);
        setFollowingCount(0);
        setFollowsLoading(false);
        setFollowersLoading(false);
        return;
      }

      const followData =
        followDataResult.data?.[0] as
        | {
          follower_count:
          | number
          | string
          | null;

          following_count:
          | number
          | string
          | null;

          followers:
          FollowerUserRow[]
          | null;

          following_users:
          FollowedUserRow[]
          | null;
        }
        | undefined;

      const followedRows =
        Array.isArray(
          followData?.following_users
        )
          ? followData.following_users
          : [];

      const followerRows =
        Array.isArray(
          followData?.followers
        )
          ? followData.followers
          : [];

      setFollowedUsers(
        followedRows.filter(
          (item) => item.profiles
        )
      );

      setFollowerUsers(
        followerRows.filter(
          (item) => item.profiles
        )
      );

      const nextFollowerCount = Number(
        followData?.follower_count ?? 0
      );

      const nextFollowingCount = Number(
        followData?.following_count ?? 0
      );

      setFollowerCount(
        Number.isFinite(nextFollowerCount)
          ? nextFollowerCount
          : 0
      );

      setFollowingCount(
        Number.isFinite(nextFollowingCount)
          ? nextFollowingCount
          : 0
      );

      setFollowsLoading(false);
      setFollowersLoading(false);
    }

    void loadFollowData();

    function handleFollowDataRefresh() {
      void loadFollowData();
    }

    window.addEventListener(
      "focus",
      handleFollowDataRefresh
    );

    return () => {
      isActive = false;

      window.removeEventListener(
        "focus",
        handleFollowDataRefresh
      );
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadFollowRequests() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setFollowRequests([]);
        setFollowRequestsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_follow_requests")
        .select(`
        id,
        requester_id,
        created_at,
        profiles:profiles!user_follow_requests_requester_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        )
      `)
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", {
          ascending: false,
        });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error(
          "Takip istekleri alınamadı:",
          error.message
        );

        setFollowRequests([]);
        setFollowRequestsLoading(false);
        return;
      }

      const rows =
        (data ?? []) as unknown as FollowRequestRow[];

      setFollowRequests(
        rows.filter((item) => item.profiles)
      );

      setFollowRequestsLoading(false);
    }

    void loadFollowRequests();

    function handleFollowRequestRefresh() {
      void loadFollowRequests();
    }

    window.addEventListener(
      "focus",
      handleFollowRequestRefresh
    );

    return () => {
      isActive = false;

      window.removeEventListener(
        "focus",
        handleFollowRequestRefresh
      );
    };
  }, []);

  const t = translations[language];

  const recentActivities: ProfileActivity[] = [
    ...profileTopics.map((topic) => ({
      id: `topic-${topic.id}`,
      type: "topic" as const,
      title:
        language === "tr"
          ? "Yeni bir konu oluşturdun"
          : "You created a new topic",
      detail: topic.title,
      created_at: topic.created_at,
      href:
        topic.status === "published"
          ? `/konu/${topic.id}`
          : null,
    })),

    ...profileComments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: "comment" as const,
      title:
        language === "tr"
          ? "Bir yorum yaptın"
          : "You posted a comment",
      detail:
        comment.topics?.title ??
        (language === "tr"
          ? "Konu bulunamadı"
          : "Topic unavailable"),
      created_at: comment.created_at,
      href:
        comment.topics?.status === "published"
          ? `/konu/${comment.topic_id}#comment-${comment.id}`
          : null,
    })),

    ...savedTopics.map((savedTopic) => ({
      id: `saved-${savedTopic.topic_id}`,
      type: "saved" as const,
      title:
        language === "tr"
          ? "Bir konuyu kaydettin"
          : "You saved a topic",
      detail:
        savedTopic.topics?.title ??
        (language === "tr"
          ? "Konu bulunamadı"
          : "Topic unavailable"),
      created_at: savedTopic.created_at,
      href:
        savedTopic.topics?.status === "published"
          ? `/konu/${savedTopic.topic_id}`
          : null,
    })),

    ...followedUsers.map((follow) => {
      const person = follow.profiles;

      const displayName =
        person?.display_name?.trim() ||
        person?.username?.replace(/^@/, "").trim() ||
        (language === "tr"
          ? "ForumFenomen kullanıcısı"
          : "ForumFenomen user");

      const cleanUsername =
        person?.username?.replace(/^@/, "").trim() ?? "";

      return {
        id: `following-${follow.following_id}`,
        type: "following" as const,
        title:
          language === "tr"
            ? "Bir kullanıcıyı takip ettin"
            : "You followed a user",
        detail: displayName,
        created_at: follow.created_at,
        href: cleanUsername
          ? `/profil/${encodeURIComponent(cleanUsername)}`
          : null,
      };
    }),
  ]
    .sort(
      (first, second) =>
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
    )
    .slice(0, 5);

  const profileInitials =
    profileName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toLocaleUpperCase("tr-TR")
      )
      .join("") || "FF";

  const menuItems: MenuItem[] = [
    {
      id: "profile",
      icon: <UserIcon />,
    },
    {
      id: "topics",
      icon: <TopicIcon />,
      count: profileTopics.length,
    },
    {
      id: "comments",
      icon: <CommentIcon />,
      count: profileComments.length,
    },
    {
      id: "followers",
      icon: <UsersIcon />,
      count:
        followerCount +
        followRequests.length,
    },
    {
      id: "following",
      icon: <UsersIcon />,
      count: followingCount,
    },
    {
      id: "saved",
      icon: <BookmarkIcon />,
      count: savedTopics.length + savedBlogs.length,
    },
    {
      id: "notifications",
      icon: <BellIcon />,
      count: unreadNotificationCount,
    },
    {
      id: "settings",
      icon: <SettingsIcon />,
    },
  ];

  const sectionNames: Record<
    SectionId,
    string
  > = {
    profile: t.profile,
    topics: t.topics,
    comments: t.comments,
    followers: t.followers,
    following: t.following,
    saved: t.saved,
    notifications: t.notifications,
    settings: t.settings,
  };

  function formatProfileTopicDate(
    value: string
  ) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      language === "tr" ? "tr-TR" : "en-US",
      {
        dateStyle: "medium",
        timeZone: "Europe/Istanbul",
      }
    ).format(date);
  }

  function formatProfileCommentDate(
    value: string
  ) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      language === "tr" ? "tr-TR" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }
    ).format(date);
  }

  function formatNotificationDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      language === "tr" ? "tr-TR" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }
    ).format(date);
  }

  async function markNotificationRead(
    notification: NotificationRow
  ) {
    if (notification.is_read) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "mark_notification_read",
      {
        p_notification_id: notification.id,
      }
    );

    if (error) {
      console.error(
        "Bildirim okundu yapılamadı:",
        error.message
      );

      return;
    }

    const readAt = new Date().toISOString();

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
            ...item,
            is_read: true,
            read_at: readAt,
          }
          : item
      )
    );

    async function handleProfileNotificationClick(
      notification: NotificationRow
    ) {
      if (!notification.is_read) {
        await markNotificationRead(notification);
      }

      if (notification.type === "follow_request") {
        setActiveSection("followers");

        window.setTimeout(() => {
          document
            .getElementById("profile-main-content")
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 50);

        return;
      }

      if (notification.related_topic_id) {
        const commentHash =
          notification.related_comment_id
            ? `#comment-${notification.related_comment_id}`
            : "";

        window.location.href =
          `/konu/${notification.related_topic_id}${commentHash}`;
      }
    }

    setUnreadNotificationCount((current) =>
      Math.max(0, current - 1)
    );
  }

  async function handleProfileNotificationClick(
    notification: NotificationRow
  ) {
    if (!notification.is_read) {
      await markNotificationRead(notification);
    }

    if (notification.type === "follow_request") {
      setActiveSection("followers");

      window.setTimeout(() => {
        document
          .getElementById("profile-main-content")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);

      return;
    }

    if (notification.related_topic_id) {
      const commentHash =
        notification.related_comment_id
          ? `#comment-${notification.related_comment_id}`
          : "";

      window.location.href =
        `/konu/${notification.related_topic_id}${commentHash}`;
    }
  }

  async function markAllProfileNotificationsRead() {
    if (unreadNotificationCount === 0) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "mark_all_notifications_read"
    );

    if (error) {
      console.error(
        "Bildirimlerin tamamı okundu yapılamadı:",
        error.message
      );

      return;
    }

    const readAt = new Date().toISOString();

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
        read_at:
          notification.read_at ?? readAt,
      }))
    );

    setUnreadNotificationCount(0);
  }

  async function removeSavedTopic(
    topicId: string
  ) {
    if (removingSavedTopicId === topicId) {
      return;
    }

    setRemovingSavedTopicId(topicId);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "toggle_saved_topic",
        {
          p_topic_id: topicId,
        }
      );

      if (error) {
        console.error(
          "Kayıt kaldırılamadı:",
          error.message
        );

        window.alert(
          language === "tr"
            ? "Konu kayıtlardan kaldırılamadı."
            : "The topic could not be removed from saved topics."
        );

        return;
      }

      if (data === false) {
        setSavedTopics((current) =>
          current.filter(
            (item) =>
              item.topic_id !== topicId
          )
        );
      }
    } catch (error) {
      console.error(
        "Beklenmeyen kayıt kaldırma hatası:",
        error
      );
    } finally {
      setRemovingSavedTopicId(null);
    }
  }

  async function removeSavedBlog(
    blogPostId: string
  ) {
    if (removingSavedBlogId === blogPostId) {
      return;
    }

    setRemovingSavedBlogId(blogPostId);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.alert(
          language === "tr"
            ? "Blog kaydını kaldırmak için giriş yapmalısın."
            : "You must sign in to remove the saved blog post."
        );

        return;
      }

      const { data, error } = await supabase.rpc(
        "toggle_saved_blog_post",
        {
          p_blog_post_id: blogPostId,
        }
      );

      if (error) {
        console.error(
          "Blog kaydı kaldırılamadı:",
          error.message
        );

        window.alert(
          language === "tr"
            ? "Blog yazısı kayıtlardan kaldırılamadı."
            : "The blog post could not be removed from saved items."
        );

        return;
      }

      const isSaved =
        Array.isArray(data)
          ? data[0] === true
          : data === true;

      if (isSaved) {
        window.alert(
          language === "tr"
            ? "Blog yazısı kayıtlardan kaldırılamadı."
            : "The blog post could not be removed from saved items."
        );

        return;
      }

      setSavedBlogs((current) =>
        current.filter(
          (item) =>
            item.blog_post_id !== blogPostId
        )
      );
    } catch (error) {
      console.error(
        "Beklenmeyen blog kaydı kaldırma hatası:",
        error
      );
    } finally {
      setRemovingSavedBlogId(null);
    }
  }

  async function unfollowUser(
    followedUserId: string
  ) {
    if (
      unfollowingUserId === followedUserId
    ) {
      return;
    }

    const previousUsers = followedUsers;
    const previousCount = followingCount;

    setUnfollowingUserId(followedUserId);

    setFollowedUsers((current) =>
      current.filter(
        (item) =>
          item.following_id !== followedUserId
      )
    );

    setFollowingCount((current) =>
      Math.max(0, current - 1)
    );

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.rpc(
          "toggle_user_follow",
          {
            p_following_id:
              followedUserId,
          }
        );

      if (error) {
        console.error(
          "Takip bırakma işlemi başarısız:",
          error.message
        );

        setFollowedUsers(previousUsers);
        setFollowingCount(previousCount);

        window.alert(
          language === "tr"
            ? "Takip bırakma işlemi gerçekleştirilemedi."
            : "The unfollow action could not be completed."
        );

        return;
      }

      if (data !== false) {
        setFollowedUsers(previousUsers);
        setFollowingCount(previousCount);

        console.error(
          "Beklenmeyen takip sonucu:",
          data
        );
      }
    } catch (error) {
      console.error(
        "Beklenmeyen takip bırakma hatası:",
        error
      );

      setFollowedUsers(previousUsers);
      setFollowingCount(previousCount);
    } finally {
      setUnfollowingUserId(null);
    }
  }

  async function respondFollowRequest(
    requestId: string,
    action: "accept" | "reject"
  ) {
    if (respondingFollowRequestId) {
      return;
    }

    setRespondingFollowRequestId(requestId);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "respond_follow_request",
        {
          p_request_id: requestId,
          p_action: action,
        }
      );

      if (error) {
        console.error(
          "Takip isteği yanıtlanamadı:",
          error.message
        );

        window.alert(
          language === "tr"
            ? "Takip isteği yanıtlanamadı."
            : "The follow request could not be answered."
        );

        return;
      }

      setFollowRequests((current) =>
        current.filter(
          (request) => request.id !== requestId
        )
      );

      if (data === "accepted") {
        setFollowerCount((current) => current + 1);
      }
    } catch (error) {
      console.error(
        "Beklenmeyen takip isteği yanıt hatası:",
        error
      );
    } finally {
      setRespondingFollowRequestId(null);
    }
  }

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    document.documentElement.dataset.theme =
      nextTheme;

    window.localStorage.setItem(
      "forumfenomen-theme",
      nextTheme
    );
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

  function toggleLanguage() {
    const nextLanguage: ForumLanguage =
      language === "tr" ? "en" : "tr";

    setLanguage(nextLanguage);
    setForumLanguage(nextLanguage);

    setProfileBio((current) => {
      const oldDefault =
        translations[language].bioDefault;

      return current === oldDefault
        ? translations[nextLanguage].bioDefault
        : current;
    });
  }

  async function updateNotificationSetting(
    field:
      | "email_notifications"
      | "push_notifications",
    nextValue: boolean
  ) {
    if (notificationSettingsSaving) {
      return;
    }

    setNotificationSettingsSaving(true);

    const previousEmailValue =
      emailNotificationsEnabled;

    const previousPushValue =
      pushNotificationsEnabled;

    if (field === "email_notifications") {
      setEmailNotificationsEnabled(nextValue);
    } else {
      setPushNotificationsEnabled(nextValue);
    }

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.replace("/giris");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          [field]: nextValue,
        })
        .eq("id", user.id);

      if (error) {
        console.error(
          "Bildirim ayarı kaydedilemedi:",
          error.message
        );

        setEmailNotificationsEnabled(
          previousEmailValue
        );

        setPushNotificationsEnabled(
          previousPushValue
        );

        window.alert(
          language === "tr"
            ? "Bildirim ayarı kaydedilemedi."
            : "Notification setting could not be saved."
        );
      }
    } catch (error) {
      console.error(
        "Beklenmeyen bildirim ayarı hatası:",
        error
      );

      setEmailNotificationsEnabled(
        previousEmailValue
      );

      setPushNotificationsEnabled(
        previousPushValue
      );
    } finally {
      setNotificationSettingsSaving(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Çıkış işlemi başarısız:", error.message);
      return;
    }

    window.location.assign("/giris");
  }

  async function handleProfileSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setUsernameError("");
    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.replace("/giris");
        return;
      }

      const normalizedUsername = username
        .trim()
        .replace(/^@/, "")
        .toLowerCase();

      if (normalizedUsername.length < 3) {
        setUsernameError(
          "Kullanıcı adı en az 3 karakter olmalıdır."
        );
        return;
      }

      if (normalizedUsername.length > 24) {
        setUsernameError(
          "Kullanıcı adı en fazla 24 karakter olabilir."
        );
        return;
      }

      if (
        !/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(
          normalizedUsername
        )
      ) {
        setUsernameError(
          "Kullanıcı adı yalnızca küçük harf, sayı, tire ve alt çizgi içerebilir."
        );
        return;
      }

      const normalizedName =
        profileName.trim().slice(0, 30) ||
        "ForumFenomen Üyesi";

      const normalizedBio =
        profileBio.trim().slice(0, 180);

      const usernameChanged =
        normalizedUsername !==
        originalUsername.toLowerCase();

      let savedUsername =
        originalUsername;

      if (usernameChanged) {
        const {
          data: changedUsername,
          error: usernameUpdateError,
        } = await supabase.rpc(
          "change_username",
          {
            p_username: normalizedUsername,
          }
        );

        if (usernameUpdateError) {
          const errorMessage =
            usernameUpdateError.message;

          if (
            errorMessage.includes(
              "USERNAME_TAKEN"
            )
          ) {
            setUsernameError(
              "Bu kullanıcı adı daha önce alınmış."
            );
            return;
          }

          if (
            errorMessage.includes(
              "USERNAME_NOT_ALLOWED"
            )
          ) {
            setUsernameError(
              "Bu kullanıcı adı topluluk kurallarını ihlal ediyor."
            );
            return;
          }

          if (
            errorMessage.includes(
              "USERNAME_TOO_SHORT"
            )
          ) {
            setUsernameError(
              "Kullanıcı adı en az 3 karakter olmalıdır."
            );
            return;
          }

          if (
            errorMessage.includes(
              "USERNAME_TOO_LONG"
            )
          ) {
            setUsernameError(
              "Kullanıcı adı en fazla 24 karakter olabilir."
            );
            return;
          }

          if (
            errorMessage.includes(
              "USERNAME_INVALID_FORMAT"
            )
          ) {
            setUsernameError(
              "Kullanıcı adı yalnızca küçük harf, sayı, tire ve alt çizgi içerebilir."
            );
            return;
          }

          console.error(
            "Kullanıcı adı değiştirilemedi:",
            usernameUpdateError
          );

          setUsernameError(
            "Kullanıcı adı değiştirilemedi. Lütfen tekrar dene."
          );
          return;
        }

        savedUsername =
          typeof changedUsername === "string"
            ? changedUsername
            : normalizedUsername;
      }

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          display_name: normalizedName,
          bio: normalizedBio,
          interests: selectedInterests,
        })
        .eq("id", user.id)
        .select(
          "display_name, username, bio, avatar_url, interests, username_is_temporary"
        )
        .single();

      if (updateError) {
        console.error(
          "Profil güncelleme hatası:",
          updateError
        );

        window.alert(
          "Profil bilgileri kaydedilemedi. Lütfen tekrar dene."
        );
        return;
      }

      const finalUsername =
        updatedProfile.username ||
        savedUsername;

      setProfileName(
        updatedProfile.display_name
      );

      setUsername(
        `@${finalUsername.replace(/^@/, "")}`
      );

      setOriginalUsername(
        finalUsername.replace(/^@/, "")
      );

      setUsernameIsTemporary(
        updatedProfile.username_is_temporary ===
        true
      );

      setProfileBio(
        updatedProfile.bio ?? ""
      );

      setSelectedInterests(
        Array.isArray(updatedProfile.interests)
          ? updatedProfile.interests
          : []
      );

      setAvatarUrl(
        updatedProfile.avatar_url ?? avatarUrl
      );

      setEditOpen(false);
      setSavedMessage(true);

      window.setTimeout(() => {
        setSavedMessage(false);
      }, 2600);
    } catch (error) {
      console.error(
        "Beklenmeyen profil kayıt hatası:",
        error
      );

      window.alert(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function renderProfileOverview() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.pageTitle}</span>
            <h2>{t.profileSummary}</h2>
            <p>{t.activityDescription}</p>
          </div>

          <button
            type="button"
            className={styles.contentEditButton}
            onClick={() => setEditOpen(true)}
          >
            <EditIcon />
            {t.editProfile}
          </button>
        </div>

        <div className={styles.summaryGrid}>
          <article>
            <span>{t.bio}</span>
            <p>{profileBio}</p>
          </article>

          <article>
            <span>{t.interests}</span>

            <div className={styles.interestTags}>
              {selectedInterests.length === 0 ? (
                <small>
                  {language === "tr"
                    ? "Henüz ilgi alanı seçilmedi."
                    : "No interests selected yet."}
                </small>
              ) : (
                selectedInterests.map((interest) => (
                  <small key={interest}>
                    {interest}
                  </small>
                ))
              )}
            </div>
          </article>
        </div>

        <div className={styles.activityHeading}>
          <h3>{t.recentActivity}</h3>
        </div>

        <div className={styles.activityList}>
          {recentActivities.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Henüz gösterilecek bir aktiviten bulunmuyor."
                  : "There is no recent activity to display yet."}
              </p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const activityIcon =
                activity.type === "topic" ? (
                  <TopicIcon />
                ) : activity.type === "comment" ? (
                  <CommentIcon />
                ) : activity.type === "saved" ? (
                  <BookmarkIcon />
                ) : (
                  <UsersIcon />
                );

              const activityContent = (
                <>
                  <div className={styles.activityIcon}>
                    {activityIcon}
                  </div>

                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.detail}</p>
                  </div>

                  <time>
                    {formatProfileCommentDate(
                      activity.created_at
                    )}
                  </time>
                </>
              );

              return activity.href ? (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className={styles.activityLink}
                >
                  {activityContent}
                </Link>
              ) : (
                <article key={activity.id}>
                  {activityContent}
                </article>
              );
            })
          )}
        </div>
      </>
    );
  }

  function renderTopics() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.topics}</h2>
            <p>{t.topicsDescription}</p>
          </div>
        </div>

        <div className={styles.simpleList}>
          {profileTopicsLoading ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Konuların yükleniyor..."
                  : "Loading your topics..."}
              </p>
            </div>
          ) : profileTopics.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Henüz açtığın bir konu bulunmuyor."
                  : "You have not created any topics yet."}
              </p>
            </div>
          ) : (
            profileTopics.map((topic) => {
              const categoryName =
                topic.categories?.name ??
                (language === "tr"
                  ? "Genel"
                  : "General");

              const commentText =
                language === "tr"
                  ? `${topic.comment_count ?? 0} yorum`
                  : `${topic.comment_count ?? 0} comments`;

              const statusText =
                topic.status === "published"
                  ? language === "tr"
                    ? "Yayında"
                    : "Published"
                  : topic.status === "hidden"
                    ? language === "tr"
                      ? "Gizli"
                      : "Hidden"
                    : language === "tr"
                      ? "Yayında değil"
                      : "Unpublished";

              return (
                <button
                  type="button"
                  key={topic.id}
                  onClick={() => {
                    if (
                      topic.status === "published"
                    ) {
                      window.location.assign(
                        `/konu/${topic.id}`
                      );
                    }
                  }}
                  disabled={
                    topic.status !== "published"
                  }
                >
                  <span
                    className={
                      styles.simpleListIcon
                    }
                  >
                    <TopicIcon />
                  </span>

                  <span>
                    <strong>{topic.title}</strong>

                    <small>
                      {categoryName} · {commentText} ·{" "}
                      {statusText} ·{" "}
                      {formatProfileTopicDate(
                        topic.created_at
                      )}
                    </small>
                  </span>

                  {topic.status ===
                    "published" ? (
                    <ChevronIcon />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </>
    );
  }

  function renderComments() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.comments}</h2>
            <p>{t.commentsDescription}</p>
          </div>
        </div>

        <div className={styles.commentList}>
          {profileCommentsLoading ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Yorumların yükleniyor..."
                  : "Loading your comments..."}
              </p>
            </div>
          ) : profileComments.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Henüz yaptığın bir yorum bulunmuyor."
                  : "You have not posted any comments yet."}
              </p>
            </div>
          ) : (
            profileComments.map((comment) => {
              const topic = comment.topics;

              const topicTitle =
                topic?.title ??
                (language === "tr"
                  ? "Konu artık mevcut değil"
                  : "Topic is no longer available");

              const canOpen =
                comment.status === "published" &&
                topic?.status === "published";

              const statusText =
                comment.status === "published"
                  ? language === "tr"
                    ? "Yayında"
                    : "Published"
                  : comment.status === "hidden"
                    ? language === "tr"
                      ? "Gizli"
                      : "Hidden"
                    : language === "tr"
                      ? "Kaldırıldı"
                      : "Removed";

              const preview =
                comment.content.length > 220
                  ? `${comment.content.slice(0, 220)}…`
                  : comment.content;

              return (
                <article
                  key={comment.id}
                  className={
                    canOpen
                      ? styles.profileCommentItem
                      : `${styles.profileCommentItem} ${styles.profileCommentDisabled}`
                  }
                >
                  <span
                    className={styles.commentListIcon}
                  >
                    <CommentIcon />
                  </span>

                  <div>
                    <strong>{topicTitle}</strong>

                    <p>{preview}</p>

                    <small>
                      {statusText} ·{" "}
                      {formatProfileCommentDate(
                        comment.created_at
                      )}
                    </small>
                  </div>

                  {canOpen ? (
                    <button
                      type="button"
                      className={
                        styles.profileCommentOpenButton
                      }
                      onClick={() => {
                        window.location.assign(
                          `/konu/${comment.topic_id}#comment-${comment.id}`
                        );
                      }}
                      aria-label={
                        language === "tr"
                          ? "Yoruma git"
                          : "Go to comment"
                      }
                      title={
                        language === "tr"
                          ? "Yoruma git"
                          : "Go to comment"
                      }
                    >
                      <ChevronIcon />
                    </button>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </>
    );
  }

  function renderFollowers() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.followers}</h2>
            <p>{t.followersDescription}</p>
          </div>
        </div>

        {followRequestsLoading ? (
          <div className={styles.emptyState}>
            <p>
              {language === "tr"
                ? "Takip istekleri yükleniyor..."
                : "Loading follow requests..."}
            </p>
          </div>
        ) : followRequests.length > 0 ? (
          <section className={styles.followRequestsSection}>
            <div className={styles.followRequestsHeading}>
              <div>
                <span>FORUMFENOMEN</span>

                <h3>
                  {language === "tr"
                    ? "Gelen Takip İstekleri"
                    : "Incoming Follow Requests"}
                </h3>
              </div>

              <strong>{followRequests.length}</strong>
            </div>

            <div className={styles.followRequestsList}>
              {followRequests.map((request) => {
                const person = request.profiles;

                if (!person) {
                  return null;
                }

                const cleanUsername =
                  person.username
                    ?.trim()
                    .replace(/^@/, "") ?? "";

                const displayName =
                  person.display_name?.trim() ||
                  cleanUsername ||
                  (language === "tr"
                    ? "ForumFenomen Üyesi"
                    : "ForumFenomen Member");

                const initials =
                  displayName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) =>
                      part
                        .charAt(0)
                        .toLocaleUpperCase("tr-TR")
                    )
                    .join("") || "FF";

                const isResponding =
                  respondingFollowRequestId ===
                  request.id;

                return (
                  <article
                    key={request.id}
                    className={styles.followRequestRow}
                  >
                    <Link
                      href={
                        cleanUsername
                          ? `/profil/${encodeURIComponent(
                            cleanUsername
                          )}`
                          : "#"
                      }
                      className={styles.followRequestPerson}
                    >
                      <span
                        className={styles.personAvatar}
                      >
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          initials
                        )}
                      </span>

                      <span>
                        <strong>{displayName}</strong>

                        <small>
                          {cleanUsername
                            ? `@${cleanUsername}`
                            : "@fenomen"}
                        </small>
                      </span>
                    </Link>

                    <div
                      className={
                        styles.followRequestActions
                      }
                    >
                      <button
                        type="button"
                        disabled={isResponding}
                        className={
                          styles.acceptFollowRequestButton
                        }
                        onClick={() => {
                          void respondFollowRequest(
                            request.id,
                            "accept"
                          );
                        }}
                      >
                        {isResponding
                          ? "..."
                          : language === "tr"
                            ? "Kabul Et"
                            : "Accept"}
                      </button>

                      <button
                        type="button"
                        disabled={isResponding}
                        className={
                          styles.rejectFollowRequestButton
                        }
                        onClick={() => {
                          void respondFollowRequest(
                            request.id,
                            "reject"
                          );
                        }}
                      >
                        {language === "tr"
                          ? "Reddet"
                          : "Reject"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className={styles.peopleList}>
          {followersLoading ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Takipçilerin yükleniyor..."
                  : "Loading followers..."}
              </p>
            </div>
          ) : followerUsers.length === 0 &&
            followRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Henüz takipçin bulunmuyor."
                  : "You do not have any followers yet."}
              </p>
            </div>
          ) : (
            followerUsers.map((follow) => {
              const person = follow.profiles;

              if (!person) {
                return null;
              }

              const cleanUsername =
                person.username
                  ?.trim()
                  .replace(/^@/, "") ?? "";

              const displayName =
                person.display_name?.trim() ||
                cleanUsername ||
                (language === "tr"
                  ? "ForumFenomen Üyesi"
                  : "ForumFenomen Member");

              const initials =
                displayName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) =>
                    part
                      .charAt(0)
                      .toLocaleUpperCase("tr-TR")
                  )
                  .join("") || "FF";

              const profileUrl =
                cleanUsername
                  ? `/profil/${encodeURIComponent(
                    cleanUsername
                  )}`
                  : null;

              return (
                <article
                  key={follow.follower_id}
                  className={
                    styles.followingPersonRow
                  }
                >
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      className={
                        styles.followingPersonLink
                      }
                    >
                      <span
                        className={
                          styles.personAvatar
                        }
                      >
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          initials
                        )}
                      </span>

                      <span
                        className={
                          styles.followingPersonText
                        }
                      >
                        <strong>
                          {displayName}
                        </strong>

                        <small>
                          {cleanUsername
                            ? `@${cleanUsername}`
                            : "@fenomen"}
                        </small>
                      </span>
                    </a>
                  ) : (
                    <>
                      <span
                        className={
                          styles.personAvatar
                        }
                      >
                        {initials}
                      </span>

                      <span>
                        <strong>
                          {displayName}
                        </strong>
                      </span>
                    </>
                  )}

                  <a
                    href={profileUrl ?? "/profil"}
                    className={
                      styles.followingBadge
                    }
                  >
                    {language === "tr"
                      ? "Profili Gör"
                      : "View Profile"}
                  </a>
                </article>
              );
            })
          )}
        </div>
      </>
    );
  }

  function renderFollowing() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.following}</h2>
            <p>{t.followingDescription}</p>
          </div>
        </div>

        <div className={styles.peopleList}>
          {followsLoading ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Takip ettiğin kullanıcılar yükleniyor..."
                  : "Loading followed users..."}
              </p>
            </div>
          ) : followedUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Henüz kimseyi takip etmiyorsun."
                  : "You are not following anyone yet."}
              </p>
            </div>
          ) : (
            followedUsers.map((follow) => {
              const person = follow.profiles;

              if (!person) {
                return null;
              }

              const cleanUsername =
                person.username
                  ?.trim()
                  .replace(/^@/, "") ?? "";

              const displayName =
                person.display_name?.trim() ||
                cleanUsername ||
                (language === "tr"
                  ? "ForumFenomen Üyesi"
                  : "ForumFenomen Member");

              const initials =
                displayName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) =>
                    part
                      .charAt(0)
                      .toLocaleUpperCase("tr-TR")
                  )
                  .join("") || "FF";

              const profileUrl =
                cleanUsername
                  ? `/profil/${encodeURIComponent(
                    cleanUsername
                  )}`
                  : null;

              return (
                <article
                  key={follow.following_id}
                  className={
                    styles.followingPersonRow
                  }
                >
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      className={
                        styles.followingPersonLink
                      }
                    >
                      <span
                        className={
                          styles.personAvatar
                        }
                      >
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          initials
                        )}
                      </span>

                      <span
                        className={
                          styles.followingPersonText
                        }
                      >
                        <strong>
                          {displayName}
                        </strong>

                        <small>
                          {cleanUsername
                            ? `@${cleanUsername}`
                            : "@fenomen"}
                        </small>
                      </span>
                    </a>
                  ) : (
                    <>
                      <span
                        className={
                          styles.personAvatar
                        }
                      >
                        {initials}
                      </span>

                      <span>
                        <strong>
                          {displayName}
                        </strong>
                      </span>
                    </>
                  )}

                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      className={styles.followingBadge}
                      title={
                        language === "tr"
                          ? "Profili görüntüle"
                          : "View profile"
                      }
                    >
                      {language === "tr"
                        ? "Profili Gör"
                        : "View Profile"}
                    </a>
                  ) : (
                    <span
                      className={styles.followingBadge}
                    >
                      <CheckIcon />

                      {t.following}
                    </span>
                  )}
                </article>
              );
            })
          )}
        </div>
      </>
    );
  }

  function renderSaved() {
    const savedItemCount =
      savedTopics.length + savedBlogs.length;

    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.saved}</h2>

            <p>
              {language === "tr"
                ? "Daha sonra okumak için kaydettiğin konu ve blog yazıları."
                : "Topics and blog posts you saved to read later."}
            </p>
          </div>
        </div>

        <div className={styles.simpleList}>
          {savedTopicsLoading ||
            savedBlogsLoading ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Kaydedilenler yükleniyor..."
                  : "Loading saved items..."}
              </p>
            </div>
          ) : savedItemCount === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {language === "tr"
                  ? "Henüz kaydettiğin bir konu veya blog yazısı bulunmuyor."
                  : "You have not saved any topics or blog posts yet."}
              </p>
            </div>
          ) : (
            <>
              {savedTopics.map((savedTopic) => {
                const topic = savedTopic.topics;

                if (!topic) {
                  return null;
                }

                const categoryName =
                  topic.categories?.name ??
                  (language === "tr"
                    ? "Genel"
                    : "General");

                const commentText =
                  language === "tr"
                    ? `${topic.comment_count ?? 0} yorum`
                    : `${topic.comment_count ?? 0} comments`;

                return (
                  <div
                    key={`topic-${savedTopic.topic_id}`}
                    className={styles.savedTopicRow}
                  >
                    <button
                      type="button"
                      className={styles.savedTopicLink}
                      onClick={() => {
                        window.location.assign(
                          `/konu/${topic.id}`
                        );
                      }}
                    >
                      <span
                        className={
                          styles.simpleListIcon
                        }
                      >
                        <BookmarkIcon />
                      </span>

                      <span>
                        <strong>{topic.title}</strong>

                        <small>
                          {language === "tr"
                            ? "Konu"
                            : "Topic"}{" "}
                          · {categoryName} ·{" "}
                          {commentText}
                        </small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        styles.removeSavedButton
                      }
                      disabled={
                        removingSavedTopicId ===
                        topic.id
                      }
                      onClick={() => {
                        void removeSavedTopic(
                          topic.id
                        );
                      }}
                      aria-label={
                        language === "tr"
                          ? "Konu kaydını kaldır"
                          : "Remove saved topic"
                      }
                      title={
                        language === "tr"
                          ? "Konu kaydını kaldır"
                          : "Remove saved topic"
                      }
                    >
                      {removingSavedTopicId ===
                        topic.id ? (
                        "…"
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M7 7l10 10M17 7 7 17" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}

              {savedBlogs.map((savedBlog) => {
                const blogPost =
                  savedBlog.blogPost;

                const categoryName =
                  blogPost.category?.trim() ||
                  (language === "tr"
                    ? "Genel"
                    : "General");

                const readingTime = Math.max(
                  1,
                  Number(
                    blogPost.reading_time
                  ) || 1
                );

                const readingText =
                  language === "tr"
                    ? `${readingTime} dk okuma`
                    : `${readingTime} min read`;

                return (
                  <div
                    key={`blog-${savedBlog.blog_post_id}`}
                    className={styles.savedTopicRow}
                  >
                    <button
                      type="button"
                      className={styles.savedTopicLink}
                      onClick={() => {
                        window.location.assign(
                          `/blog/${blogPost.slug}`
                        );
                      }}
                    >
                      <span
                        className={
                          styles.simpleListIcon
                        }
                      >
                        <BlogIcon />
                      </span>

                      <span>
                        <strong>
                          {blogPost.title}
                        </strong>

                        <small>
                          Blog · {categoryName} ·{" "}
                          {readingText}
                        </small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        styles.removeSavedButton
                      }
                      disabled={
                        removingSavedBlogId ===
                        blogPost.id
                      }
                      onClick={() => {
                        void removeSavedBlog(
                          blogPost.id
                        );
                      }}
                      aria-label={
                        language === "tr"
                          ? "Blog kaydını kaldır"
                          : "Remove saved blog post"
                      }
                      title={
                        language === "tr"
                          ? "Blog kaydını kaldır"
                          : "Remove saved blog post"
                      }
                    >
                      {removingSavedBlogId ===
                        blogPost.id ? (
                        "…"
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M7 7l10 10M17 7 7 17" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </>
    );
  }
  function renderNotifications() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.notificationTitle}</h2>
            <p>{t.notificationsDescription}</p>
          </div>

          <button
            type="button"
            className={styles.textButton}
            disabled={
              notificationsLoading ||
              unreadNotificationCount === 0
            }
            onClick={() =>
              void markAllProfileNotificationsRead()
            }
          >
            {t.markAllRead}
          </button>
        </div>

        <div className={styles.notificationList}>
          {notificationsLoading ? (
            <article>
              <div>
                <strong>
                  {language === "tr"
                    ? "Bildirimler yükleniyor..."
                    : "Loading notifications..."}
                </strong>
              </div>
            </article>
          ) : notifications.length === 0 ? (
            <article className={styles.emptyNotification}>
              <div>
                <strong>{t.empty}</strong>
              </div>
            </article>
          ) : (
            notifications.map((notification) => (
              <article
                key={notification.id}
                className={
                  notification.is_read
                    ? ""
                    : styles.unreadNotification
                }
                role="button"
                tabIndex={0}
                onClick={() => {
                  void handleProfileNotificationClick(
                    notification
                  );
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    void handleProfileNotificationClick(
                      notification
                    );
                  }
                }}
              >

                <span
                  className={styles.notificationDot}
                  aria-hidden="true"
                  style={{
                    visibility: notification.is_read
                      ? "hidden"
                      : "visible",
                  }}
                />

                <div>
                  <strong>
                    {notification.title}
                  </strong>

                  <p>{notification.message}</p>

                  <small>
                    {formatNotificationDate(
                      notification.created_at
                    )}
                  </small>
                </div>
              </article>
            ))
          )}
        </div>
      </>
    );
  }

  function getVisibilityLabel(
    value: VisibilityOption
  ) {
    if (value === "followers") {
      return language === "tr"
        ? "Sadece Takipçilerim"
        : "Followers Only";
    }

    if (value === "following") {
      return language === "tr"
        ? "Sadece Takip Ettiklerim"
        : "People I Follow Only";
    }

    return language === "tr"
      ? "Herkese Açık"
      : "Public";
  }

  async function savePrivacySettings() {
    if (privacySaving) {
      return;
    }

    setPrivacySaving(true);
    setPrivacySaved(false);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.replace("/giris");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          profile_visibility: profileVisibility,
          followers_visibility:
            followersVisibility,
          following_visibility:
            followingVisibility,
          comments_visibility:
            commentsVisibility,
          likes_visibility:
            likesVisibility,
        })
        .eq("id", user.id);

      if (error) {
        console.error(
          "Gizlilik ayarları kaydedilemedi:",
          error.message
        );

        window.alert(
          language === "tr"
            ? "Gizlilik ayarları kaydedilemedi."
            : "Privacy settings could not be saved."
        );

        return;
      }

      setPrivacySaved(true);

      window.setTimeout(() => {
        setPrivacySaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Beklenmeyen gizlilik ayarı hatası:",
        error
      );
    } finally {
      setPrivacySaving(false);
    }
  }

  function renderSettings() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.settings}</h2>
            <p>{t.settingsDescription}</p>
          </div>
        </div>

        <div className={styles.settingsGroups}>
          <section>
            <h3>{t.accountSettings}</h3>

            <button
              type="button"
              disabled={notificationSettingsSaving}
              onClick={() => {
                void updateNotificationSetting(
                  "email_notifications",
                  !emailNotificationsEnabled
                );
              }}
            >
              <span>
                <strong>{t.emailNotifications}</strong>
                <small>{profileEmail || "—"}</small>
              </span>

              <span
                className={
                  emailNotificationsEnabled
                    ? styles.switchActive
                    : styles.switchInactive
                }
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              disabled={notificationSettingsSaving}
              onClick={() => {
                void updateNotificationSetting(
                  "push_notifications",
                  !pushNotificationsEnabled
                );
              }}
            >
              <span>
                <strong>{t.pushNotifications}</strong>

                <small>
                  {pushNotificationsEnabled
                    ? language === "tr"
                      ? "Anlık bildirimler açık"
                      : "Push notifications enabled"
                    : language === "tr"
                      ? "Anlık bildirimler kapalı"
                      : "Push notifications disabled"}
                </small>
              </span>

              <span
                className={
                  pushNotificationsEnabled
                    ? styles.switchActive
                    : styles.switchInactive
                }
                aria-hidden="true"
              />
            </button>
          </section>

          <section className={styles.privacySettingsSection}>
            <h3>{t.privacySettings}</h3>

            <label className={styles.privacySettingRow}>
              <span>
                <strong>
                  {language === "tr"
                    ? "Profil Görünürlüğü"
                    : "Profile Visibility"}
                </strong>

                <small>
                  {getVisibilityLabel(
                    profileVisibility
                  )}
                </small>
              </span>

              <select
                value={profileVisibility}
                onChange={(event) =>
                  setProfileVisibility(
                    event.target
                      .value as VisibilityOption
                  )
                }
              >
                <option value="public">
                  {language === "tr"
                    ? "Herkese Açık"
                    : "Public"}
                </option>

                <option value="followers">
                  {language === "tr"
                    ? "Sadece Takipçilerim"
                    : "Followers Only"}
                </option>

                <option value="following">
                  {language === "tr"
                    ? "Sadece Takip Ettiklerim"
                    : "People I Follow Only"}
                </option>
              </select>
            </label>

            <label className={styles.privacySettingRow}>
              <span>
                <strong>
                  {language === "tr"
                    ? "Takipçilerim"
                    : "My Followers"}
                </strong>

                <small>
                  {getVisibilityLabel(
                    followersVisibility
                  )}
                </small>
              </span>

              <select
                value={followersVisibility}
                onChange={(event) =>
                  setFollowersVisibility(
                    event.target
                      .value as VisibilityOption
                  )
                }
              >
                <option value="public">
                  {language === "tr"
                    ? "Herkese Açık"
                    : "Public"}
                </option>

                <option value="followers">
                  {language === "tr"
                    ? "Sadece Takipçilerim"
                    : "Followers Only"}
                </option>

                <option value="following">
                  {language === "tr"
                    ? "Sadece Takip Ettiklerim"
                    : "People I Follow Only"}
                </option>
              </select>
            </label>

            <label className={styles.privacySettingRow}>
              <span>
                <strong>
                  {language === "tr"
                    ? "Takip Ettiklerim"
                    : "People I Follow"}
                </strong>

                <small>
                  {getVisibilityLabel(
                    followingVisibility
                  )}
                </small>
              </span>

              <select
                value={followingVisibility}
                onChange={(event) =>
                  setFollowingVisibility(
                    event.target
                      .value as VisibilityOption
                  )
                }
              >
                <option value="public">
                  {language === "tr"
                    ? "Herkese Açık"
                    : "Public"}
                </option>

                <option value="followers">
                  {language === "tr"
                    ? "Sadece Takipçilerim"
                    : "Followers Only"}
                </option>

                <option value="following">
                  {language === "tr"
                    ? "Sadece Takip Ettiklerim"
                    : "People I Follow Only"}
                </option>
              </select>
            </label>

            <label className={styles.privacySettingRow}>
              <span>
                <strong>
                  {language === "tr"
                    ? "Yorumlarım"
                    : "My Comments"}
                </strong>

                <small>
                  {getVisibilityLabel(
                    commentsVisibility
                  )}
                </small>
              </span>

              <select
                value={commentsVisibility}
                onChange={(event) =>
                  setCommentsVisibility(
                    event.target
                      .value as VisibilityOption
                  )
                }
              >
                <option value="public">
                  {language === "tr"
                    ? "Herkese Açık"
                    : "Public"}
                </option>

                <option value="followers">
                  {language === "tr"
                    ? "Sadece Takipçilerim"
                    : "Followers Only"}
                </option>

                <option value="following">
                  {language === "tr"
                    ? "Sadece Takip Ettiklerim"
                    : "People I Follow Only"}
                </option>
              </select>
            </label>

            <label className={styles.privacySettingRow}>
              <span>
                <strong>
                  {language === "tr"
                    ? "Beğenilerim"
                    : "My Likes"}
                </strong>

                <small>
                  {getVisibilityLabel(
                    likesVisibility
                  )}
                </small>
              </span>

              <select
                value={likesVisibility}
                onChange={(event) =>
                  setLikesVisibility(
                    event.target
                      .value as VisibilityOption
                  )
                }
              >
                <option value="public">
                  {language === "tr"
                    ? "Herkese Açık"
                    : "Public"}
                </option>

                <option value="followers">
                  {language === "tr"
                    ? "Sadece Takipçilerim"
                    : "Followers Only"}
                </option>

                <option value="following">
                  {language === "tr"
                    ? "Sadece Takip Ettiklerim"
                    : "People I Follow Only"}
                </option>
              </select>
            </label>

            <div className={styles.privacySaveRow}>
              {privacySaved ? (
                <span className={styles.privacySavedText}>
                  <CheckIcon />

                  {language === "tr"
                    ? "Gizlilik ayarları kaydedildi."
                    : "Privacy settings saved."}
                </span>
              ) : null}

              <button
                type="button"
                className={styles.privacySaveButton}
                disabled={privacySaving}
                onClick={() => {
                  void savePrivacySettings();
                }}
              >
                {privacySaving
                  ? language === "tr"
                    ? "Kaydediliyor..."
                    : "Saving..."
                  : language === "tr"
                    ? "Gizlilik Ayarlarını Kaydet"
                    : "Save Privacy Settings"}
              </button>
            </div>
          </section>

          <section>
            <h3>{t.appearanceSettings}</h3>

            <button
              type="button"
              onClick={toggleTheme}
            >
              <span>
                <strong>{t.themeLabel}</strong>
                <small>
                  {theme === "dark"
                    ? t.currentThemeDark
                    : t.currentThemeLight}
                </small>
              </span>

              <ChevronIcon />
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
            >
              <span>
                <strong>{t.languageLabel}</strong>
                <small>
                  {language === "tr"
                    ? t.currentLanguageTr
                    : t.currentLanguageEn}
                </small>
              </span>

              <ChevronIcon />
            </button>
          </section>
        </div>
      </>
    );
  }

  function renderSectionContent() {
    switch (activeSection) {
      case "topics":
        return renderTopics();

      case "comments":
        return renderComments();

      case "followers":
        return renderFollowers();

      case "following":
        return renderFollowing();

      case "saved":
        return renderSaved();

      case "notifications":
        return renderNotifications();

      case "settings":
        return renderSettings();

      default:
        return renderProfileOverview();
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


        {savedMessage && (
          <div className={styles.successMessage}>
            <CheckIcon />
            {t.savedMessage}
          </div>
        )}

        <section className={styles.profileHero}>
          <div className={styles.profileIdentity}>
            <div className={styles.avatarShell}>
              <span className={styles.avatarOrbit} />
              <span className={styles.avatarCore}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profileName}
                    className={styles.avatarImage}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarUrl(null)}
                  />
                ) : (
                  profileInitials
                )}
              </span>
              <span className={styles.onlineStatus} />
            </div>

            <div className={styles.profileText}>
              <div className={styles.nameRow}>
                <h1>{profileName}</h1>
              </div>

              <span className={styles.username}>
                {username}
              </span>

              <div className={styles.profileBadges}>
                <span className={styles.memberRoleBadge}>
                  {t.memberBadge}
                </span>

                {profileRole === "moderator" ? (
                  <span className={styles.moderatorRoleBadge}>
                    {t.moderatorBadge}
                  </span>
                ) : null}

                {profileRole === "admin" ? (
                  <span className={styles.adminRoleBadge}>
                    {t.adminBadge}
                  </span>
                ) : null}
              </div>

              <p>{profileBio}</p>
            </div>
          </div>


          <div className={styles.profileActions}>

            {hasManagementAccess ? (
              <Link
                href="/admin"
                className={styles.mobileManagementLink}
              >
                <ShieldIcon />
                <span>{managementPanelLabel}</span>
              </Link>
            ) : null}

            <button
              type="button"
              className={styles.editButton}
              onClick={() => setEditOpen(true)}
            >
              <EditIcon />
              {t.editProfile}
            </button>

            <button
              type="button"
              className={styles.settingsButton}
              onClick={() =>
                openProfileSection("settings")
              }
              aria-label={t.settings}
              title={t.settings}
            >
              <SettingsIcon />
            </button>

            <button
              type="button"
              className={`${styles.settingsButton} ${styles.logoutButton}`}
              onClick={handleLogout}
              aria-label={t.logout}
              title={t.logout}
            >
              <LogoutIcon />
            </button>
          </div>

          <div className={styles.statsGrid}>
            <button
              type="button"
              className={
                activeSection === "topics"
                  ? styles.activeProfileStat
                  : undefined
              }
              onClick={() => {
                openProfileSection("topics")
              }}
            >
              <strong>{profileTopics.length}</strong>
              <span>{t.topicCount}</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "comments"
                  ? styles.activeProfileStat
                  : undefined
              }
              onClick={() => {
                openProfileSection("comments")
              }}
            >
              <strong>{profileComments.length}</strong>
              <span>{t.commentCount}</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "followers"
                  ? styles.activeProfileStat
                  : undefined
              }
              onClick={() => {
                openProfileSection("followers");
              }}
            >
              <strong>{followerCount}</strong>
              <span>{t.followerCount}</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "following"
                  ? styles.activeProfileStat
                  : undefined
              }
              onClick={() => {
                openProfileSection("following");
              }}
            >
              <strong>{followingCount}</strong>
              <span>{t.followingCount}</span>
            </button>
          </div>
        </section>

        {editOpen && (
          <section className={styles.editPanel}>
            <div className={styles.editPanelHeading}>
              <div>
                <span>ForumFenomen</span>
                <h2>{t.editProfile}</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditOpen(false)
                }
                aria-label={t.close}
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleProfileSave}>
              <label>
                <span>{t.name}</span>

                <input
                  type="text"
                  value={profileName}
                  onChange={(event) =>
                    setProfileName(
                      event.target.value
                    )
                  }
                  maxLength={30}
                  required
                />
              </label>

              <label>
                <span>{t.username}</span>

                <div className={styles.usernameInputWrap}>
                  <span aria-hidden="true">@</span>

                  <input
                    type="text"
                    value={username.replace(/^@/, "")}
                    onChange={(event) => {
                      setUsername(
                        `@${event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]/g, "")
                          .slice(0, 24)}`
                      );

                      setUsernameError("");
                    }}
                    minLength={3}
                    maxLength={24}
                    autoComplete="username"
                    spellCheck={false}
                    required
                  />
                </div>

                <small className={styles.usernameHelp}>
                  3–24 karakter. Yalnızca küçük
                  harf, sayı, tire ve alt çizgi
                  kullanabilirsin.
                </small>

                {usernameIsTemporary ? (
                  <small
                    className={
                      styles.temporaryUsernameNotice
                    }
                  >
                    Şu anda geçici bir kullanıcı adı
                    kullanıyorsun.
                  </small>
                ) : null}

                {usernameError ? (
                  <small
                    className={styles.usernameError}
                    role="alert"
                  >
                    {usernameError}
                  </small>
                ) : null}
              </label>

              <label className={styles.fullField}>
                <span>{t.bio}</span>

                <textarea
                  value={profileBio}
                  onChange={(event) =>
                    setProfileBio(
                      event.target.value
                    )
                  }
                  maxLength={180}
                  rows={3}
                />
              </label>

              <div className={styles.fullField}>
                <span>{t.interests}</span>

                <div className={styles.interestTags}>
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected =
                      selectedInterests.includes(interest);

                    return (
                      <button
                        key={interest}
                        type="button"
                        className={
                          isSelected
                            ? styles.interestTagActive
                            : styles.interestTagButton
                        }
                        onClick={() => {
                          setSelectedInterests((current) =>
                            current.includes(interest)
                              ? current.filter(
                                (item) =>
                                  item !== interest
                              )
                              : [...current, interest]
                          );
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    setEditOpen(false)
                  }
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span
                        className={styles.saveSpinner}
                        aria-hidden="true"
                      />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <CheckIcon />
                      {t.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {!editOpen && (

          <div
            ref={profileContentRef}
            id="profile-main-content"
            className={styles.profileLayout}
          >
            <aside className={styles.profileSidebar}>
              <div className={styles.profileMenuWrap}>
                <nav className={styles.profileMenu}>
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className={styles.profileMenuItemGroup}
                    >
                      <button
                        type="button"
                        className={
                          activeSection === item.id
                            ? styles.activeMenuItem
                            : ""
                        }
                        onClick={() =>
                          openProfileSection(item.id)
                        }
                      >
                        <span className={styles.menuIcon}>
                          {item.icon}
                        </span>

                        <span>
                          {sectionNames[item.id]}
                        </span>

                        {item.count !== undefined ? (
                          <small>{item.count}</small>
                        ) : (
                          <ChevronIcon />
                        )}
                      </button>

                      {item.id === "profile" &&
                        hasManagementAccess ? (
                        <Link
                          href="/admin"
                          className={styles.desktopManagementLink}
                        >
                          <span className={styles.menuIcon}>
                            <ShieldIcon />
                          </span>

                          <span>{managementPanelLabel}</span>

                          <ChevronIcon />
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </nav>

                <span
                  className={styles.profileMenuArrow}
                  aria-hidden="true"
                >
                  <ChevronIcon />
                </span>
              </div>

              <Link
                href="/plus"
                className={styles.plusMembershipButton}
              >
                <span
                  className={styles.plusMembershipIcon}
                  aria-hidden="true"
                >
                  ✦
                </span>

                <strong>{t.plusMembership}</strong>

                <ChevronIcon />
              </Link>
            </aside>


            <section className={styles.profileContent}>
              {renderSectionContent()}
            </section>
          </div>
        )}

        {!editOpen && (
          <aside className={styles.adBanner}>
            <div>
              <span>{t.adLabel}</span>
              <h2>{t.adTitle}</h2>
              <p>{t.adDescription}</p>
            </div>

            <Link
              href="/iletisim"
              className="ff-advertise-button"
            >
              {t.advertise}
            </Link>
          </aside>
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
              src="/forumfenomen-icon-256.png"
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
          className={
            isAuthenticated
              ? "active ff-authenticated-profile"
              : "active"
          }
          aria-current="page"
          onClick={(event) =>
            handleBottomNavigation(event, "/profil")
          }
        >
          <UserIcon />
          <span>{t.profileNav}</span>
        </Link>
      </nav>
    </main>
  );
}



