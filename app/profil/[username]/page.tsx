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

import styles from "../page.module.css";

type Theme = "dark" | "light";

type PublicProfileTab =
    | "topics"
    | "comments"
    | "followers"
    | "following";

type VisibilityOption =
    | "public"
    | "followers"
    | "following";

type PublicProfileRow = {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;

    profile_visibility: VisibilityOption;
    followers_visibility: VisibilityOption;
    following_visibility: VisibilityOption;
    comments_visibility: VisibilityOption;
    likes_visibility: VisibilityOption;
};

type PublicTopicRow = {
    id: string;
    title: string;
    created_at: string;
    comment_count: number;

    categories: {
        name: string;
    } | null;
};

type PublicCommentRow = {
    id: string;
    content: string;
    created_at: string;
    topic_id: string;

    topics: {
        id: string;
        title: string;
        status: string;
    } | null;
};

type PublicFollowerRow = {
    follower_id: string;
    created_at: string;

    profiles: {
        id: string;
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
    } | null;
};

type PublicFollowingRow = {
    following_id: string;
    created_at: string;

    profiles: {
        id: string;
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
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

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

function UserPlusIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="8" r="4" />
            <path d="M2.5 21c.7-5 3-7 6.5-7 2.1 0 3.8.7 5 2" />
            <path d="M18 13v7M14.5 16.5h7" />
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

function ArrowLeftIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14 6-6 6 6 6" />
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
            <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1.5"
            />
            <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1.5"
            />
            <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1.5"
            />
            <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1.5"
            />
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

export default function PublicProfilePage() {
    const router = useRouter();

    const params = useParams<{
        username: string;
    }>();

    const usernameParam =
        typeof params.username === "string"
            ? decodeURIComponent(params.username)
                .replace(/^@/, "")
                .toLowerCase()
            : "";

    const [language, setLanguage] =
        useState<ForumLanguage>("tr");

    const [theme, setTheme] =
        useState<Theme>("dark");

    const [activeTab, setActiveTab] =
        useState<PublicProfileTab>("topics");

    const [profile, setProfile] =
        useState<PublicProfileRow | null>(null);

    const [topics, setTopics] =
        useState<PublicTopicRow[]>([]);

    const [comments, setComments] =
        useState<PublicCommentRow[]>([]);

    const [followers, setFollowers] =
        useState<PublicFollowerRow[]>([]);

    const [followingUsers, setFollowingUsers] =
        useState<PublicFollowingRow[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [notFound, setNotFound] =
        useState(false);

    const [currentUserId, setCurrentUserId] =
        useState<string | null>(null);

    const [isFollowing, setIsFollowing] =
        useState(false);

    const [
        ownerFollowsCurrentUser,
        setOwnerFollowsCurrentUser,
    ] = useState(false);

    const [followLoading, setFollowLoading] =
        useState(false);

    const [reportOpen, setReportOpen] =
        useState(false);

    const [reportReason, setReportReason] =
        useState("");

    const [reportDetails, setReportDetails] =
        useState("");

    const [reportLoading, setReportLoading] =
        useState(false);

    const [reportSuccess, setReportSuccess] =
        useState(false);

    const [reportError, setReportError] =
        useState<string | null>(null);

    const [
        followRequestStatus,
        setFollowRequestStatus,
    ] = useState<
        "none" | "pending" | "accepted" | "rejected"
    >("none");

    const [
        followRequestLoading,
        setFollowRequestLoading,
    ] = useState(false);

    const [followerCount, setFollowerCount] =
        useState(0);

    const [followingCount, setFollowingCount] =
        useState(0);

    const [commentCount, setCommentCount] =
        useState(0);

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

        async function loadPublicProfile() {
            if (!usernameParam) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!isActive) {
                return;
            }

            setCurrentUserId(user?.id ?? null);

            const {
                data: profileData,
                error: profileError,
            } = await supabase
                .from("public_profiles")
                .select(`
  id,
  display_name,
  username,
  avatar_url,
  bio,
  profile_visibility,
  followers_visibility,
  following_visibility,
  comments_visibility,
  likes_visibility
`)
                .ilike("username", usernameParam)
                .maybeSingle();

            if (!isActive) {
                return;
            }

            if (
                profileError ||
                !profileData
            ) {
                console.error(
                    "Herkese açık profil alınamadı:",
                    profileError?.message
                );

                setProfile(null);
                setNotFound(true);
                setLoading(false);
                return;
            }

            const publicProfile =
                profileData as PublicProfileRow;

            const [
                topicsResult,
                commentsListResult,
                followersListResult,
                followingListResult,
                followersResult,
                followingResult,
                commentsResult,
                currentFollowResult,
                ownerFollowResult,
                followRequestResult,
            ] = await Promise.all([
                supabase
                    .from("topics")
                    .select(`
            id,
            title,
            created_at,
            comment_count,
            categories (
              name
            )
          `)
                    .eq(
                        "author_id",
                        publicProfile.id
                    )
                    .eq("status", "published")
                    .order("created_at", {
                        ascending: false,
                    })
                    .limit(20),
                supabase
                    .from("topic_comments")
                    .select(`
    id,
    content,
    created_at,
    topic_id,
    topics (
      id,
      title,
      status
    )
  `)
                    .eq("author_id", publicProfile.id)
                    .eq("status", "published")
                    .order("created_at", {
                        ascending: false,
                    })
                    .limit(50),

                supabase
                    .from("user_follows")
                    .select(`
    follower_id,
    created_at,
    profiles:profiles!user_follows_follower_id_fkey (
      id,
      display_name,
      username,
      avatar_url
    )
  `)
                    .eq("following_id", publicProfile.id)
                    .order("created_at", {
                        ascending: false,
                    }),

                supabase
                    .from("user_follows")
                    .select(`
    following_id,
    created_at,
    profiles:profiles!user_follows_following_id_fkey (
      id,
      display_name,
      username,
      avatar_url
    )
  `)
                    .eq("follower_id", publicProfile.id)
                    .order("created_at", {
                        ascending: false,
                    }),

                supabase
                    .from("user_follows")
                    .select("follower_id", {
                        count: "exact",
                        head: true,
                    })
                    .eq(
                        "following_id",
                        publicProfile.id
                    ),

                supabase
                    .from("user_follows")
                    .select("following_id", {
                        count: "exact",
                        head: true,
                    })
                    .eq(
                        "follower_id",
                        publicProfile.id
                    ),

                supabase
                    .from("topic_comments")
                    .select("id", {
                        count: "exact",
                        head: true,
                    })
                    .eq(
                        "author_id",
                        publicProfile.id
                    )
                    .eq("status", "published"),

                user
                    ? supabase
                        .from("user_follows")
                        .select("following_id")
                        .eq(
                            "follower_id",
                            user.id
                        )
                        .eq(
                            "following_id",
                            publicProfile.id
                        )
                        .maybeSingle()
                    : Promise.resolve({
                        data: null,
                        error: null,
                    }),

                user
                    ? supabase
                        .from("user_follow_requests")
                        .select("status")
                        .eq("requester_id", user.id)
                        .eq("receiver_id", publicProfile.id)
                        .maybeSingle()
                    : Promise.resolve({
                        data: null,
                        error: null,
                    }),

                user
                    ? supabase
                        .from("user_follows")
                        .select("following_id")
                        .eq(
                            "follower_id",
                            publicProfile.id
                        )
                        .eq(
                            "following_id",
                            user.id
                        )
                        .maybeSingle()
                    : Promise.resolve({
                        data: null,
                        error: null,
                    }),
            ]);

            if (!isActive) {
                return;
            }

            if (topicsResult.error) {
                console.error(
                    "Kullanıcı konuları alınamadı:",
                    topicsResult.error.message
                );
            }

            setProfile(publicProfile);

            setTopics(
                (topicsResult.data ??
                    []) as unknown as PublicTopicRow[]
            );

            setComments(
                (commentsListResult.data ??
                    []) as unknown as PublicCommentRow[]
            );

            setFollowers(
                (
                    (followersListResult.data ??
                        []) as unknown as PublicFollowerRow[]
                ).filter((item) => item.profiles)
            );

            setFollowingUsers(
                (
                    (followingListResult.data ??
                        []) as unknown as PublicFollowingRow[]
                ).filter((item) => item.profiles)
            );

            setFollowerCount(
                followersResult.count ?? 0
            );

            setFollowingCount(
                followingResult.count ?? 0
            );

            setCommentCount(
                commentsResult.count ?? 0
            );

            setIsFollowing(
                Boolean(currentFollowResult.data)
            );

            setOwnerFollowsCurrentUser(
                Boolean(ownerFollowResult.data)
            );

            const followRequestData =
                followRequestResult.data as
                | {
                    status:
                    | "pending"
                    | "accepted"
                    | "rejected";
                }
                | null;

            if (
                followRequestData?.status === "pending" ||
                followRequestData?.status === "accepted" ||
                followRequestData?.status === "rejected"
            ) {
                setFollowRequestStatus(
                    followRequestData.status
                );
            } else {
                setFollowRequestStatus("none");
            }

            setNotFound(false);
            setLoading(false);
        }

        void loadPublicProfile();

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

        document.documentElement.dataset.theme =
            nextTheme;

        window.localStorage.setItem(
            "forumfenomen-theme",
            nextTheme
        );
    }

    async function handleFollowRequest() {
        if (!profile || followRequestLoading) {
            return;
        }

        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (currentUserId === profile.id) {
            return;
        }

        setFollowRequestLoading(true);

        try {
            const supabase = createClient();

            const { data, error } =
                await supabase.rpc(
                    "toggle_follow_request",
                    {
                        p_receiver_id: profile.id,
                    }
                );

            if (error) {
                console.error(
                    "Takip isteği işlemi başarısız:",
                    error.message
                );

                window.alert(
                    language === "tr"
                        ? "Takip isteği gerçekleştirilemedi."
                        : "Follow request could not be completed."
                );

                return;
            }

            if (data === "pending") {
                setFollowRequestStatus("pending");
            } else {
                setFollowRequestStatus("none");
            }
        } catch (error) {
            console.error(
                "Beklenmeyen takip isteği hatası:",
                error
            );

            window.alert(
                language === "tr"
                    ? "Takip isteği sırasında bir hata oluştu."
                    : "An error occurred during the follow request."
            );
        } finally {
            setFollowRequestLoading(false);
        }
    }

    async function handleFollowToggle() {
        if (!profile || followLoading) {
            return;
        }

        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (currentUserId === profile.id) {
            router.push("/profil");
            return;
        }

        const previousFollowing =
            isFollowing;

        setFollowLoading(true);
        setIsFollowing(!previousFollowing);

        setFollowerCount((current) =>
            Math.max(
                0,
                current +
                (previousFollowing ? -1 : 1)
            )
        );

        try {
            const supabase = createClient();

            const { data, error } =
                await supabase.rpc(
                    "toggle_user_follow",
                    {
                        p_following_id: profile.id,
                    }
                );

            if (error) {
                console.error(
                    "Takip işlemi başarısız:",
                    error.message
                );

                setIsFollowing(
                    previousFollowing
                );

                setFollowerCount((current) =>
                    Math.max(
                        0,
                        current +
                        (previousFollowing
                            ? 1
                            : -1)
                    )
                );

                window.alert(
                    language === "tr"
                        ? "Takip işlemi gerçekleştirilemedi."
                        : "The follow action could not be completed."
                );

                return;
            }

            const nextFollowing =
                data === true;

            setIsFollowing(nextFollowing);
        } catch (error) {
            console.error(
                "Beklenmeyen takip hatası:",
                error
            );

            setIsFollowing(
                previousFollowing
            );

            setFollowerCount((current) =>
                Math.max(
                    0,
                    current +
                    (previousFollowing
                        ? 1
                        : -1)
                )
            );
        } finally {
            setFollowLoading(false);
        }
    }

    async function handleProfileReport() {
        if (!profile || reportLoading) {
            return;
        }

        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (currentUserId === profile.id) {
            return;
        }

        if (!reportReason) {
            setReportError(
                language === "tr"
                    ? "Lütfen bir şikâyet nedeni seç."
                    : "Please select a report reason."
            );

            return;
        }

        setReportLoading(true);
        setReportError(null);
        setReportSuccess(false);

        try {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "submit_profile_report",
                {
                    p_profile_id: profile.id,
                    p_reason: reportReason,
                    p_details:
                        reportDetails.trim() || null,
                }
            );

            if (error) {
                if (
                    error.message.includes(
                        "REPORT_ALREADY_EXISTS"
                    )
                ) {
                    setReportError(
                        language === "tr"
                            ? "Bu profil için zaten açık bir şikâyetin bulunuyor."
                            : "You already have an open report for this profile."
                    );
                } else {
                    setReportError(
                        language === "tr"
                            ? "Şikâyet gönderilemedi."
                            : "The report could not be submitted."
                    );
                }

                return;
            }

            setReportSuccess(true);
            setReportReason("");
            setReportDetails("");

            window.setTimeout(() => {
                setReportOpen(false);
                setReportSuccess(false);
            }, 1800);
        } catch (error) {
            console.error(
                "Profil şikâyeti gönderilemedi:",
                error
            );

            setReportError(
                language === "tr"
                    ? "Beklenmeyen bir hata oluştu."
                    : "An unexpected error occurred."
            );
        } finally {
            setReportLoading(false);
        }
    }

    function formatTopicDate(
        value: string
    ) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat(
            language === "tr"
                ? "tr-TR"
                : "en-US",
            {
                dateStyle: "medium",
                timeZone: "Europe/Istanbul",
            }
        ).format(date);
    }

    function formatCommentDate(
        value: string
    ) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat(
            language === "tr"
                ? "tr-TR"
                : "en-US",
            {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Europe/Istanbul",
            }
        ).format(date);
    }

    function getPublicPersonDetails(
        person: {
            id: string;
            display_name: string | null;
            username: string | null;
            avatar_url: string | null;
        }
    ) {
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

        return {
            cleanUsername,
            displayName,
            initials,
            profileUrl,
        };
    }



    const profileName =
        profile?.display_name?.trim() ||
        profile?.username
            ?.replace(/^@/, "")
            .trim() ||
        (language === "tr"
            ? "ForumFenomen Üyesi"
            : "ForumFenomen Member");

    const profileUsername =
        profile?.username
            ? `@${profile.username.replace(
                /^@/,
                ""
            )}`
            : `@${usernameParam}`;

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

    const isOwnProfile =
        Boolean(
            currentUserId &&
            profile &&
            currentUserId === profile.id
        );

    function canViewVisibility(
        visibility: VisibilityOption
    ) {
        if (isOwnProfile) {
            return true;
        }

        if (visibility === "public") {
            return true;
        }

        if (visibility === "followers") {
            return isFollowing;
        }

        return ownerFollowsCurrentUser;
    }

    const canViewProfile =
        profile
            ? canViewVisibility(
                profile.profile_visibility
            )
            : false;

    const canViewComments =
        profile
            ? canViewVisibility(
                profile.comments_visibility
            )
            : false;

    const canViewFollowers =
        profile
            ? canViewVisibility(
                profile.followers_visibility
            )
            : false;

    const canViewFollowing =
        profile
            ? canViewVisibility(
                profile.following_visibility
            )
            : false;

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

                <Link
                    href="/akis"
                    className={styles.publicProfileBack}
                >
                    <ArrowLeftIcon />

                    {language === "tr"
                        ? "Akışa geri dön"
                        : "Return to feed"}
                </Link>

                {loading ? (
                    <section
                        className={
                            styles.publicProfileState
                        }
                    >
                        {language === "tr"
                            ? "Profil yükleniyor..."
                            : "Loading profile..."}
                    </section>
                ) : notFound || !profile ? (
                    <section
                        className={
                            styles.publicProfileState
                        }
                    >
                        <h1>
                            {language === "tr"
                                ? "Kullanıcı bulunamadı"
                                : "User not found"}
                        </h1>

                        <p>
                            {language === "tr"
                                ? "Bu kullanıcı kaldırılmış veya kullanıcı adını değiştirmiş olabilir."
                                : "This user may have been removed or changed their username."}
                        </p>
                    </section>
                ) : !canViewProfile ? (
                    <section
                        className={
                            styles.publicProfileState
                        }
                    >
                        <div
                            className={
                                styles.privateProfileIcon
                            }
                            aria-hidden="true"
                        >
                            🔒
                        </div>

                        <h1>
                            {language === "tr"
                                ? "Bu profil gizli"
                                : "This profile is private"}
                        </h1>

                        <p>
                            {profile.profile_visibility ===
                                "followers"
                                ? language === "tr"
                                    ? "Bu profili yalnızca takipçileri görüntüleyebilir."
                                    : "Only followers can view this profile."
                                : language === "tr"
                                    ? "Bu profili yalnızca kullanıcının takip ettiği kişiler görüntüleyebilir."
                                    : "Only people followed by this user can view this profile."}
                        </p>

                        {!currentUserId ? (
                            <Link
                                href="/giris"
                                className={
                                    styles.privateProfileButton
                                }
                            >
                                {language === "tr"
                                    ? "Giriş Yap"
                                    : "Sign In"}
                            </Link>
                        ) : profile.profile_visibility ===
                            "followers" ? (
                            <button
                                type="button"
                                className={
                                    followRequestStatus === "pending"
                                        ? styles.publicFollowingButton
                                        : styles.publicFollowButton
                                }
                                disabled={followRequestLoading}
                                onClick={() => {
                                    void handleFollowRequest();
                                }}
                            >
                                {followRequestStatus === "pending" ? (
                                    <CheckIcon />
                                ) : (
                                    <UserPlusIcon />
                                )}

                                {followRequestLoading
                                    ? "..."
                                    : followRequestStatus === "pending"
                                        ? language === "tr"
                                            ? "İstek Gönderildi"
                                            : "Request Sent"
                                        : language === "tr"
                                            ? "Takip İsteği Gönder"
                                            : "Send Follow Request"}
                            </button>
                        ) : null}
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
                                                alt={profileName}
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
                                        <h1>{profileName}</h1>

                                        <span
                                            className={
                                                styles.verifiedBadge
                                            }
                                        >
                                            <CheckIcon />
                                        </span>
                                    </div>

                                    <span
                                        className={
                                            styles.username
                                        }
                                    >
                                        {profileUsername}
                                    </span>

                                    <div
                                        className={
                                            styles.profileBadges
                                        }
                                    >
                                        <span>Fenomen</span>
                                    </div>

                                    <p>
                                        {profile.bio?.trim() ||
                                            (language === "tr"
                                                ? "Bu kullanıcı henüz biyografi eklememiş."
                                                : "This user has not added a biography yet.")}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.profileActions}>
                                {isOwnProfile ? (
                                    <Link
                                        href="/profil"
                                        className={
                                            styles.publicProfileOwnButton
                                        }
                                    >
                                        {language === "tr"
                                            ? "Profilime Git"
                                            : "Open My Profile"}
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className={
                                                isFollowing
                                                    ? styles.publicFollowingButton
                                                    : styles.publicFollowButton
                                            }
                                            disabled={followLoading}
                                            onClick={() => {
                                                void handleFollowToggle();
                                            }}
                                        >
                                            {isFollowing ? (
                                                <CheckIcon />
                                            ) : (
                                                <UserPlusIcon />
                                            )}

                                            {followLoading
                                                ? "..."
                                                : isFollowing
                                                    ? language === "tr"
                                                        ? "Takip Ediliyor"
                                                        : "Following"
                                                    : language === "tr"
                                                        ? "Takip Et"
                                                        : "Follow"}
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                styles.publicProfileReportButton
                                            }
                                            onClick={() => {
                                                if (!currentUserId) {
                                                    router.push("/giris");
                                                    return;
                                                }

                                                setReportOpen(true);
                                                setReportError(null);
                                                setReportSuccess(false);
                                            }}
                                        >
                                            {language === "tr"
                                                ? "Şikâyet Et"
                                                : "Report"}
                                        </button>
                                    </>
                                )}
                            </div>

                            <div
                                className={
                                    styles.statsGrid
                                }
                            >
                                <button
                                    type="button"
                                    className={
                                        activeTab === "topics"
                                            ? styles.activeProfileStat
                                            : undefined
                                    }
                                    onClick={() => {
                                        setActiveTab("topics");

                                        document
                                            .getElementById(
                                                "public-profile-content"
                                            )
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                    }}
                                >
                                    <strong>
                                        {topics.length}
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Konu"
                                            : "Topics"}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        activeTab === "comments"
                                            ? styles.activeProfileStat
                                            : undefined
                                    }
                                    onClick={() => {
                                        setActiveTab("comments");

                                        document
                                            .getElementById(
                                                "public-profile-content"
                                            )
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                    }}
                                >
                                    <strong>
                                        {commentCount}
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Yorum"
                                            : "Comments"}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        activeTab === "followers"
                                            ? styles.activeProfileStat
                                            : undefined
                                    }
                                    onClick={() => {
                                        setActiveTab("followers");

                                        document
                                            .getElementById(
                                                "public-profile-content"
                                            )
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                    }}
                                >
                                    <strong>
                                        {followerCount}
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Takipçi"
                                            : "Followers"}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        activeTab === "following"
                                            ? styles.activeProfileStat
                                            : undefined
                                    }
                                    onClick={() => {
                                        setActiveTab("following");

                                        document
                                            .getElementById(
                                                "public-profile-content"
                                            )
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                    }}
                                >
                                    <strong>
                                        {followingCount}
                                    </strong>

                                    <span>
                                        {language === "tr"
                                            ? "Takip"
                                            : "Following"}
                                    </span>
                                </button>
                            </div>
                        </section>

                        <section
                            id="public-profile-content"
                            className={styles.publicProfileContent}
                        >
                            <div className={styles.contentHeading}>
                                <div>
                                    <span>FORUMFENOMEN</span>

                                    <h2>
                                        {activeTab === "topics"
                                            ? language === "tr"
                                                ? "Konuları"
                                                : "Topics"
                                            : activeTab === "comments"
                                                ? language === "tr"
                                                    ? "Yorumları"
                                                    : "Comments"
                                                : activeTab === "followers"
                                                    ? language === "tr"
                                                        ? "Takipçileri"
                                                        : "Followers"
                                                    : language === "tr"
                                                        ? "Takip Ettikleri"
                                                        : "Following"}
                                    </h2>

                                    <p>
                                        {activeTab === "topics"
                                            ? language === "tr"
                                                ? `${profileName} tarafından açılan konular.`
                                                : `Topics created by ${profileName}.`
                                            : activeTab === "comments"
                                                ? language === "tr"
                                                    ? `${profileName} tarafından yapılan yorumlar.`
                                                    : `Comments posted by ${profileName}.`
                                                : activeTab === "followers"
                                                    ? language === "tr"
                                                        ? `${profileName} adlı kullanıcıyı takip eden kişiler.`
                                                        : `People who follow ${profileName}.`
                                                    : language === "tr"
                                                        ? `${profileName} tarafından takip edilen kişiler.`
                                                        : `People followed by ${profileName}.`}
                                    </p>
                                </div>
                            </div>

                            {activeTab === "topics" ? (
                                <div className={styles.simpleList}>
                                    {topics.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <p>
                                                {language === "tr"
                                                    ? "Bu kullanıcı henüz konu açmamış."
                                                    : "This user has not created any topics yet."}
                                            </p>
                                        </div>
                                    ) : (
                                        topics.map((topic) => (
                                            <button
                                                type="button"
                                                key={topic.id}
                                                onClick={() => {
                                                    router.push(`/konu/${topic.id}`);
                                                }}
                                            >
                                                <span className={styles.simpleListIcon}>
                                                    <TopicIcon />
                                                </span>

                                                <span>
                                                    <strong>{topic.title}</strong>

                                                    <small>
                                                        {topic.categories?.name ??
                                                            (language === "tr"
                                                                ? "Genel"
                                                                : "General")}
                                                        {" · "}
                                                        {topic.comment_count ?? 0}{" "}
                                                        {language === "tr"
                                                            ? "yorum"
                                                            : "comments"}
                                                        {" · "}
                                                        {formatTopicDate(topic.created_at)}
                                                    </small>
                                                </span>

                                                <ChevronIcon />
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : activeTab === "comments" ? (
                                <div className={styles.commentList}>
                                    {comments.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <p>
                                                {language === "tr"
                                                    ? "Bu kullanıcı henüz yorum yapmamış."
                                                    : "This user has not posted any comments yet."}
                                            </p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => {
                                            const topic = comment.topics;

                                            return (
                                                <article key={comment.id}>
                                                    <div>
                                                        <strong>
                                                            {topic?.title ??
                                                                (language === "tr"
                                                                    ? "Konu bulunamadı"
                                                                    : "Topic unavailable")}
                                                        </strong>

                                                        <p>{comment.content}</p>

                                                        <small>
                                                            {formatCommentDate(
                                                                comment.created_at
                                                            )}
                                                        </small>
                                                    </div>

                                                    {topic?.status === "published" ? (
                                                        <Link
                                                            href={`/konu/${comment.topic_id}#comment-${comment.id}`}
                                                            aria-label={
                                                                language === "tr"
                                                                    ? "Yorumu aç"
                                                                    : "Open comment"
                                                            }
                                                        >
                                                            <ChevronIcon />
                                                        </Link>
                                                    ) : null}
                                                </article>
                                            );
                                        })
                                    )}
                                </div>
                            ) : activeTab === "followers" ? (
                                <div className={styles.peopleList}>
                                    {followers.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <p>
                                                {language === "tr"
                                                    ? "Bu kullanıcının henüz takipçisi bulunmuyor."
                                                    : "This user does not have any followers yet."}
                                            </p>
                                        </div>
                                    ) : (
                                        followers.map((follow) => {
                                            const person = follow.profiles;

                                            if (!person) {
                                                return null;
                                            }

                                            const personDetails =
                                                getPublicPersonDetails(person);

                                            return (
                                                <article
                                                    key={follow.follower_id}
                                                    className={styles.followingPersonRow}
                                                >
                                                    {personDetails.profileUrl ? (
                                                        <Link
                                                            href={personDetails.profileUrl}
                                                            className={
                                                                styles.followingPersonLink
                                                            }
                                                        >
                                                            <span
                                                                className={styles.personAvatar}
                                                            >
                                                                {person.avatar_url ? (
                                                                    <img
                                                                        src={person.avatar_url}
                                                                        alt={
                                                                            personDetails.displayName
                                                                        }
                                                                        referrerPolicy="no-referrer"
                                                                    />
                                                                ) : (
                                                                    personDetails.initials
                                                                )}
                                                            </span>

                                                            <span
                                                                className={
                                                                    styles.followingPersonText
                                                                }
                                                            >
                                                                <strong>
                                                                    {personDetails.displayName}
                                                                </strong>

                                                                <small>
                                                                    {personDetails.cleanUsername
                                                                        ? `@${personDetails.cleanUsername}`
                                                                        : "@fenomen"}
                                                                </small>
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            <span
                                                                className={styles.personAvatar}
                                                            >
                                                                {personDetails.initials}
                                                            </span>

                                                            <span>
                                                                <strong>
                                                                    {personDetails.displayName}
                                                                </strong>
                                                            </span>
                                                        </>
                                                    )}

                                                    {personDetails.profileUrl ? (
                                                        <Link
                                                            href={personDetails.profileUrl}
                                                            className={styles.followingBadge}
                                                        >
                                                            {language === "tr"
                                                                ? "Profili Gör"
                                                                : "View Profile"}
                                                        </Link>
                                                    ) : null}
                                                </article>
                                            );
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className={styles.peopleList}>
                                    {followingUsers.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <p>
                                                {language === "tr"
                                                    ? "Bu kullanıcı henüz kimseyi takip etmiyor."
                                                    : "This user is not following anyone yet."}
                                            </p>
                                        </div>
                                    ) : (
                                        followingUsers.map((follow) => {
                                            const person = follow.profiles;

                                            if (!person) {
                                                return null;
                                            }

                                            const personDetails =
                                                getPublicPersonDetails(person);

                                            return (
                                                <article
                                                    key={follow.following_id}
                                                    className={styles.followingPersonRow}
                                                >
                                                    {personDetails.profileUrl ? (
                                                        <Link
                                                            href={personDetails.profileUrl}
                                                            className={
                                                                styles.followingPersonLink
                                                            }
                                                        >
                                                            <span
                                                                className={styles.personAvatar}
                                                            >
                                                                {person.avatar_url ? (
                                                                    <img
                                                                        src={person.avatar_url}
                                                                        alt={
                                                                            personDetails.displayName
                                                                        }
                                                                        referrerPolicy="no-referrer"
                                                                    />
                                                                ) : (
                                                                    personDetails.initials
                                                                )}
                                                            </span>

                                                            <span
                                                                className={
                                                                    styles.followingPersonText
                                                                }
                                                            >
                                                                <strong>
                                                                    {personDetails.displayName}
                                                                </strong>

                                                                <small>
                                                                    {personDetails.cleanUsername
                                                                        ? `@${personDetails.cleanUsername}`
                                                                        : "@fenomen"}
                                                                </small>
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            <span
                                                                className={styles.personAvatar}
                                                            >
                                                                {personDetails.initials}
                                                            </span>

                                                            <span>
                                                                <strong>
                                                                    {personDetails.displayName}
                                                                </strong>
                                                            </span>
                                                        </>
                                                    )}

                                                    {personDetails.profileUrl ? (
                                                        <Link
                                                            href={personDetails.profileUrl}
                                                            className={styles.followingBadge}
                                                        >
                                                            {language === "tr"
                                                                ? "Profili Gör"
                                                                : "View Profile"}
                                                        </Link>
                                                    ) : null}
                                                </article>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>

            {reportOpen && profile ? (
  <div
    className={styles.profileReportBackdrop}
    role="presentation"
    onClick={() => {
      if (!reportLoading) {
        setReportOpen(false);
      }
    }}
  >
    <section
      className={styles.profileReportModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-report-title"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className={styles.profileReportHeader}>
        <div>
          <span>
            {language === "tr"
              ? "GÜVENLİK"
              : "SAFETY"}
          </span>

          <h2 id="profile-report-title">
            {language === "tr"
              ? "Şikâyet Et"
              : "Report"}
          </h2>

          <p>
            {language === "tr"
              ? `${profileName} adlı kullanıcıyı neden şikâyet ettiğini belirt.`
              : `Tell us why you are reporting ${profileName}.`}
          </p>
        </div>

        <button
          type="button"
          aria-label={
            language === "tr"
              ? "Kapat"
              : "Close"
          }
          disabled={reportLoading}
          onClick={() => {
            setReportOpen(false);
          }}
        >
          ×
        </button>
      </div>

      <label className={styles.profileReportField}>
        <span>
          {language === "tr"
            ? "Şikâyet nedeni"
            : "Report reason"}
        </span>

        <select
          value={reportReason}
          disabled={reportLoading}
          onChange={(event) => {
            setReportReason(event.target.value);
            setReportError(null);
          }}
        >
          <option value="">
            {language === "tr"
              ? "Bir neden seç"
              : "Select a reason"}
          </option>

          <option value="spam">
            {language === "tr"
              ? "Spam veya yanıltıcı profil"
              : "Spam or misleading profile"}
          </option>

          <option value="harassment">
            {language === "tr"
              ? "Taciz veya zorbalık"
              : "Harassment or bullying"}
          </option>

          <option value="impersonation">
            {language === "tr"
              ? "Başkasını taklit etme"
              : "Impersonation"}
          </option>

          <option value="illegal_content">
            {language === "tr"
              ? "Yasa dışı veya zararlı içerik"
              : "Illegal or harmful content"}
          </option>

          <option value="other">
            {language === "tr"
              ? "Diğer"
              : "Other"}
          </option>
        </select>
      </label>

      <label className={styles.profileReportField}>
        <span>
          {language === "tr"
            ? "Açıklama"
            : "Details"}
        </span>

        <textarea
          value={reportDetails}
          maxLength={2000}
          disabled={reportLoading}
          placeholder={
            language === "tr"
              ? "Durumu kısaca açıkla..."
              : "Briefly describe the issue..."
          }
          onChange={(event) => {
            setReportDetails(
              event.target.value
            );

            setReportError(null);
          }}
        />

        <small>
          {reportDetails.length}/2000
        </small>
      </label>

      {reportError ? (
        <div
          className={
            styles.profileReportError
          }
          role="alert"
        >
          {reportError}
        </div>
      ) : null}

      {reportSuccess ? (
        <div
          className={
            styles.profileReportSuccess
          }
          role="status"
        >
          {language === "tr"
            ? "Şikâyetin başarıyla gönderildi."
            : "Your report was submitted successfully."}
        </div>
      ) : null}

      <div
        className={
          styles.profileReportActions
        }
      >
        <button
          type="button"
          disabled={reportLoading}
          onClick={() => {
            setReportOpen(false);
          }}
        >
          {language === "tr"
            ? "Vazgeç"
            : "Cancel"}
        </button>

        <button
          type="button"
          disabled={
            reportLoading ||
            !reportReason
          }
          onClick={() => {
            void handleProfileReport();
          }}
        >
          {reportLoading
            ? language === "tr"
              ? "Gönderiliyor..."
              : "Submitting..."
            : language === "tr"
              ? "Şikâyeti Gönder"
              : "Submit Report"}
        </button>
      </div>
    </section>
  </div>
) : null}

            <ForumFooter />

            <nav
                className="ff-bottom-nav"
                aria-label="ForumFenomen"
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
                            ? "Konu Oluştur"
                            : "Create Topic"
                    }
                    title={
                        language === "tr"
                            ? "Konu Oluştur"
                            : "Create Topic"
                    }
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
                    <span>Blog</span>
                </Link>

                <Link href="/profil">
                    <UserIcon />
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