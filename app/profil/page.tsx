"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
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

type SectionId =
  | "profile"
  | "topics"
  | "comments"
  | "following"
  | "saved"
  | "notifications"
  | "settings";

type MenuItem = {
  id: SectionId;
  icon: ReactNode;
  count?: number;
};

const translations = {
  tr: {
    pageTitle: "Profil",
    profile: "Profilim",
    topics: "Konularım",
    comments: "Yorumlarım",
    following: "Takip Ettiklerim",
    saved: "Kaydedilen Konular",
    notifications: "Bildirimler",
    settings: "Ayarlar",
    logout: "Çıkış Yap",
    editProfile: "Profili Düzenle",
    close: "Kapat",
    save: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    name: "Görünen Ad",
    username: "Kullanıcı Adı",
    bio: "Kısa Biyografi",
    memberBadge: "Fenomen",
    founderBadge: "Kurucu Üye",
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
    following: "Following",
    saved: "Saved Topics",
    notifications: "Notifications",
    settings: "Settings",
    logout: "Log Out",
    editProfile: "Edit Profile",
    close: "Close",
    save: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    name: "Display Name",
    username: "Username",
    bio: "Short Biography",
    memberBadge: "Fenomen",
    founderBadge: "Founding Member",
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

export default function ProfilePage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [activeSection, setActiveSection] =
    useState<SectionId>("profile");


  const [editOpen, setEditOpen] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [profileName, setProfileName] =
    useState("ForumFenomen Üyesi");

  const [username, setUsername] =
    useState("@fenomen");

  const [profileBio, setProfileBio] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [profileEmail, setProfileEmail] =
    useState("");

  const [isAuthenticated, setIsAuthenticated] =
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
        .select(
          "display_name, username, avatar_url, bio"
        )
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

      setUsername(
        databaseUsername
          ? `@${databaseUsername}`
          : `@${fallbackUsername}`
      );

      setAvatarUrl(
        typeof profile?.avatar_url === "string" &&
          profile.avatar_url.trim()
          ? profile.avatar_url
          : fallbackAvatar
      );

      setProfileBio(databaseBio);
    }

    void loadAuthenticatedUser();

    return () => {
      isActive = false;
    };
  }, []);

  const t = translations[language];

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
      count: 28,
    },
    {
      id: "comments",
      icon: <CommentIcon />,
      count: 164,
    },
    {
      id: "following",
      icon: <UsersIcon />,
      count: 76,
    },
    {
      id: "saved",
      icon: <BookmarkIcon />,
      count: 12,
    },
    {
      id: "notifications",
      icon: <BellIcon />,
      count: 3,
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
    following: t.following,
    saved: t.saved,
    notifications: t.notifications,
    settings: t.settings,
  };

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
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "");

      if (normalizedUsername.length < 3) {
        window.alert(
          "Kullanıcı adı en az 3 karakter olmalıdır."
        );
        return;
      }

      const normalizedName =
        profileName.trim() ||
        "ForumFenomen Üyesi";

      const normalizedBio =
        profileBio.trim().slice(0, 180);

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          display_name: normalizedName,
          username: normalizedUsername,
          bio: normalizedBio,
        })
        .eq("id", user.id)
        .select(
          "display_name, username, bio, avatar_url"
        )
        .single();

      if (updateError) {
        if (updateError.code === "23505") {
          window.alert(
            "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor."
          );
          return;
        }

        console.error(
          "Profil güncelleme hatası:",
          updateError
        );

        window.alert(
          `Profil kaydedilemedi: ${updateError.message}`
        );
        return;
      }

      setProfileName(
        updatedProfile.display_name
      );

      setUsername(
        `@${updatedProfile.username.replace(
          /^@/,
          ""
        )}`
      );

      setProfileBio(
        updatedProfile.bio ?? ""
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
              <small>Instagram</small>
              <small>Yapay Zeka</small>
              <small>Girişimcilik</small>
              <small>Affiliate</small>
            </div>
          </article>
        </div>

        <div className={styles.activityHeading}>
          <h3>{t.recentActivity}</h3>
        </div>

        <div className={styles.activityList}>
          {sampleActivities[language].map(
            (activity, index) => (
              <article key={activity.title}>
                <div className={styles.activityIcon}>
                  {index === 0 ? (
                    <TopicIcon />
                  ) : index === 1 ? (
                    <CommentIcon />
                  ) : (
                    <BookmarkIcon />
                  )}
                </div>

                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </div>

                <time>{activity.time}</time>
              </article>
            )
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
          {sampleTopics[language].map(
            (topic) => (
              <button
                type="button"
                key={topic.title}
              >
                <span className={styles.simpleListIcon}>
                  <TopicIcon />
                </span>

                <span>
                  <strong>{topic.title}</strong>
                  <small>{topic.meta}</small>
                </span>

                <ChevronIcon />
              </button>
            )
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
          {sampleComments[language].map(
            (comment) => (
              <article key={comment.title}>
                <CommentIcon />

                <div>
                  <strong>{comment.title}</strong>
                  <p>{comment.text}</p>
                </div>
              </article>
            )
          )}
        </div>
      </>
    );
  }

  function renderFollowing() {
    const people = [
      {
        name: "Selin",
        user: "@selinicerik",
        initials: "S",
      },
      {
        name: "Emre",
        user: "@emreyapayzeka",
        initials: "E",
      },
      {
        name: "Merve",
        user: "@merveugc",
        initials: "M",
      },
    ];

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
          {people.map((person) => (
            <article key={person.user}>
              <span className={styles.personAvatar}>
                {person.initials}
              </span>

              <div>
                <strong>{person.name}</strong>
                <small>{person.user}</small>
              </div>

              <span className={styles.followingBadge}>
                <CheckIcon />
                {t.following}
              </span>
            </article>
          ))}
        </div>
      </>
    );
  }

  function renderSaved() {
    return (
      <>
        <div className={styles.contentHeading}>
          <div>
            <span>{t.profile}</span>
            <h2>{t.saved}</h2>
            <p>{t.savedDescription}</p>
          </div>
        </div>

        <div className={styles.simpleList}>
          {sampleTopics[language]
            .slice()
            .reverse()
            .map((topic) => (
              <button
                type="button"
                key={topic.title}
              >
                <span className={styles.simpleListIcon}>
                  <BookmarkIcon />
                </span>

                <span>
                  <strong>{topic.title}</strong>
                  <small>{topic.meta}</small>
                </span>

                <ChevronIcon />
              </button>
            ))}
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
          >
            {t.markAllRead}
          </button>
        </div>

        <div className={styles.notificationList}>
          {sampleActivities[language].map(
            (notification, index) => (
              <article
                key={notification.title}
                className={
                  index < 2
                    ? styles.unreadNotification
                    : ""
                }
              >
                <span className={styles.notificationDot} />

                <div>
                  <strong>
                    {notification.title}
                  </strong>
                  <p>{notification.detail}</p>
                  <small>{notification.time}</small>
                </div>
              </article>
            )
          )}
        </div>
      </>
    );
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

            <button type="button">
              <span>
                <strong>{t.emailNotifications}</strong>
                <small>{profileEmail || "—"}</small>
              </span>

              <span className={styles.switchActive} />
            </button>

            <button type="button">
              <span>
                <strong>{t.pushNotifications}</strong>
                <small>ForumFenomen</small>
              </span>

              <span className={styles.switchActive} />
            </button>
          </section>

          <section>
            <h3>{t.privacySettings}</h3>

            <button type="button">
              <span>
                <strong>{t.profileVisibility}</strong>
                <small>{t.publicProfile}</small>
              </span>

              <ChevronIcon />
            </button>
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

            <button type="button">
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

                <span className={styles.verifiedBadge}>
                  <CheckIcon />
                </span>
              </div>

              <span className={styles.username}>
                {username}
              </span>

              <div className={styles.profileBadges}>
                <span>{t.memberBadge}</span>
                <span>{t.founderBadge}</span>
              </div>

              <p>{profileBio}</p>
            </div>
          </div>

          <div className={styles.profileActions}>
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
              onClick={() => setActiveSection("settings")}
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
            <article>
              <strong>28</strong>
              <span>{t.topicCount}</span>
            </article>

            <article>
              <strong>164</strong>
              <span>{t.commentCount}</span>
            </article>

            <article>
              <strong>2.3K</strong>
              <span>{t.followerCount}</span>
            </article>

            <article>
              <strong>76</strong>
              <span>{t.followingCount}</span>
            </article>
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
                  required
                />
              </label>

              <label>
                <span>{t.username}</span>

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  required
                />
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

        <div className={styles.profileLayout}>
          <aside className={styles.profileSidebar}>
            <nav className={styles.profileMenu}>
              {menuItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    activeSection === item.id
                      ? styles.activeMenuItem
                      : ""
                  }
                  onClick={() =>
                    setActiveSection(item.id)
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
              ))}
            </nav>

            <section className={styles.levelCard}>
              <div className={styles.levelHeading}>
                <div>
                  <span>{t.level}</span>
                  <strong>
                    {t.levelNumber}
                  </strong>
                </div>

                <span className={styles.levelNumber}>
                  7
                </span>
              </div>

              <div className={styles.progressTrack}>
                <span />
              </div>

              <div className={styles.progressText}>
                <span>{t.levelProgress}</span>
                <strong>{t.points}</strong>
              </div>
            </section>
          </aside>

          <section className={styles.profileContent}>
            {renderSectionContent()}
          </section>
        </div>

        <aside className={styles.adBanner}>
          <div>
            <span>{t.adLabel}</span>
            <h2>{t.adTitle}</h2>
            <p>{t.adDescription}</p>
          </div>

          <button type="button">
            {t.advertise}
          </button>
        </aside>
      </div>

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

        <Link
          href="/profil"
          className={
            isAuthenticated
              ? "active ff-authenticated-profile"
              : "active"
          }
          aria-current="page"
        >
          <UserIcon />
          <span>{t.profileNav}</span>
        </Link>
      </nav>
    </main>
  );
}


