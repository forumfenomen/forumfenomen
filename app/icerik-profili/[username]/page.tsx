"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";

import {
    getForumLanguage,
    setForumLanguage,
    type ForumLanguage,
} from "@/lib/forumfenomen-language";

import { createClient } from "@/lib/supabase/client";

import Image from "next/image";
import Link from "next/link";

import {
    useParams,
    useRouter,
} from "next/navigation";

import {
    useEffect,
    useState,
} from "react";

import styles from "../../profil/page.module.css";

type Theme = "dark" | "light";

type ContentProfileRow = {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    specialty: string | null;
    profile_type: string | null;
};

type ContentProfileTopicRow = {
    id: string;
    title: string;
    created_at: string;
    comment_count: number;
    view_count: number;

    categories: {
        name: string;
    } | null;
};

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
            <path d="m14 6-6 6 6 6" />
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

function ChevronIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 5 7 7-7 7" />
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

function formatRelativeTime(
    value: string,
    language: ForumLanguage
) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
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

export default function ContentProfilePage() {
    const router = useRouter();

    const params = useParams<{
        username: string;
    }>();

    const usernameParam =
        typeof params.username === "string"
            ? decodeURIComponent(params.username)
                .replace(/^@/, "")
                .trim()
                .toLowerCase()
            : "";

    const [language, setLanguage] =
        useState<ForumLanguage>("tr");

    const [theme, setTheme] =
        useState<Theme>("dark");

    const [profile, setProfile] =
        useState<ContentProfileRow | null>(null);

    const [topics, setTopics] =
        useState<ContentProfileTopicRow[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [notFound, setNotFound] =
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
    }, []);

    useEffect(() => {
        let isActive = true;

        async function loadContentProfile() {
            if (!usernameParam) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            setNotFound(false);

            const supabase = createClient();

            const {
                data: profileData,
                error: profileError,
            } = await supabase
                .from("content_profiles")
                .select(`
                    id,
                    display_name,
                    username,
                    avatar_url,
                    bio,
                    specialty,
                    profile_type
                `)
                .eq("username", usernameParam)
                .eq("is_active", true)
                .eq("is_listed", true)
                .eq("is_archived", false)
                .maybeSingle();

            if (!isActive) {
                return;
            }

            if (
                profileError ||
                !profileData
            ) {
                console.error(
                    "İçerik profili alınamadı:",
                    profileError?.message
                );

                setProfile(null);
                setTopics([]);
                setNotFound(true);
                setLoading(false);
                return;
            }

            const typedProfile =
                profileData as ContentProfileRow;

            const {
                data: topicData,
                error: topicsError,
            } = await supabase
                .from("topics")
                .select(`
                    id,
                    title,
                    created_at,
                    comment_count,
                    view_count,
                    categories (
                        name
                    )
                `)
                .eq(
                    "content_profile_id",
                    typedProfile.id
                )
                .eq("status", "published")
                .order("created_at", {
                    ascending: false,
                })
                .limit(50);

            if (!isActive) {
                return;
            }

            if (topicsError) {
                console.error(
                    "İçerik profili konuları alınamadı:",
                    topicsError.message
                );
            }

            setProfile(typedProfile);

            setTopics(
                (topicData ??
                    []) as unknown as ContentProfileTopicRow[]
            );

            setNotFound(false);
            setLoading(false);
        }

        void loadContentProfile();

        return () => {
            isActive = false;
        };
    }, [usernameParam]);

    function toggleTheme() {
        const nextTheme: Theme =
            theme === "dark"
                ? "light"
                : "dark";

        setTheme(nextTheme);

        window.localStorage.setItem(
            "forumfenomen-theme",
            nextTheme
        );

        document.documentElement.dataset.theme =
            nextTheme;
    }

    const profileName =
        profile?.display_name?.trim() ||
        profile?.username
            ?.replace(/^@/, "")
            .trim() ||
        "ForumFenomen";

    const cleanUsername =
        profile?.username
            ?.replace(/^@/, "")
            .trim() ||
        usernameParam;

    const profileInitials =
        profileName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part
                    .charAt(0)
                    .toLocaleUpperCase("tr-TR")
            )
            .join("") || "FF";

    const totalComments =
        topics.reduce(
            (total, topic) =>
                total +
                Number(
                    topic.comment_count ?? 0
                ),
            0
        );

    const totalViews =
        topics.reduce(
            (total, topic) =>
                total +
                Number(
                    topic.view_count ?? 0
                ),
            0
        );

    const specialty =
        profile?.specialty?.trim() ||
        (language === "tr"
            ? "İçerik üreticisi"
            : "Content creator");

    const rawProfileType =
        profile?.profile_type?.trim().toLowerCase();

    const profileType =
        rawProfileType === "expert"
            ? "Expert"
            : rawProfileType === "editor"
                ? language === "tr"
                    ? "Editör"
                    : "Editor"
                : rawProfileType === "creator"
                    ? language === "tr"
                        ? "İçerik Üreticisi"
                        : "Content Creator"
                    : profile?.profile_type?.trim() ||
                    (language === "tr"
                        ? "ForumFenomen İçerik Profili"
                        : "ForumFenomen Content Profile");

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
                            aria-label={
                                language === "tr"
                                    ? "Temayı değiştir"
                                    : "Change theme"
                            }
                        >
                            {theme === "dark" ? (
                                <MoonIcon />
                            ) : (
                                <SunIcon />
                            )}
                        </button>

                        <NotificationBell />

                        <SiteSearch
                            language={language}
                        />
                    </div>
                </header>

                <div
                    className={
                        styles.publicProfileTopBar
                    }
                >
                    <Link
                        href="/akis"
                        className={
                            styles.publicProfileBack
                        }
                    >
                        <ArrowLeftIcon />

                        {language === "tr"
                            ? "Akışa geri dön"
                            : "Return to feed"}
                    </Link>
                </div>

                {loading ? (
                    <section
                        className={
                            styles.publicProfileState
                        }
                    >
                        {language === "tr"
                            ? "İçerik profili yükleniyor..."
                            : "Loading content profile..."}
                    </section>
                ) : notFound || !profile ? (
                    <section
                        className={
                            styles.publicProfileState
                        }
                    >
                        <h1>
                            {language === "tr"
                                ? "İçerik profili bulunamadı"
                                : "Content profile not found"}
                        </h1>

                        <p>
                            {language === "tr"
                                ? "Bu içerik profili kaldırılmış, arşivlenmiş veya kullanıcı adını değiştirmiş olabilir."
                                : "This content profile may have been removed, archived or renamed."}
                        </p>
                    </section>
                ) : (
                    <>
                        <section
                            className={
                                styles.profileHero
                            }
                        >
                            <div
                                className={
                                    styles.profileIdentity
                                }
                            >
                                <div
                                    className={
                                        styles.avatarShell
                                    }
                                >
                                    <span
                                        className={
                                            styles.avatarOrbit
                                        }
                                    />

                                    <span
                                        className={
                                            styles.avatarCore
                                        }
                                    >
                                        {profile.avatar_url ? (
                                            <img
                                                src={
                                                    profile.avatar_url
                                                }
                                                alt={
                                                    profileName
                                                }
                                                className={
                                                    styles.avatarImage
                                                }
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            profileInitials
                                        )}
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.profileText
                                    }
                                >
                                    <div
                                        className={
                                            styles.nameRow
                                        }
                                    >
                                        <h1>
                                            {profileName}
                                        </h1>

                                        <span
                                            className={
                                                styles.verifiedBadge
                                            }
                                            title={
                                                language === "tr"
                                                    ? "ForumFenomen içerik profili"
                                                    : "ForumFenomen content profile"
                                            }
                                        >
                                            ✓
                                        </span>
                                    </div>

                                    <span
                                        className={
                                            styles.username
                                        }
                                    >
                                        @{cleanUsername}
                                    </span>

                                    <div
                                        className={
                                            styles.profileBadges
                                        }
                                    >
                                        <span
                                            className={
                                                styles.memberRoleBadge
                                            }
                                        >
                                            {language === "tr"
                                                ? "İçerik Profili"
                                                : "Content Profile"}
                                        </span>

                                        <span
                                            className={
                                                styles.moderatorRoleBadge
                                            }
                                        >
                                            {specialty}
                                        </span>
                                    </div>

                                    <p>
                                        {profile.bio?.trim() ||
                                            (language === "tr"
                                                ? "Bu içerik profili için henüz biyografi eklenmemiş."
                                                : "No biography has been added for this content profile yet.")}
                                    </p>
                                </div>
                            </div>

                            <div
                                className={
                                    styles.statsGrid
                                }
                            >
                                <article>
                                    <strong>
                                        {topics.length}
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Konu"
                                            : "Topics"}
                                    </span>
                                </article>

                                <article>
                                    <strong>
                                        {totalComments}
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Yorum"
                                            : "Comments"}
                                    </span>
                                </article>

                                <article>
                                    <strong>
                                        {totalViews}
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Görüntülenme"
                                            : "Views"}
                                    </span>
                                </article>

                                <article>
                                    <strong>
                                        ✓
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Doğrulanmış"
                                            : "Verified"}
                                    </span>
                                </article>
                            </div>
                        </section>

                        <section
                            id="public-profile-content"
                            className={
                                styles.publicProfileContent
                            }
                        >
                            <div
                                className={
                                    styles.contentHeading
                                }
                            >
                                <div>
                                    <span>
                                        FORUMFENOMEN
                                    </span>

                                    <h2>
                                        {language === "tr"
                                            ? "Yayınlanan Konular"
                                            : "Published Topics"}
                                    </h2>

                                    <p>
                                        {language === "tr"
                                            ? `${profileName} adına ForumFenomen tarafından hazırlanan içerikler.`
                                            : `Content prepared by ForumFenomen under the name ${profileName}.`}
                                    </p>
                                </div>
                            </div>

                            <div
                                className={
                                    styles.summaryGrid
                                }
                            >
                                <article>
                                    <span>
                                        {language === "tr"
                                            ? "Uzmanlık Alanı"
                                            : "Specialty"}
                                    </span>

                                    <p>
                                        {specialty}
                                    </p>
                                </article>

                                <article>
                                    <span>
                                        {language === "tr"
                                            ? "Profil Türü"
                                            : "Profile Type"}
                                    </span>

                                    <p>
                                        {profileType}
                                    </p>
                                </article>
                            </div>

                            <div
                                className={
                                    styles.activityHeading
                                }
                            >
                                <h3>
                                    {language === "tr"
                                        ? "Son Konular"
                                        : "Latest Topics"}
                                </h3>
                            </div>

                            <div
                                className={
                                    styles.simpleList
                                }
                            >
                                {topics.length === 0 ? (
                                    <div
                                        className={
                                            styles.emptyState
                                        }
                                    >
                                        <p>
                                            {language === "tr"
                                                ? "Bu içerik profili adına henüz konu yayınlanmamış."
                                                : "No topics have been published for this content profile yet."}
                                        </p>
                                    </div>
                                ) : (
                                    topics.map(
                                        (topic) => (
                                            <button
                                                type="button"
                                                key={
                                                    topic.id
                                                }
                                                onClick={() => {
                                                    router.push(
                                                        `/konu/${topic.id}`
                                                    );
                                                }}
                                            >
                                                <span
                                                    className={
                                                        styles.simpleListIcon
                                                    }
                                                >
                                                    <TopicIcon />
                                                </span>

                                                <span>
                                                    <strong>
                                                        {
                                                            topic.title
                                                        }
                                                    </strong>

                                                    <small>
                                                        {topic
                                                            .categories
                                                            ?.name ??
                                                            (language ===
                                                                "tr"
                                                                ? "Genel"
                                                                : "General")}
                                                        {" · "}
                                                        {topic.comment_count ??
                                                            0}{" "}
                                                        {language ===
                                                            "tr"
                                                            ? "yorum"
                                                            : "comments"}
                                                        {" · "}
                                                        {formatRelativeTime(
                                                            topic.created_at,
                                                            language
                                                        )}
                                                    </small>
                                                </span>

                                                <ChevronIcon />
                                            </button>
                                        )
                                    )
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>

            <ForumFooter />

            <nav
                className="ff-bottom-nav"
                aria-label={
                    language === "tr"
                        ? "Ana menü"
                        : "Main menu"
                }
            >
                <Link href="/akis">
                    <HomeIcon />
                    <span>
                        {language === "tr"
                            ? "Ana Sayfa"
                            : "Home"}
                    </span>
                </Link>

                <Link href="/kategoriler">
                    <GridIcon />
                    <span>
                        {language === "tr"
                            ? "Kategoriler"
                            : "Categories"}
                    </span>
                </Link>

                <Link
                    href="/konu-ac"
                    className="ff-center-nav-button"
                    aria-label={
                        language === "tr"
                            ? "Yeni konu aç"
                            : "Create new topic"
                    }
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
                    <span>
                        {language === "tr"
                            ? "Blog"
                            : "Blog"}
                    </span>
                </Link>

                <Link href="/profil">
                    <ProfileIcon />
                    <span>
                        {language === "tr"
                            ? "Profil"
                            : "Profile"}
                    </span>
                </Link>
            </nav>
        </main>
    );
}