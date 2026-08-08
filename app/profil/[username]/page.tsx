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
    useLayoutEffect,
    useState,
} from "react";

import styles from "../page.module.css";

type Theme = "dark" | "light";

type ProfileRole =
    | "user"
    | "moderator"
    | "admin";

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
    role: ProfileRole;

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

function ReportIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M5 21V4" />
            <path d="M5 5h11l-1.5 3L16 11H5" />
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

    const [
        canViewCommentsFromServer,
        setCanViewCommentsFromServer,
    ] = useState(false);

    const [followers, setFollowers] =
        useState<PublicFollowerRow[]>([]);

    const [followingUsers, setFollowingUsers] =
        useState<PublicFollowingRow[]>([]);

    const [
        canViewFollowersFromServer,
        setCanViewFollowersFromServer,
    ] = useState(false);

    const [
        canViewFollowingFromServer,
        setCanViewFollowingFromServer,
    ] = useState(false);

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

    useLayoutEffect(() => {
        if (loading) {
            return;
        }

        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }

        const resetSafariPage = () => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto",
            });

            // Safari'nin eski dokunma ve görüntü katmanını yenile.
            document.body.getBoundingClientRect();

            window.scrollBy(0, 1);
            window.scrollTo(0, 0);
        };

        resetSafariPage();

        const firstFrameId =
            window.requestAnimationFrame(() => {
                resetSafariPage();

                window.requestAnimationFrame(
                    resetSafariPage
                );
            });

        const timeout150 =
            window.setTimeout(
                resetSafariPage,
                150
            );

        const timeout500 =
            window.setTimeout(
                resetSafariPage,
                500
            );

        const timeout1000 =
            window.setTimeout(
                resetSafariPage,
                1000
            );

        const handlePageShow = () => {
            resetSafariPage();
        };

        window.addEventListener(
            "pageshow",
            handlePageShow
        );

        return () => {
            window.cancelAnimationFrame(
                firstFrameId
            );

            window.clearTimeout(timeout150);
            window.clearTimeout(timeout500);
            window.clearTimeout(timeout1000);

            window.removeEventListener(
                "pageshow",
                handlePageShow
            );
        };
    }, [usernameParam, loading]);

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

            setLoading(true);
            setNotFound(false);
            setActiveTab("topics");
            setComments([]);
            setCanViewCommentsFromServer(false);
            setFollowers([]);
            setFollowingUsers([]);
            setCanViewFollowersFromServer(false);
            setCanViewFollowingFromServer(false);

            const supabase = createClient();

            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (!isActive) {
                return;
            }

            if (
                sessionError ||
                !session?.user
            ) {
                window.location.replace("/giris");
                return;
            }

            const user = session.user;

            setCurrentUserId(user.id);

            const {
                data: profileRows,
                error: profileError,
            } = await supabase.rpc(
                "get_profile_by_username",
                {
                    p_username: usernameParam,
                }
            );

            const profileData =
                profileRows?.[0] ?? null;

            if (!isActive) {
                return;
            }

            if (profileError || !profileData) {
                if (profileError) {
                    console.error(
                        "Herkese açık profil alınamadı:",
                        profileError.message
                    );
                }

                setProfile(null);
                setNotFound(true);
                setLoading(false);
                return;
            }

            const publicProfile =
                profileData as PublicProfileRow;

            const [
                topicsResult,
                commentActivityResult,
                followDataResult,
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

                supabase.rpc(
                    "get_profile_comment_activity",
                    {
                        p_profile_id:
                            publicProfile.id,
                    }
                ),

                supabase.rpc(
                    "get_profile_follow_data",
                    {
                        p_profile_id:
                            publicProfile.id,
                    }
                ),

                user
                    ? supabase
                        .from("user_follow_requests")
                        .select("status")
                        .eq("requester_id", user.id)
                        .eq(
                            "receiver_id",
                            publicProfile.id
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

            if (commentActivityResult.error) {
                console.error(
                    "Secure profile comment activity could not be loaded:",
                    commentActivityResult.error.message
                );
            }

            const commentActivity =
                commentActivityResult.data?.[0] as
                | {
                    comment_count:
                    | number
                    | string
                    | null;

                    can_view_comments:
                    boolean | null;

                    comments:
                    PublicCommentRow[]
                    | null;
                }
                | undefined;

            const commentRows =
                Array.isArray(
                    commentActivity?.comments
                )
                    ? commentActivity.comments
                    : [];

            setComments(commentRows);

            const nextCommentCount = Number(
                commentActivity?.comment_count ?? 0
            );

            setCommentCount(
                Number.isFinite(nextCommentCount)
                    ? nextCommentCount
                    : 0
            );

            setCanViewCommentsFromServer(
                commentActivity
                    ?.can_view_comments === true
            );

            if (followDataResult.error) {
                console.error(
                    "G?venli takip verisi al?namad?:",
                    followDataResult.error.message
                );
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

                    is_following:
                    boolean | null;

                    owner_follows_current_user:
                    boolean | null;

                    can_view_followers:
                    boolean | null;

                    can_view_following:
                    boolean | null;

                    followers:
                    PublicFollowerRow[]
                    | null;

                    following_users:
                    PublicFollowingRow[]
                    | null;
                }
                | undefined;

            const followerRows =
                Array.isArray(followData?.followers)
                    ? followData.followers
                    : [];

            const followingRows =
                Array.isArray(
                    followData?.following_users
                )
                    ? followData.following_users
                    : [];

            setFollowers(
                followerRows.filter(
                    (item) => item.profiles
                )
            );

            setFollowingUsers(
                followingRows.filter(
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

            setIsFollowing(
                followData?.is_following === true
            );

            setOwnerFollowsCurrentUser(
                followData
                    ?.owner_follows_current_user ===
                true
            );

            setCanViewFollowersFromServer(
                followData?.can_view_followers === true
            );

            setCanViewFollowingFromServer(
                followData?.can_view_following === true
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
        canViewCommentsFromServer;

    const canViewFollowers =
        canViewFollowersFromServer;

    const canViewFollowing =
        canViewFollowingFromServer;

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

                <div className={styles.publicProfileTopBar}>
                    <Link
                        href="/akis"
                        className={styles.publicProfileBack}
                    >
                        <ArrowLeftIcon />

                        {language === "tr"
                            ? "Akışa geri dön"
                            : "Return to feed"}
                    </Link>

                    {profile && (
                        <div className={styles.publicProfileTopActions}>
                            {currentUserId === profile.id ? (
                                <Link
                                    href="/profil"
                                    className={styles.publicCompactOwnProfileButton}
                                >
                                    Profilime Git
                                </Link>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className={
                                            isFollowing ||
                                                followRequestStatus === "pending"
                                                ? styles.publicCompactFollowingButton
                                                : styles.publicCompactFollowButton
                                        }
                                        disabled={
                                            followLoading ||
                                            followRequestLoading ||
                                            followRequestStatus === "pending"
                                        }
                                        onClick={() => {
                                            if (
                                                profile.profile_visibility ===
                                                "followers" &&
                                                !isFollowing
                                            ) {
                                                if (
                                                    followRequestStatus ===
                                                    "pending"
                                                ) {
                                                    return;
                                                }

                                                void handleFollowRequest();
                                                return;
                                            }

                                            void handleFollowToggle();
                                        }}
                                    >
                                        {isFollowing ||
                                            followRequestStatus === "pending" ? (
                                            <CheckIcon />
                                        ) : (
                                            <UserPlusIcon />
                                        )}

                                        <span>
                                            {followLoading ||
                                                followRequestLoading
                                                ? "..."
                                                : isFollowing
                                                    ? language === "tr"
                                                        ? "Takiptesin"
                                                        : "Following"
                                                    : followRequestStatus ===
                                                        "pending"
                                                        ? language === "tr"
                                                            ? "İstek Gönderildi"
                                                            : "Request Sent"
                                                        : language === "tr"
                                                            ? "Takip Et"
                                                            : "Follow"}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.publicCompactFlagButton}
                                        title={
                                            language === "tr"
                                                ? "Profili şikâyet et"
                                                : "Report profile"
                                        }
                                        aria-label={
                                            language === "tr"
                                                ? "Profili şikâyet et"
                                                : "Report profile"
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
                                        <span aria-hidden="true">⚑</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

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
                                disabled={
                                    followRequestLoading ||
                                    followRequestStatus === "pending"
                                }
                                onClick={() => {
                                    if (
                                        followRequestStatus === "pending"
                                    ) {
                                        return;
                                    }

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
                                    <div className={styles.nameRow}>
                                        <h1>{profileName}</h1>
                                    </div>

                                    <span
                                        className={
                                            styles.username
                                        }
                                    >
                                        {profileUsername}
                                    </span>

                                    <div className={styles.profileBadges}>
                                        <span className={styles.memberRoleBadge}>
                                            {language === "tr"
                                                ? "Üye"
                                                : "Member"}
                                        </span>

                                        {profile.role === "moderator" ? (
                                            <span
                                                className={
                                                    styles.moderatorRoleBadge
                                                }
                                            >
                                                {language === "tr"
                                                    ? "Moderatör"
                                                    : "Moderator"}
                                            </span>
                                        ) : null}

                                        {profile.role === "admin" ? (
                                            <span
                                                className={
                                                    styles.adminRoleBadge
                                                }
                                            >
                                                {language === "tr"
                                                    ? "Yönetici"
                                                    : "Administrator"}
                                            </span>
                                        ) : null}
                                    </div>

                                    <p>
                                        {profile.bio?.trim() ||
                                            (language === "tr"
                                                ? "Bu kullanıcı henüz biyografi eklememiş."
                                                : "This user has not added a biography yet.")}
                                    </p>
                                </div>
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
                                    {!canViewComments ? (
                                        <div className={styles.emptyState}>
                                            <p>
                                                {language === "tr"
                                                    ? "Bu kullanıcının yorum listesi gizli."
                                                    : "This user's comment list is private."}
                                            </p>
                                        </div>
                                    ) : comments.length === 0 ? (
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
                                    {!canViewFollowers ? (
                                        <div className={styles.emptyState}>
                                            <p>
                                                {language === "tr"
                                                    ? "Bu kullan?c?n?n takip?i listesi gizli."
                                                    : "This user's follower list is private."}
                                            </p>
                                        </div>
                                    ) : followers.length === 0 ? (
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
                                                        <a
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
                                                        </a>
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
                                                        <a
                                                            href={personDetails.profileUrl}
                                                            className={styles.followingBadge}
                                                        >
                                                            {language === "tr"
                                                                ? "Profili Gör"
                                                                : "View Profile"}
                                                        </a>
                                                    ) : null}
                                                </article>
                                            );
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className={styles.peopleList}>
                                    {!canViewFollowing ? (
                                        <div className={styles.emptyState}>
                                            <p>
                                                {language === "tr"
                                                    ? "Bu kullan?c?n?n takip etti?i ki?iler gizli."
                                                    : "This user's following list is private."}
                                            </p>
                                        </div>
                                    ) : followingUsers.length === 0 ? (
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
                                                        <a
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
                                                        </a>
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
                                                        <a
                                                            href={personDetails.profileUrl}
                                                            className={styles.followingBadge}
                                                        >
                                                            {language === "tr"
                                                                ? "Profili Gör"
                                                                : "View Profile"}
                                                        </a>
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
                            setReportSuccess(false);
                            setReportError(null);
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
                        <div
                            className={`${styles.profileReportIcon} ${reportSuccess
                                ? styles.profileReportSuccessIcon
                                : ""
                                }`}
                        >
                            <ReportIcon />
                        </div>

                        <span className={styles.profileReportLabel}>
                            {language === "tr"
                                ? "TOPLULUK GÜVENLİĞİ"
                                : "COMMUNITY SAFETY"}
                        </span>

                        {reportSuccess ? (
                            <>
                                <h2 id="profile-report-title">
                                    {language === "tr"
                                        ? "Şikâyetin iletildi"
                                        : "Report submitted"}
                                </h2>

                                <p className={styles.profileReportDescription}>
                                    {language === "tr"
                                        ? "Profil hakkındaki bildirimin moderasyon sistemine kaydedildi. İnceleme sonucunda gerekli işlem uygulanacaktır."
                                        : "Your profile report has been recorded for moderation review."}
                                </p>

                                <div
                                    className={`${styles.profileReportActions} ${styles.profileReportSuccessActions}`}
                                >
                                    <button
                                        type="button"
                                        className={styles.profileReportSubmitButton}
                                        onClick={() => {
                                            setReportOpen(false);
                                            setReportSuccess(false);
                                            setReportError(null);
                                        }}
                                    >
                                        {language === "tr"
                                            ? "Tamam"
                                            : "Done"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 id="profile-report-title">
                                    {language === "tr"
                                        ? "Bu profili neden şikâyet ediyorsun?"
                                        : "Why are you reporting this profile?"}
                                </h2>

                                <p className={styles.profileReportDescription}>
                                    {language === "tr"
                                        ? "En uygun nedeni seç. Bildirimin profil sahibine gösterilmez."
                                        : "Select the most appropriate reason. Your report will not be shown to the profile owner."}
                                </p>

                                <div className={styles.profileReportReasonGrid}>
                                    {[
                                        {
                                            value: "spam",
                                            tr: "Spam veya yanıltıcı profil",
                                            en: "Spam or misleading profile",
                                        },
                                        {
                                            value: "harassment",
                                            tr: "Taciz veya zorbalık",
                                            en: "Harassment or bullying",
                                        },
                                        {
                                            value: "impersonation",
                                            tr: "Başkasını taklit etme",
                                            en: "Impersonation",
                                        },
                                        {
                                            value: "illegal_content",
                                            tr: "Yasa dışı veya zararlı içerik",
                                            en: "Illegal or harmful content",
                                        },
                                        {
                                            value: "other",
                                            tr: "Diğer",
                                            en: "Other",
                                        },
                                    ].map((reason) => (
                                        <button
                                            key={reason.value}
                                            type="button"
                                            className={
                                                reportReason === reason.value
                                                    ? styles.profileReportReasonActive
                                                    : ""
                                            }
                                            disabled={reportLoading}
                                            onClick={() => {
                                                setReportReason(reason.value);
                                                setReportError(null);
                                            }}
                                        >
                                            {language === "tr"
                                                ? reason.tr
                                                : reason.en}
                                        </button>
                                    ))}
                                </div>

                                <label className={styles.profileReportField}>
                                    <span>
                                        {language === "tr"
                                            ? "Ek açıklama (isteğe bağlı)"
                                            : "Additional details (optional)"}
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
                                        className={styles.profileReportError}
                                        role="alert"
                                    >
                                        {reportError}
                                    </div>
                                ) : null}

                                <div className={styles.profileReportActions}>
                                    <button
                                        type="button"
                                        className={styles.profileReportSubmitButton}
                                        disabled={
                                            reportLoading ||
                                            !reportReason
                                        }
                                        onClick={() => {
                                            void handleProfileReport();
                                        }}
                                    >
                                        <ReportIcon />

                                        {reportLoading
                                            ? language === "tr"
                                                ? "Gönderiliyor..."
                                                : "Submitting..."
                                            : language === "tr"
                                                ? "Şikâyeti Gönder"
                                                : "Submit Report"}
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.profileReportCancelButton}
                                        disabled={reportLoading}
                                        onClick={() => {
                                            setReportOpen(false);
                                            setReportSuccess(false);
                                            setReportError(null);
                                        }}
                                    >
                                        {language === "tr"
                                            ? "Vazgeç"
                                            : "Cancel"}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            ) : null}

            <ForumFooter />

            <nav
                className="ff-bottom-nav"
                aria-label="ForumFenomen"
            >
                <Link
                    href="/akis"
                    prefetch={false}
                >
                    <HomeIcon />
                    <span>
                        {language === "tr"
                            ? "Ana Sayfa"
                            : "Home"}
                    </span>
                </Link>

                <Link
                    href="/kategoriler"
                    prefetch={false}
                >
                    <GridIcon />
                    <span>
                        {language === "tr"
                            ? "Kategoriler"
                            : "Categories"}
                    </span>
                </Link>

                <Link
                    href="/konu-ac"
                    prefetch={false}
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
                    prefetch={false}
                >
                    <BlogIcon />
                    <span>Blog</span>
                </Link>

                <Link
                    href="/profil"
                    prefetch={false}
                >
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