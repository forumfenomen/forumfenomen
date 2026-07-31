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
    useRef,
    useState,
    type FormEvent,
} from "react";

import styles from "./page.module.css";

type Theme = "dark" | "light";

type TopicDetailRow = {
    id: string;
    author_id: string;
    title: string;
    content: string;
    created_at: string;
    comment_count: number;
    view_count: number;

    categories: {
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

type ReactionValue = -1 | 0 | 1;

type ReactionResult = {
    like_count: number;
    dislike_count: number;
    user_reaction: number;
};

type ReportReason =
    | "spam"
    | "harassment"
    | "hate"
    | "illegal"
    | "personal_information"
    | "other";

type ReportMessage =
    | "reason"
    | "error"
    | null;

type CommentRow = {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    parent_comment_id: string | null;
    like_count: number;
    dislike_count: number;

    profiles: {
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


function ArrowLeftIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14 6-6 6 6 6" />
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

function LikeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M7 10v11H3V10h4Z" />
            <path d="M7 19c3 1.4 6 2 9 2h1.2a2.7 2.7 0 0 0 2.65-2.17l1.1-5.5A2.8 2.8 0 0 0 18.2 10H14l.7-3.1A3.15 3.15 0 0 0 12.2 3L7 10Z" />
        </svg>
    );
}

function DislikeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M7 14V3H3v11h4Z" />
            <path d="M7 5c3-1.4 6-2 9-2h1.2a2.7 2.7 0 0 1 2.65 2.17l1.1 5.5A2.8 2.8 0 0 1 18.2 14H14l.7 3.1a3.15 3.15 0 0 1-2.5 3.9L7 14Z" />
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

function BookmarkIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M6 3.5h12v17l-6-3.8-6 3.8v-17Z" />
        </svg>
    );
}

function RemoveIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M4 7h16" />
            <path d="M9 7V4h6v3" />
            <path d="m7 7 1 14h8l1-14" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    );
}

function ReplyIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="m9 7-5 5 5 5" />
            <path d="M5 12h8a6 6 0 0 1 6 6v1" />
        </svg>
    );
}

export default function TopicDetailPage() {
    const router = useRouter();

    const params = useParams<{
        id: string;
    }>();

    const topicId =
        typeof params.id === "string"
            ? params.id
            : "";

    const [language, setLanguage] =
        useState<ForumLanguage>("tr");

    const [theme, setTheme] =
        useState<Theme>("dark");

    const [topic, setTopic] =
        useState<TopicDetailRow | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [notFound, setNotFound] =
        useState(false);

    const [comments, setComments] =
        useState<CommentRow[]>([]);

    const [commentsLoading, setCommentsLoading] =
        useState(true);

    const [commentText, setCommentText] =
        useState("");

    const [commentSubmitting, setCommentSubmitting] =
        useState(false);

    const [commentMessage, setCommentMessage] =
        useState<"login" | "error" | null>(null);

    const [replyingTo, setReplyingTo] =
        useState<CommentRow | null>(null);

    const commentInputRef =
        useRef<HTMLTextAreaElement | null>(null);

    const [
        highlightedCommentId,
        setHighlightedCommentId,
    ] = useState<string | null>(null);

    const highlightTimeoutRef =
        useRef<number | null>(null);

    const [currentUserId, setCurrentUserId] =
        useState<string | null>(null);

    const [authChecked, setAuthChecked] =
        useState(false);

    const [topicReaction, setTopicReaction] =
        useState<ReactionValue>(0);

    const [topicLikeCount, setTopicLikeCount] =
        useState(0);

    const [topicDislikeCount, setTopicDislikeCount] =
        useState(0);

    const [topicReactionLoading, setTopicReactionLoading] =
        useState(false);

    const [topicSaved, setTopicSaved] =
        useState(false);

    const [topicSaveCount, setTopicSaveCount] =
        useState(0);

    const [topicSaveLoading, setTopicSaveLoading] =
        useState(false);

    const [topicReported, setTopicReported] =
        useState(false);

    const [topicReportOpen, setTopicReportOpen] =
        useState(false);

    const [topicReportLoading, setTopicReportLoading] =
        useState(false);

    const [topicReportCompleted, setTopicReportCompleted] =
        useState(false);

    const [commentReactions, setCommentReactions] =
        useState<Record<string, ReactionValue>>({});

    const [reactionLoadingId, setReactionLoadingId] =
        useState<string | null>(null);

    const [reportedCommentIds, setReportedCommentIds] =
        useState<Record<string, boolean>>({});

    const [reportLoadingId, setReportLoadingId] =
        useState<string | null>(null);

    const [removeLoadingId, setRemoveLoadingId] =
        useState<string | null>(null);

    const [
        removeConfirmComment,
        setRemoveConfirmComment,
    ] = useState<CommentRow | null>(null);

    const [
        reportModalComment,
        setReportModalComment,
    ] = useState<CommentRow | null>(null);

    const [reportReason, setReportReason] =
        useState<ReportReason | "">("");

    const [reportDetails, setReportDetails] =
        useState("");

    const [reportMessage, setReportMessage] =
        useState<ReportMessage>(null);

    const [reportCompleted, setReportCompleted] =
        useState(false);

    useEffect(() => {
        if (!reportModalComment && !topicReportOpen) {
            return;
        }

        const scrollY = window.scrollY;

        const previousBodyPosition =
            document.body.style.position;

        const previousBodyTop =
            document.body.style.top;

        const previousBodyWidth =
            document.body.style.width;

        const previousBodyOverflow =
            document.body.style.overflow;

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.position =
                previousBodyPosition;

            document.body.style.top =
                previousBodyTop;

            document.body.style.width =
                previousBodyWidth;

            document.body.style.overflow =
                previousBodyOverflow;

            window.scrollTo(0, scrollY);
        };
    }, [reportModalComment, topicReportOpen]);

    /* TOPIC ENTRY SCROLL RESET START */

    useEffect(() => {
        if (!topicId) {
            return;
        }

        /*
         * Bildirimden belirli bir yoruma gelindiyse
         * mevcut yorum odaklama davran???n? koru.
         */
        if (
            window.location.hash.startsWith(
                "#comment-"
            )
        ) {
            return;
        }

        const resetScroll = () => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto",
            });
        };

        /*
         * iPhone Safari bazen ?nceki route'un
         * scroll konumunu ilk render sonras?nda
         * yeniden uygulad??? i?in ?? a?amada s?f?rla.
         */
        resetScroll();

        const frameId =
            window.requestAnimationFrame(
                resetScroll
            );

        const timerId =
            window.setTimeout(
                resetScroll,
                120
            );

        return () => {
            window.cancelAnimationFrame(
                frameId
            );

            window.clearTimeout(timerId);
        };
    }, [topicId]);

    /* TOPIC ENTRY SCROLL RESET END */

    /* TOPIC LOADED SCROLL RESET FINAL START */

    useEffect(() => {
        if (
            !topicId ||
            loading ||
            notFound
        ) {
            return;
        }

        /*
         * Yorum bildiriminden gelindiyse yorum odaklama
         * davran???na kesinlikle m?dahale etme.
         */
        if (
            window.location.hash.startsWith(
                "#comment-"
            )
        ) {
            return;
        }

        const resetScroll = () => {
            window.scrollTo(0, 0);

            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        /*
         * iPhone Safari ve Next.js, veri y?klendikten
         * sonra eski scroll konumunu yeniden uygulayabildi?i
         * i?in birka? a?amada tekrar en ?ste sabitliyoruz.
         */
        resetScroll();

        const frameOne =
            window.requestAnimationFrame(
                resetScroll
            );

        const frameTwo =
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(
                    resetScroll
                );
            });

        const timerOne =
            window.setTimeout(
                resetScroll,
                100
            );

        const timerTwo =
            window.setTimeout(
                resetScroll,
                350
            );

        const timerThree =
            window.setTimeout(
                resetScroll,
                800
            );

        return () => {
            window.cancelAnimationFrame(
                frameOne
            );

            window.cancelAnimationFrame(
                frameTwo
            );

            window.clearTimeout(timerOne);
            window.clearTimeout(timerTwo);
            window.clearTimeout(timerThree);
        };
    }, [
        topicId,
        loading,
        notFound,
    ]);

    /* TOPIC LOADED SCROLL RESET FINAL END */

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
        const supabase = createClient();

        let isActive = true;

        async function loadCurrentUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (isActive) {
                setCurrentUserId(user?.id ?? null);
                setAuthChecked(true);
            }
        }

        void loadCurrentUser();

        const { data: authListener } =
            supabase.auth.onAuthStateChange(
                (_event, session) => {
                    if (isActive) {
                        setCurrentUserId(
                            session?.user.id ?? null
                        );

                        setAuthChecked(true);
                    }
                }
            );

        return () => {
            isActive = false;

            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!authChecked) {
            return;
        }

        let isActive = true;

        async function loadTopic() {
            if (!topicId) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            setNotFound(false);

            const supabase = createClient();

            const { data, error } = await supabase
                .from("topics")
                .select(`
        id,
        author_id,
        title,
        content,
        created_at,
        comment_count,
        view_count,
        categories (
          slug,
          name,
          category_groups (
            slug,
            name
          )
        )
      `)
                .eq("id", topicId)
                .eq("status", "published")
                .maybeSingle();

            if (!isActive) {
                return;
            }

            if (error || !data) {
                console.error(
                    "Konu detayı alınamadı:",
                    error?.message
                );

                setTopic(null);
                setNotFound(true);
                setLoading(false);
                return;
            }

            let authorProfile:
                TopicDetailRow["profiles"] = null;

            /*
             * Oturum açmış aktif kullanıcılar
             * güvenli RPC üzerinden konu sahibini görür.
             * Oturum kapalı ziyaretçide profil null kalır.
             */
            if (currentUserId) {
                const {
                    data: profileData,
                    error: profileError,
                } = await supabase.rpc(
                    "get_topic_author_profiles",
                    {
                        p_topic_ids: [topicId],
                    }
                );

                if (!isActive) {
                    return;
                }

                if (profileError) {
                    console.error(
                        "Konu sahibi profili alınamadı:",
                        profileError.message
                    );
                } else {
                    const profile =
                        profileData?.[0];

                    if (profile) {
                        authorProfile = {
                            display_name:
                                profile.display_name,
                            username:
                                profile.username,
                        };
                    }
                }
            }

            setTopic({
                ...(data as unknown as Omit<
                    TopicDetailRow,
                    "profiles"
                >),
                profiles: authorProfile,
            });

            setLoading(false);
        }

        void loadTopic();

        return () => {
            isActive = false;
        };
    }, [
        topicId,
        authChecked,
        currentUserId,
    ]);

    useEffect(() => {
        if (!topicId) {
            return;
        }

        const viewSessionKey =
            `forumfenomen-topic-viewed-${topicId}`;

        if (
            window.sessionStorage.getItem(
                viewSessionKey
            )
        ) {
            return;
        }

        window.sessionStorage.setItem(
            viewSessionKey,
            "true"
        );

        async function recordTopicView() {
            try {
                const response = await fetch(
                    `/api/topics/${topicId}/view`,
                    {
                        method: "POST",
                        credentials: "same-origin",
                        cache: "no-store",
                        keepalive: true,
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `VIEW_COUNTER_${response.status}`
                    );
                }

                const result =
                    (await response.json()) as {
                        viewCount?: unknown;
                    };

                const nextViewCount =
                    Number(result.viewCount);

                if (
                    !Number.isFinite(
                        nextViewCount
                    )
                ) {
                    throw new Error(
                        "INVALID_VIEW_COUNT"
                    );
                }

                setTopic((current) =>
                    current
                        ? {
                            ...current,
                            view_count:
                                nextViewCount,
                        }
                        : current
                );
            } catch (error) {
                console.error(
                    "Konu görüntülenmesi artırılamadı:",
                    error
                );

                window.sessionStorage.removeItem(
                    viewSessionKey
                );
            }
        }

        void recordTopicView();
    }, [topicId]);

    useEffect(() => {
        let isActive = true;

        async function loadTopicActions() {
            if (!topicId) {
                return;
            }

            const supabase = createClient();

            const saveCountResult = await supabase.rpc(
                "get_topic_save_count",
                {
                    p_topic_id: topicId,
                }
            );

            const reactionSummaryResult =
                await supabase.rpc(
                    "get_topic_reaction_summary",
                    {
                        p_topic_id: topicId,
                    }
                );

            if (!isActive) {
                return;
            }

            if (saveCountResult.error) {
                console.error(
                    "Konu kaydetme sayısı alınamadı:",
                    saveCountResult.error.message
                );
            } else {
                const nextSaveCount = Number(
                    saveCountResult.data
                );

                setTopicSaveCount(
                    Number.isFinite(nextSaveCount)
                        ? nextSaveCount
                        : 0
                );
            }

            if (reactionSummaryResult.error) {
                console.error(
                    "Konu tepki ?zeti al?namad?:",
                    reactionSummaryResult.error.message
                );

                setTopicLikeCount(0);
                setTopicDislikeCount(0);
                setTopicReaction(0);
            } else {
                const summary =
                    reactionSummaryResult.data?.[0];

                const nextLikeCount = Number(
                    summary?.like_count ?? 0
                );

                const nextDislikeCount = Number(
                    summary?.dislike_count ?? 0
                );

                const nextUserReaction = Number(
                    summary?.user_reaction ?? 0
                );

                setTopicLikeCount(
                    Number.isFinite(nextLikeCount)
                        ? nextLikeCount
                        : 0
                );

                setTopicDislikeCount(
                    Number.isFinite(nextDislikeCount)
                        ? nextDislikeCount
                        : 0
                );

                setTopicReaction(
                    nextUserReaction === 1
                        ? 1
                        : nextUserReaction === -1
                            ? -1
                            : 0
                );
            }

            if (!currentUserId) {
                setTopicReaction(0);
                setTopicSaved(false);
                setTopicReported(false);
                return;
            }

            const [
                savedResult,
                reportedResult,
            ] = await Promise.all([
                supabase
                    .from("saved_topics")
                    .select("topic_id")
                    .eq("topic_id", topicId)
                    .eq("user_id", currentUserId)
                    .maybeSingle(),

                supabase
                    .from("topic_reports")
                    .select("id")
                    .eq("topic_id", topicId)
                    .eq("reporter_id", currentUserId)
                    .maybeSingle(),
            ]);

            if (!isActive) {
                return;
            }

            setTopicSaved(Boolean(savedResult.data));
            setTopicReported(Boolean(reportedResult.data));
        }

        void loadTopicActions();

        return () => {
            isActive = false;
        };
    }, [topicId, currentUserId]);

    useEffect(() => {
        if (!authChecked) {
            return;
        }

        let isActive = true;

        async function loadComments() {
            if (!topicId) {
                setComments([]);
                setCommentsLoading(false);
                return;
            }

            setCommentsLoading(true);

            const supabase = createClient();

            const { data, error } = await supabase
                .from("topic_comments")
                .select(`
        id,
        author_id,
        content,
        created_at,
        parent_comment_id,
        like_count,
        dislike_count
    `)
                .eq("topic_id", topicId)
                .eq("status", "published")
                .order("created_at", {
                    ascending: true,
                });

            if (!isActive) {
                return;
            }

            if (error) {
                console.error(
                    "Yorumlar alınamadı:",
                    error.message
                );

                setComments([]);
                setCommentsLoading(false);
                return;
            }

            const commentRows =
                (data ?? []) as Omit<
                    CommentRow,
                    "profiles"
                >[];

            type CommentAuthorProfile = {
                id: string;
                display_name: string | null;
                username: string | null;
                avatar_url: string | null;
            };

            let profileRows:
                CommentAuthorProfile[] = [];

            /*
             * Oturum kapalı ziyaretçiye profil bilgisi
             * gönderilmez. Yorum sahipleri
             * "ForumFenomen Üyesi" olarak görünür.
             */
            if (currentUserId) {
                const {
                    data: profileData,
                    error: profileError,
                } = await supabase.rpc(
                    "get_topic_comment_author_profiles",
                    {
                        p_topic_id: topicId,
                    }
                );

                if (!isActive) {
                    return;
                }

                if (profileError) {
                    console.error(
                        "Yorum profilleri alınamadı:",
                        profileError.message
                    );
                } else {
                    profileRows =
                        (profileData ??
                            []) as CommentAuthorProfile[];
                }
            }

            const profileMap = new Map<
                string,
                CommentRow["profiles"]
            >(
                profileRows.map((profile) => [
                    profile.id,
                    {
                        display_name:
                            profile.display_name,
                        username:
                            profile.username,
                        avatar_url:
                            profile.avatar_url,
                    },
                ])
            );

            setComments(
                commentRows.map((comment) => ({
                    ...comment,
                    profiles:
                        profileMap.get(
                            comment.author_id
                        ) ?? null,
                }))
            );

            setCommentsLoading(false);
        }

        void loadComments();

        return () => {
            isActive = false;
        };
    }, [
        topicId,
        authChecked,
        currentUserId,
    ]);

    useEffect(() => {
        let isActive = true;

        async function loadUserReactions() {
            if (!currentUserId) {
                setCommentReactions({});
                return;
            }

            const supabase = createClient();

            const { data, error } = await supabase
                .from("comment_reactions")
                .select(`
        comment_id,
        reaction
      `)
                .eq("user_id", currentUserId);

            if (!isActive) {
                return;
            }

            if (error) {
                console.error(
                    "Yorum tepkileri alınamadı:",
                    error.message
                );

                setCommentReactions({});
                return;
            }

            const nextReactions: Record<
                string,
                ReactionValue
            > = {};

            for (const item of data ?? []) {
                nextReactions[item.comment_id] =
                    item.reaction === 1
                        ? 1
                        : item.reaction === -1
                            ? -1
                            : 0;
            }

            setCommentReactions(nextReactions);
        }

        void loadUserReactions();

        return () => {
            isActive = false;
        };
    }, [currentUserId]);

    useEffect(() => {
        let isActive = true;

        async function loadReportedComments() {
            if (!currentUserId) {
                setReportedCommentIds({});
                return;
            }

            const supabase = createClient();

            const { data, error } = await supabase
                .from("comment_reports")
                .select("comment_id")
                .eq("reporter_id", currentUserId);

            if (!isActive) {
                return;
            }

            if (error) {
                console.error(
                    "Şikâyet kayıtları alınamadı:",
                    error.message
                );

                setReportedCommentIds({});
                return;
            }

            const nextReportedComments: Record<
                string,
                boolean
            > = {};

            for (const item of data ?? []) {
                nextReportedComments[item.comment_id] =
                    true;
            }

            setReportedCommentIds(
                nextReportedComments
            );
        }

        void loadReportedComments();

        return () => {
            isActive = false;
        };
    }, [currentUserId]);

    useEffect(() => {
        if (commentsLoading) {
            return;
        }

        function focusCommentFromHash() {
            const hash = window.location.hash;
            const prefix = "#comment-";

            if (!hash.startsWith(prefix)) {
                return;
            }

            const commentId = hash.slice(
                prefix.length
            );

            if (!commentId) {
                return;
            }

            const target =
                document.getElementById(
                    `comment-${commentId}`
                );

            if (!target) {
                return;
            }

            if (
                highlightTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    highlightTimeoutRef.current
                );
            }

            setHighlightedCommentId(commentId);

            window.requestAnimationFrame(() => {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            });

            highlightTimeoutRef.current =
                window.setTimeout(() => {
                    setHighlightedCommentId(
                        (current) =>
                            current === commentId
                                ? null
                                : current
                    );

                    highlightTimeoutRef.current =
                        null;
                }, 3500);
        }

        const initialTimerId =
            window.setTimeout(
                focusCommentFromHash,
                50
            );

        window.addEventListener(
            "hashchange",
            focusCommentFromHash
        );

        return () => {
            window.clearTimeout(initialTimerId);

            window.removeEventListener(
                "hashchange",
                focusCommentFromHash
            );

            if (
                highlightTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    highlightTimeoutRef.current
                );

                highlightTimeoutRef.current =
                    null;
            }
        };
    }, [commentsLoading, topicId]);

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

    function getCommentAuthor(
        comment: CommentRow
    ) {
        return (
            comment.profiles?.display_name?.trim() ||
            comment.profiles?.username
                ?.replace(/^@/, "")
                .trim() ||
            (language === "tr"
                ? "ForumFenomen Üyesi"
                : "ForumFenomen Member")
        );
    }

    function getCommentProfileHref(
        comment: CommentRow
    ) {
        const username =
            comment.profiles?.username
                ?.replace(/^@/, "")
                .trim();

        return username
            ? `/profil/${encodeURIComponent(username)}`
            : null;
    }

    function formatCommentDate(value: string) {
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
            }
        ).format(date);
    }

    function startReply(comment: CommentRow) {
        setReplyingTo(comment);
        setCommentMessage(null);

        window.setTimeout(() => {
            const input = commentInputRef.current;

            if (!input) {
                return;
            }

            const commentForm =
                input.closest("form") ?? input;

            const top =
                commentForm.getBoundingClientRect().top +
                window.scrollY -
                150;

            window.scrollTo({
                top: Math.max(top, 0),
                behavior: "smooth",
            });

            window.setTimeout(() => {
                input.focus({
                    preventScroll: true,
                });
            }, 500);
        }, 120);
    }

    async function handleTopicReaction(
        reaction: 1 | -1
    ) {
        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (!topicId || topicReactionLoading) {
            return;
        }

        setTopicReactionLoading(true);

        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .rpc("toggle_topic_reaction", {
                    p_topic_id: topicId,
                    p_reaction: reaction,
                })
                .single();

            if (error || !data) {
                console.error(
                    "Konu tepkisi kaydedilemedi:",
                    error?.message
                );

                window.alert(
                    language === "tr"
                        ? "İşlem gerçekleştirilemedi."
                        : "The action could not be completed."
                );

                return;
            }

            const result =
                data as unknown as ReactionResult;

            setTopicLikeCount(
                Number(result.like_count ?? 0)
            );

            setTopicDislikeCount(
                Number(result.dislike_count ?? 0)
            );

            setTopicReaction(
                result.user_reaction === 1
                    ? 1
                    : result.user_reaction === -1
                        ? -1
                        : 0
            );
        } catch (error) {
            console.error(
                "Beklenmeyen konu tepki hatası:",
                error
            );
        } finally {
            setTopicReactionLoading(false);
        }
    }

    async function handleTopicSave() {
        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (!topicId || topicSaveLoading) {
            return;
        }

        setTopicSaveLoading(true);

        try {
            const supabase = createClient();

            const { data, error } =
                await supabase.rpc(
                    "toggle_saved_topic",
                    {
                        p_topic_id: topicId,
                    }
                );

            if (error) {
                console.error(
                    "Konu kaydedilemedi:",
                    error.message
                );

                window.alert(
                    language === "tr"
                        ? "Kaydetme işlemi gerçekleştirilemedi."
                        : "The save action could not be completed."
                );

                return;
            }

            const nextSaved = data === true;

            setTopicSaved(nextSaved);

            setTopicSaveCount((current) =>
                nextSaved
                    ? current + 1
                    : Math.max(0, current - 1)
            );
        } catch (error) {
            console.error(
                "Beklenmeyen kaydetme hatası:",
                error
            );
        } finally {
            setTopicSaveLoading(false);
        }
    }

    function openTopicReportModal() {
        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (
            !topic ||
            currentUserId === topic.author_id ||
            topicReported
        ) {
            return;
        }

        setTopicReportOpen(true);
        setTopicReportCompleted(false);
        setReportReason("");
        setReportDetails("");
        setReportMessage(null);
    }

    function closeTopicReportModal() {
        if (topicReportLoading) {
            return;
        }

        setTopicReportOpen(false);
        setTopicReportCompleted(false);
        setReportReason("");
        setReportDetails("");
        setReportMessage(null);
    }

    async function handleTopicReport() {
        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (
            !topicId ||
            !reportReason ||
            topicReportLoading
        ) {
            if (!reportReason) {
                setReportMessage("reason");
            }

            return;
        }

        setTopicReportLoading(true);
        setReportMessage(null);

        try {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "submit_topic_report",
                {
                    p_topic_id: topicId,
                    p_reason: reportReason,
                    p_details:
                        reportDetails.trim() || null,
                }
            );

            if (error) {
                console.error(
                    "Konu şikâyet edilemedi:",
                    error.message
                );

                if (
                    error.message.includes(
                        "REPORT_ALREADY_EXISTS"
                    )
                ) {
                    setTopicReported(true);
                    setTopicReportCompleted(true);
                    return;
                }

                setReportMessage("error");
                return;
            }

            setTopicReported(true);
            setTopicReportCompleted(true);
        } catch (error) {
            console.error(
                "Beklenmeyen konu şikâyeti hatası:",
                error
            );

            setReportMessage("error");
        } finally {
            setTopicReportLoading(false);
        }
    }

    async function handleCommentReaction(
        commentId: string,
        reaction: 1 | -1
    ) {
        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (reactionLoadingId === commentId) {
            return;
        }

        setReactionLoadingId(commentId);

        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .rpc("toggle_comment_reaction", {
                    p_comment_id: commentId,
                    p_reaction: reaction,
                })
                .single();

            if (error || !data) {
                console.error(
                    "Yorum tepkisi kaydedilemedi:",
                    error?.message
                );

                window.alert(
                    language === "tr"
                        ? "İşlem gerçekleştirilemedi. Lütfen tekrar dene."
                        : "The action could not be completed. Please try again."
                );

                return;
            }

            const result =
                data as unknown as ReactionResult;

            const nextReaction: ReactionValue =
                result.user_reaction === 1
                    ? 1
                    : result.user_reaction === -1
                        ? -1
                        : 0;

            setComments((current) =>
                current.map((comment) =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            like_count:
                                result.like_count ?? 0,
                            dislike_count:
                                result.dislike_count ?? 0,
                        }
                        : comment
                )
            );

            setCommentReactions((current) => ({
                ...current,
                [commentId]: nextReaction,
            }));
        } catch (error) {
            console.error(
                "Beklenmeyen tepki hatası:",
                error
            );

            window.alert(
                language === "tr"
                    ? "İşlem gerçekleştirilemedi. Lütfen tekrar dene."
                    : "The action could not be completed. Please try again."
            );
        } finally {
            setReactionLoadingId(null);
        }
    }

    function openReportModal(
        comment: CommentRow
    ) {
        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (
            currentUserId === comment.author_id ||
            reportedCommentIds[comment.id]
        ) {
            return;
        }

        setReportModalComment(comment);
        setReportReason("");
        setReportDetails("");
        setReportMessage(null);
        setReportCompleted(false);
    }

    function closeReportModal() {
        if (reportLoadingId) {
            return;
        }

        setReportModalComment(null);
        setReportReason("");
        setReportDetails("");
        setReportMessage(null);
        setReportCompleted(false);
    }

    async function handleReportComment() {
        const comment = reportModalComment;

        if (!comment) {
            return;
        }

        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (!reportReason) {
            setReportMessage("reason");
            return;
        }

        if (reportLoadingId === comment.id) {
            return;
        }

        setReportLoadingId(comment.id);
        setReportMessage(null);

        try {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "submit_comment_report",
                {
                    p_comment_id: comment.id,
                    p_reason: reportReason,
                    p_details:
                        reportDetails.trim() ||
                        null,
                }
            );

            if (error) {
                console.error(
                    "Yorum şikâyet edilemedi:",
                    error.message
                );

                setReportMessage("error");
                return;
            }

            setReportedCommentIds((current) => ({
                ...current,
                [comment.id]: true,
            }));

            setReportCompleted(true);
        } catch (error) {
            console.error(
                "Beklenmeyen şikâyet hatası:",
                error
            );

            setReportMessage("error");
        } finally {
            setReportLoadingId(null);
        }
    }

    async function handleRemoveComment(
        comment: CommentRow
    ) {
        if (!currentUserId) {
            router.push("/giris");
            return;
        }

        if (currentUserId !== comment.author_id) {
            window.alert(
                language === "tr"
                    ? "Yalnızca kendi yorumunu kaldırabilirsin."
                    : "You can only remove your own comment."
            );

            return;
        }


        if (removeLoadingId === comment.id) {
            return;
        }

        setRemoveLoadingId(comment.id);

        try {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "soft_delete_comment",
                {
                    p_comment_id: comment.id,
                }
            );

            if (error) {
                console.error(
                    "Yorum kaldırılamadı:",
                    error.message
                );

                window.alert(
                    language === "tr"
                        ? "Yorum kaldırılamadı. Lütfen tekrar dene."
                        : "The comment could not be removed. Please try again."
                );

                return;
            }

            setComments((current) =>
                current.filter(
                    (currentComment) =>
                        currentComment.id !== comment.id
                )
            );

            setTopic((current) =>
                current
                    ? {
                        ...current,
                        comment_count: Math.max(
                            (current.comment_count ?? 0) - 1,
                            0
                        ),
                    }
                    : current
            );

            setCommentReactions((current) => {
                const next = { ...current };
                delete next[comment.id];
                return next;
            });

            if (replyingTo?.id === comment.id) {
                setReplyingTo(null);
            }
        } catch (error) {
            console.error(
                "Beklenmeyen yorum kaldırma hatası:",
                error
            );

            window.alert(
                language === "tr"
                    ? "Yorum kaldırılamadı. Lütfen tekrar dene."
                    : "The comment could not be removed. Please try again."
            );
        } finally {
            setRemoveLoadingId(null);
        }
    }


    async function handleCommentSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const normalizedComment =
            commentText.trim();

        if (
            !normalizedComment ||
            normalizedComment.length > 2000 ||
            commentSubmitting
        ) {
            return;
        }

        setCommentSubmitting(true);
        setCommentMessage(null);

        try {
            const supabase = createClient();

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setCommentMessage("login");
                return;
            }

            const { data, error } = await supabase
                .from("topic_comments")
                .insert({
                    topic_id: topicId,
                    author_id: user.id,
                    parent_comment_id:
                        replyingTo?.id ?? null,
                    content: normalizedComment,
                    status: "published",
                })
                .select(`
    id,
    author_id,
    content,
    created_at,
    parent_comment_id,
    like_count,
    dislike_count
`)
                .single();

            if (error || !data) {
                console.error(
                    "Yorum eklenemedi:",
                    error?.message
                );

                setCommentMessage("error");
                return;
            }

            const insertedComment =
                data as Omit<CommentRow, "profiles">;

            const {
                data: authorProfiles,
                error: authorProfileError,
            } = await supabase.rpc(
                "get_topic_comment_author_profiles",
                {
                    p_topic_id: topicId,
                }
            );

            if (authorProfileError) {
                console.error(
                    "Yeni yorumun yazarı alınamadı:",
                    authorProfileError.message
                );
            }

            type CommentAuthorProfile = {
                id: string;
                display_name: string | null;
                username: string | null;
                avatar_url: string | null;
            };

            const typedAuthorProfiles =
                (authorProfiles ?? []) as CommentAuthorProfile[];

            const authorProfile =
                typedAuthorProfiles.find(
                    (profile) =>
                        profile.id ===
                        insertedComment.author_id
                ) ?? null;

            const newComment: CommentRow = {
                ...insertedComment,
                profiles: authorProfile
                    ? {
                        display_name:
                            authorProfile.display_name,
                        username:
                            authorProfile.username,
                        avatar_url:
                            authorProfile.avatar_url,
                    }
                    : null,
            };

            setComments((current) => [
                ...current,
                newComment,
            ]);

            setTopic((current) =>
                current
                    ? {
                        ...current,
                        comment_count:
                            (current.comment_count ?? 0) + 1,
                    }
                    : current
            );

            setCommentText("");
            setReplyingTo(null);

            setHighlightedCommentId(
                newComment.id
            );

            window.setTimeout(() => {
                const target =
                    document.getElementById(
                        `comment-${newComment.id}`
                    );

                if (!target) {
                    return;
                }

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

                if (
                    highlightTimeoutRef.current !== null
                ) {
                    window.clearTimeout(
                        highlightTimeoutRef.current
                    );
                }

                highlightTimeoutRef.current =
                    window.setTimeout(() => {
                        setHighlightedCommentId(
                            (current) =>
                                current === newComment.id
                                    ? null
                                    : current
                        );

                        highlightTimeoutRef.current =
                            null;
                    }, 3500);
            }, 100);

        } catch (error) {
            console.error(
                "Beklenmeyen yorum hatası:",
                error
            );

            setCommentMessage("error");
        } finally {
            setCommentSubmitting(false);
        }
    }

    const author =
        topic?.profiles?.display_name?.trim() ||
        topic?.profiles?.username
            ?.replace(/^@/, "")
            .trim() ||
        (language === "tr"
            ? "ForumFenomen Üyesi"
            : "ForumFenomen Member");


    const topicAuthorUsername =
        topic?.profiles?.username
            ?.replace(/^@/, "")
            .trim() || null;

    const topicAuthorProfileHref =
        topicAuthorUsername
            ? `/profil/${encodeURIComponent(
                topicAuthorUsername
            )}`
            : null;

    const formattedDate = topic
        ? new Intl.DateTimeFormat(
            language === "tr"
                ? "tr-TR"
                : "en-US",
            {
                dateStyle: "long",
                timeStyle: "short",
            }
        ).format(
            new Date(topic.created_at)
        )
        : "";

    const commentMap = new Map(
        comments.map((comment) => [
            comment.id,
            comment,
        ])
    );

    const childCommentsMap = new Map<
        string,
        CommentRow[]
    >();

    for (const comment of comments) {
        if (!comment.parent_comment_id) {
            continue;
        }

        const currentChildren =
            childCommentsMap.get(
                comment.parent_comment_id
            ) ?? [];

        currentChildren.push(comment);

        childCommentsMap.set(
            comment.parent_comment_id,
            currentChildren
        );
    }

    const rootComments = comments.filter(
        (comment) =>
            !comment.parent_comment_id ||
            !commentMap.has(comment.parent_comment_id)
    );

    const orderedComments: CommentRow[] = [];

    const commentDepthMap = new Map<
        string,
        number
    >();

    function collectCommentBranch(
        comment: CommentRow,
        depth: number
    ) {
        orderedComments.push(comment);

        commentDepthMap.set(
            comment.id,
            depth
        );

        const children =
            childCommentsMap.get(comment.id) ?? [];

        for (const childComment of children) {
            collectCommentBranch(
                childComment,
                depth + 1
            );
        }
    }

    for (const rootComment of rootComments) {
        collectCommentBranch(rootComment, 0);
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

                        <SiteSearch language={language} />
                    </div>
                </header>

                <Link
                    href="/akis"
                    className={styles.backLink}
                >
                    <ArrowLeftIcon />

                    {language === "tr"
                        ? "Akışa geri dön"
                        : "Return to feed"}
                </Link>

                {loading && (
                    <section className={styles.stateCard}>
                        <span className={styles.loader} />

                        <p>
                            {language === "tr"
                                ? "Konu yükleniyor..."
                                : "Loading topic..."}
                        </p>
                    </section>
                )}

                {!loading && notFound && (
                    <section className={styles.stateCard}>
                        <h1>
                            {language === "tr"
                                ? "Konu bulunamadı"
                                : "Topic not found"}
                        </h1>

                        <p>
                            {language === "tr"
                                ? "Bu konu kaldırılmış, gizlenmiş veya artık yayında olmayabilir."
                                : "This topic may have been removed, hidden or unpublished."}
                        </p>

                        <Link href="/akis">
                            {language === "tr"
                                ? "Akışa Git"
                                : "Go to Feed"}
                        </Link>
                    </section>
                )}

                {!loading && topic && (
                    <>
                        <article className={styles.topicCard}>
                            <div className={styles.topicTop}>
                                {topic.categories ? (
                                    <Link
                                        href={`/kategoriler?group=${encodeURIComponent(
                                            topic.categories.category_groups?.slug ?? ""
                                        )}&category=${encodeURIComponent(
                                            topic.categories.slug
                                        )}&focus=category`}
                                        className={styles.categoryBadge}
                                    >
                                        {topic.categories.name}
                                    </Link>
                                ) : (
                                    <span className={styles.categoryBadge}>
                                        {language === "tr" ? "Genel" : "General"}
                                    </span>
                                )}

                                <div className={styles.topicMeta}>
                                    <span className={styles.date}>
                                        {formattedDate}
                                    </span>

                                    <div className={styles.stats}>
                                        <span>
                                            <MessageIcon />
                                            {topic.comment_count ?? 0}
                                        </span>

                                        <span>
                                            <EyeIcon />
                                            {topic.view_count ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h1>{topic.title}</h1>

                            <div className={styles.authorRow}>
                                {topicAuthorProfileHref ? (
                                    <Link
                                        href={topicAuthorProfileHref}
                                        className={styles.topicAuthorLink}
                                        aria-label={
                                            language === "tr"
                                                ? `${author} profilini aç`
                                                : `Open ${author}'s profile`
                                        }
                                    >
                                        <span className={styles.avatar}>
                                            {author
                                                .slice(0, 1)
                                                .toLocaleUpperCase(
                                                    language === "tr"
                                                        ? "tr-TR"
                                                        : "en-US"
                                                )}
                                        </span>

                                        <span className={styles.topicAuthorText}>
                                            <strong>{author}</strong>

                                            <small>
                                                {topic.categories
                                                    ?.category_groups?.name ??
                                                    "ForumFenomen"}
                                            </small>
                                        </span>
                                    </Link>
                                ) : (
                                    <div className={styles.topicAuthorFallback}>
                                        <span className={styles.avatar}>
                                            {author
                                                .slice(0, 1)
                                                .toLocaleUpperCase(
                                                    language === "tr"
                                                        ? "tr-TR"
                                                        : "en-US"
                                                )}
                                        </span>

                                        <span className={styles.topicAuthorText}>
                                            <strong>{author}</strong>

                                            <small>
                                                {topic.categories
                                                    ?.category_groups?.name ??
                                                    "ForumFenomen"}
                                            </small>
                                        </span>
                                    </div>
                                )}

                                <div className={styles.topicActions}>
                                    <button
                                        type="button"
                                        className={`${styles.commentAction} ${topicReaction === 1
                                            ? styles.likeActive
                                            : ""
                                            }`}
                                        onClick={() => {
                                            void handleTopicReaction(1);
                                        }}
                                        disabled={topicReactionLoading}
                                        aria-pressed={topicReaction === 1}
                                        aria-label={
                                            language === "tr"
                                                ? "Konuyu beğen"
                                                : "Like topic"
                                        }
                                        title={
                                            language === "tr"
                                                ? "Beğen"
                                                : "Like"
                                        }
                                    >
                                        <LikeIcon />

                                        {topicLikeCount > 0 && (
                                            <small className={styles.actionCount}>
                                                {topicLikeCount}
                                            </small>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className={`${styles.commentAction} ${topicReaction === -1
                                            ? styles.dislikeActive
                                            : ""
                                            }`}
                                        onClick={() => {
                                            void handleTopicReaction(-1);
                                        }}
                                        disabled={topicReactionLoading}
                                        aria-pressed={topicReaction === -1}
                                        aria-label={
                                            language === "tr"
                                                ? "Konuyu beğenme"
                                                : "Dislike topic"
                                        }
                                        title={
                                            language === "tr"
                                                ? "Beğenme"
                                                : "Dislike"
                                        }
                                    >
                                        <DislikeIcon />

                                        {topicDislikeCount > 0 && (
                                            <small className={styles.actionCount}>
                                                {topicDislikeCount}
                                            </small>
                                        )}
                                    </button>

                                    {currentUserId !== topic.author_id && (
                                        <button
                                            type="button"
                                            className={`${styles.commentAction} ${styles.topicReportAction
                                                } ${topicReported
                                                    ? styles.reportedAction
                                                    : ""
                                                }`}
                                            onClick={openTopicReportModal}
                                            disabled={
                                                topicReported ||
                                                topicReportLoading
                                            }
                                            aria-pressed={topicReported}
                                            aria-label={
                                                topicReported
                                                    ? language === "tr"
                                                        ? "Konu şikâyet edildi"
                                                        : "Topic reported"
                                                    : language === "tr"
                                                        ? "Konuyu şikâyet et"
                                                        : "Report topic"
                                            }
                                            title={
                                                topicReported
                                                    ? language === "tr"
                                                        ? "Şikâyet Edildi"
                                                        : "Reported"
                                                    : language === "tr"
                                                        ? "Şikâyet Et"
                                                        : "Report"
                                            }
                                        >
                                            <ReportIcon />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className={`${styles.commentAction} ${topicSaved
                                            ? styles.savedTopicAction
                                            : ""
                                            }`}
                                        onClick={() => {
                                            void handleTopicSave();
                                        }}
                                        disabled={topicSaveLoading}
                                        aria-pressed={topicSaved}
                                        aria-label={
                                            topicSaved
                                                ? language === "tr"
                                                    ? "Konuyu kayıttan kaldır"
                                                    : "Remove saved topic"
                                                : language === "tr"
                                                    ? "Konuyu kaydet"
                                                    : "Save topic"
                                        }
                                        title={
                                            topicSaved
                                                ? language === "tr"
                                                    ? "Kaydedildi"
                                                    : "Saved"
                                                : language === "tr"
                                                    ? "Kaydet"
                                                    : "Save"
                                        }
                                    >
                                        <BookmarkIcon />

                                        {topicSaveCount > 0 && (
                                            <span className={styles.actionCount}>
                                                {topicSaveCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {!authChecked ? (
                                <div className={styles.guestContentGate}>
                                    <span className={styles.guestGateLoader} />

                                    <p>
                                        {language === "tr"
                                            ? "Oturum kontrol ediliyor..."
                                            : "Checking session..."}
                                    </p>
                                </div>
                            ) : currentUserId ? (
                                <div
                                    className={styles.content}
                                    dangerouslySetInnerHTML={{
                                        __html: topic.content,
                                    }}
                                />
                            ) : (
                                <div className={styles.guestContentGate}>
                                    <div className={styles.guestGateIcon}>
                                        <BookmarkIcon />
                                    </div>

                                    <h2>
                                        {language === "tr"
                                            ? "Bu içeriğin devamı üyelere özel"
                                            : "The rest of this content is for members"}
                                    </h2>

                                    <p>
                                        {language === "tr"
                                            ? "Konunun tamamını ve topluluk yorumlarını görmek için hesabına giriş yap."
                                            : "Sign in to read the full topic and community comments."}
                                    </p>

                                    <Link
                                        href="/giris"
                                        className={styles.guestGateButton}
                                    >
                                        {language === "tr"
                                            ? "Üye Ol / Giriş Yap"
                                            : "Join / Sign In"}
                                    </Link>
                                </div>
                            )}
                        </article>

                        {authChecked && currentUserId && (
                            <section className={styles.commentsCard}>
                                <div className={styles.commentsHeader}>
                                    <div>
                                        <span>
                                            {language === "tr"
                                                ? "TOPLULUK"
                                                : "COMMUNITY"}
                                        </span>

                                        <h2>
                                            {language === "tr"
                                                ? `Yorumlar (${topic.comment_count ?? 0})`
                                                : `Comments (${topic.comment_count ?? 0})`}
                                        </h2>
                                    </div>
                                </div>

                                <form
                                    className={styles.commentForm}
                                    onSubmit={handleCommentSubmit}
                                >
                                    {replyingTo && (
                                        <div className={styles.replyingBox}>
                                            <div>
                                                <span>
                                                    {language === "tr"
                                                        ? "YANITLANIYOR"
                                                        : "REPLYING TO"}
                                                </span>

                                                <strong>
                                                    {getCommentAuthor(replyingTo)}
                                                </strong>

                                                <p>
                                                    {replyingTo.content.length > 160
                                                        ? `${replyingTo.content.slice(
                                                            0,
                                                            160
                                                        )}…`
                                                        : replyingTo.content}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setReplyingTo(null)}
                                                aria-label={
                                                    language === "tr"
                                                        ? "Yanıtlamayı iptal et"
                                                        : "Cancel reply"
                                                }
                                            >
                                                ×
                                            </button>



                                        </div>
                                    )}

                                    <textarea
                                        ref={commentInputRef}
                                        value={commentText}
                                        maxLength={2000}
                                        onChange={(event) => {
                                            setCommentText(event.target.value);
                                            setCommentMessage(null);
                                        }}
                                        placeholder={
                                            replyingTo
                                                ? language === "tr"
                                                    ? `${getCommentAuthor(
                                                        replyingTo
                                                    )} kullanıcısına yanıt yaz...`
                                                    : `Reply to ${getCommentAuthor(
                                                        replyingTo
                                                    )}...`
                                                : language === "tr"
                                                    ? "Bu konu hakkında fikrini paylaş..."
                                                    : "Share your thoughts about this topic..."
                                        }
                                    />

                                    <div className={styles.commentFormFooter}>
                                        <span>
                                            {commentText.length}/2000
                                        </span>

                                        <button
                                            type="submit"
                                            disabled={
                                                !commentText.trim() ||
                                                commentSubmitting
                                            }
                                        >
                                            {commentSubmitting
                                                ? language === "tr"
                                                    ? "Gönderiliyor..."
                                                    : "Posting..."
                                                : replyingTo
                                                    ? language === "tr"
                                                        ? "Yanıtı Gönder"
                                                        : "Post Reply"
                                                    : language === "tr"
                                                        ? "Yorum Yap"
                                                        : "Post Comment"}
                                        </button>
                                    </div>

                                    {commentMessage === "login" && (
                                        <p className={styles.commentFeedback}>
                                            {language === "tr"
                                                ? "Yorum yapmak için giriş yapmalısın. "
                                                : "You must sign in to comment. "}

                                            <Link href="/giris">
                                                {language === "tr"
                                                    ? "Giriş yap"
                                                    : "Sign in"}
                                            </Link>
                                        </p>
                                    )}

                                    {commentMessage === "error" && (
                                        <p className={styles.commentFeedback}>
                                            {language === "tr"
                                                ? "Yorum gönderilemedi. Lütfen tekrar dene."
                                                : "The comment could not be posted. Please try again."}
                                        </p>
                                    )}
                                </form>

                                <div className={styles.commentsList}>
                                    {commentsLoading ? (
                                        <div className={styles.commentState}>
                                            <span className={styles.loader} />

                                            <p>
                                                {language === "tr"
                                                    ? "Yorumlar yükleniyor..."
                                                    : "Loading comments..."}
                                            </p>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className={styles.commentState}>
                                            <MessageIcon />

                                            <p>
                                                {language === "tr"
                                                    ? "Henüz yorum yapılmamış. İlk yorumu sen yap."
                                                    : "There are no comments yet. Be the first to comment."}
                                            </p>
                                        </div>
                                    ) : (
                                        orderedComments.map((comment) => {

                                            const commentDepth =
                                                commentDepthMap.get(comment.id) ?? 0;

                                            const commentAuthor =
                                                getCommentAuthor(comment);

                                            return (
                                                <article
                                                    id={`comment-${comment.id}`}
                                                    key={comment.id}
                                                    style={{
                                                        marginLeft: `${Math.min(
                                                            commentDepth,
                                                            4
                                                        ) * 18}px`,
                                                    }}
                                                    className={[
                                                        styles.commentItem,
                                                        commentDepth > 0
                                                            ? styles.commentReply
                                                            : "",
                                                        highlightedCommentId ===
                                                            comment.id
                                                            ? styles.highlightedComment
                                                            : "",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                >
                                                    <div className={styles.commentHeader}>
                                                        {getCommentProfileHref(comment) ? (
                                                            <Link
                                                                href={getCommentProfileHref(comment)!}
                                                                className={styles.commentAuthorLink}
                                                                aria-label={
                                                                    language === "tr"
                                                                        ? `${commentAuthor} profilini aç`
                                                                        : `Open ${commentAuthor}'s profile`
                                                                }
                                                            >
                                                                <span className={styles.commentAvatar}>
                                                                    {comment.profiles?.avatar_url ? (
                                                                        <img
                                                                            src={comment.profiles.avatar_url}
                                                                            alt=""
                                                                        />
                                                                    ) : (
                                                                        commentAuthor
                                                                            .slice(0, 1)
                                                                            .toLocaleUpperCase(
                                                                                language === "tr"
                                                                                    ? "tr-TR"
                                                                                    : "en-US"
                                                                            )
                                                                    )}
                                                                </span>

                                                                <span
                                                                    className={
                                                                        styles.commentAuthorText
                                                                    }
                                                                >
                                                                    <strong>
                                                                        {commentAuthor}
                                                                    </strong>

                                                                    {comment.profiles?.username ? (
                                                                        <span>
                                                                            @
                                                                            {comment.profiles.username.replace(
                                                                                /^@/,
                                                                                ""
                                                                            )}
                                                                        </span>
                                                                    ) : null}
                                                                </span>
                                                            </Link>
                                                        ) : (
                                                            <div
                                                                className={
                                                                    styles.commentAuthorFallback
                                                                }
                                                            >
                                                                <span className={styles.commentAvatar}>
                                                                    {comment.profiles?.avatar_url ? (
                                                                        <img
                                                                            src={comment.profiles.avatar_url}
                                                                            alt=""
                                                                        />
                                                                    ) : (
                                                                        commentAuthor
                                                                            .slice(0, 1)
                                                                            .toLocaleUpperCase(
                                                                                language === "tr"
                                                                                    ? "tr-TR"
                                                                                    : "en-US"
                                                                            )
                                                                    )}
                                                                </span>

                                                                <strong>{commentAuthor}</strong>
                                                            </div>
                                                        )}

                                                        <small className={styles.commentDate}>
                                                            {formatCommentDate(
                                                                comment.created_at
                                                            )}
                                                        </small>
                                                    </div>


                                                    <p className={styles.commentContent}>
                                                        {comment.content}
                                                    </p>

                                                    <div className={styles.commentActions}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.commentAction} ${commentReactions[comment.id] === 1
                                                                ? styles.likeActive
                                                                : ""
                                                                }`}
                                                            onClick={() =>
                                                                void handleCommentReaction(
                                                                    comment.id,
                                                                    1
                                                                )
                                                            }
                                                            disabled={
                                                                reactionLoadingId === comment.id
                                                            }
                                                            aria-pressed={
                                                                commentReactions[comment.id] === 1
                                                            }
                                                            aria-label={
                                                                language === "tr"
                                                                    ? "Yorumu beğen"
                                                                    : "Like comment"
                                                            }
                                                            title={
                                                                language === "tr"
                                                                    ? "Beğen"
                                                                    : "Like"
                                                            }
                                                        >
                                                            <LikeIcon />

                                                            {comment.like_count > 0 && (
                                                                <small className={styles.actionCount}>
                                                                    {comment.like_count}
                                                                </small>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`${styles.commentAction} ${commentReactions[comment.id] === -1
                                                                ? styles.dislikeActive
                                                                : ""
                                                                }`}
                                                            onClick={() =>
                                                                void handleCommentReaction(
                                                                    comment.id,
                                                                    -1
                                                                )
                                                            }
                                                            disabled={
                                                                reactionLoadingId === comment.id
                                                            }
                                                            aria-pressed={
                                                                commentReactions[comment.id] === -1
                                                            }
                                                            aria-label={
                                                                language === "tr"
                                                                    ? "Yorumu beğenme"
                                                                    : "Dislike comment"
                                                            }
                                                            title={
                                                                language === "tr"
                                                                    ? "Beğenme"
                                                                    : "Dislike"
                                                            }
                                                        >
                                                            <DislikeIcon />

                                                            {comment.dislike_count > 0 && (
                                                                <small className={styles.actionCount}>
                                                                    {comment.dislike_count}
                                                                </small>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={styles.commentAction}
                                                            onClick={() =>
                                                                startReply(comment)
                                                            }
                                                            aria-label={
                                                                language === "tr"
                                                                    ? "Yoruma yanıt ver"
                                                                    : "Reply to comment"
                                                            }
                                                            title={
                                                                language === "tr"
                                                                    ? "Yanıtla"
                                                                    : "Reply"
                                                            }
                                                        >
                                                            <ReplyIcon />
                                                        </button>

                                                        {currentUserId !== comment.author_id && (
                                                            <button
                                                                type="button"
                                                                className={`${styles.commentAction} ${styles.reportAction
                                                                    } ${reportedCommentIds[comment.id]
                                                                        ? styles.reportedAction
                                                                        : ""
                                                                    }`}
                                                                onClick={() =>
                                                                    openReportModal(comment)
                                                                }
                                                                disabled={
                                                                    reportLoadingId === comment.id ||
                                                                    reportedCommentIds[comment.id]
                                                                }
                                                                aria-pressed={
                                                                    reportedCommentIds[comment.id] ??
                                                                    false
                                                                }
                                                                aria-label={
                                                                    reportedCommentIds[comment.id]
                                                                        ? language === "tr"
                                                                            ? "Yorum şikâyet edildi"
                                                                            : "Comment reported"
                                                                        : language === "tr"
                                                                            ? "Yorumu şikâyet et"
                                                                            : "Report comment"
                                                                }
                                                                title={
                                                                    reportedCommentIds[comment.id]
                                                                        ? language === "tr"
                                                                            ? "Şikâyet Edildi"
                                                                            : "Reported"
                                                                        : language === "tr"
                                                                            ? "Şikâyet Et"
                                                                            : "Report"
                                                                }
                                                            >
                                                                <ReportIcon />
                                                            </button>
                                                        )}

                                                        {currentUserId === comment.author_id && (
                                                            <button
                                                                type="button"
                                                                className={`${styles.commentAction} ${styles.removeAction}`}
                                                                onClick={() =>
                                                                    setRemoveConfirmComment(comment)
                                                                }
                                                                disabled={
                                                                    removeLoadingId === comment.id
                                                                }
                                                                aria-label={
                                                                    language === "tr"
                                                                        ? "Yorumu kaldır"
                                                                        : "Remove comment"
                                                                }
                                                                title={
                                                                    language === "tr"
                                                                        ? "Yorumu Kaldır"
                                                                        : "Remove Comment"
                                                                }
                                                            >
                                                                <RemoveIcon />
                                                            </button>
                                                        )}
                                                    </div>
                                                </article>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {topicReportOpen && (
                <div
                    className={styles.modalBackdrop}
                    onMouseDown={closeTopicReportModal}
                >
                    <section
                        className={`${styles.confirmModal} ${styles.reportModal}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="report-topic-title"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div
                            className={`${styles.confirmModalIcon} ${topicReportCompleted
                                ? styles.reportSuccessIcon
                                : styles.reportModalIcon
                                }`}
                        >
                            <ReportIcon />
                        </div>

                        <span className={styles.confirmModalLabel}>
                            {language === "tr"
                                ? "TOPLULUK GÜVENLİĞİ"
                                : "COMMUNITY SAFETY"}
                        </span>

                        {topicReportCompleted ? (
                            <>
                                <h2 id="report-topic-title">
                                    {language === "tr"
                                        ? "Şikâyetin iletildi"
                                        : "Report submitted"}
                                </h2>

                                <p>
                                    {language === "tr"
                                        ? "Konu hakkındaki bildirimin moderasyon sistemine kaydedildi. İnceleme sonucunda gerekli işlem uygulanacaktır."
                                        : "Your topic report has been recorded for moderation review."}
                                </p>

                                <div
                                    className={`${styles.confirmModalActions} ${styles.reportSuccessActions}`}
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles.confirmReportButton
                                        }
                                        onClick={closeTopicReportModal}
                                    >
                                        {language === "tr"
                                            ? "Tamam"
                                            : "Done"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 id="report-topic-title">
                                    {language === "tr"
                                        ? "Bu konuyu neden şikâyet ediyorsun?"
                                        : "Why are you reporting this topic?"}
                                </h2>

                                <p>
                                    {language === "tr"
                                        ? "En uygun nedeni seç. Bildirimin konu sahibine gösterilmez."
                                        : "Select the most appropriate reason. Your report will not be shown to the topic author."}
                                </p>

                                <div className={styles.reportReasonGrid}>
                                    {[
                                        {
                                            value: "spam",
                                            tr: "Spam",
                                            en: "Spam",
                                        },
                                        {
                                            value: "harassment",
                                            tr: "Taciz veya zorbalık",
                                            en: "Harassment",
                                        },
                                        {
                                            value: "hate",
                                            tr: "Nefret söylemi",
                                            en: "Hate speech",
                                        },
                                        {
                                            value: "illegal",
                                            tr: "Yasadışı içerik",
                                            en: "Illegal content",
                                        },
                                        {
                                            value:
                                                "personal_information",
                                            tr: "Kişisel bilgi",
                                            en: "Personal information",
                                        },
                                        {
                                            value: "other",
                                            tr: "Diğer",
                                            en: "Other",
                                        },
                                    ].map((reason) => {
                                        const value =
                                            reason.value as ReportReason;

                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                className={`${styles.reportReasonButton} ${reportReason === value
                                                    ? styles.reportReasonActive
                                                    : ""
                                                    }`}
                                                aria-pressed={
                                                    reportReason === value
                                                }
                                                onClick={() => {
                                                    setReportReason(value);
                                                    setReportMessage(null);
                                                }}
                                            >
                                                {language === "tr"
                                                    ? reason.tr
                                                    : reason.en}
                                            </button>
                                        );
                                    })}
                                </div>

                                <label
                                    className={
                                        styles.reportDetailsLabel
                                    }
                                >
                                    <span>
                                        {language === "tr"
                                            ? "Ek açıklama (isteğe bağlı)"
                                            : "Additional details (optional)"}
                                    </span>

                                    <textarea
                                        value={reportDetails}
                                        maxLength={1000}
                                        placeholder={
                                            language === "tr"
                                                ? "Moderasyon ekibine yardımcı olacak kısa bir açıklama yaz..."
                                                : "Add a short explanation for the moderation team..."
                                        }
                                        onChange={(event) => {
                                            setReportDetails(
                                                event.target.value
                                            );

                                            setReportMessage(null);
                                        }}
                                    />

                                    <small>
                                        {reportDetails.length}/1000
                                    </small>
                                </label>

                                {reportMessage === "reason" && (
                                    <p
                                        className={
                                            styles.reportFeedback
                                        }
                                    >
                                        {language === "tr"
                                            ? "Lütfen bir şikâyet nedeni seç."
                                            : "Please select a report reason."}
                                    </p>
                                )}

                                {reportMessage === "error" && (
                                    <p
                                        className={
                                            styles.reportFeedback
                                        }
                                    >
                                        {language === "tr"
                                            ? "Şikâyet gönderilemedi. Lütfen tekrar dene."
                                            : "The report could not be submitted. Please try again."}
                                    </p>
                                )}

                                <div
                                    className={
                                        styles.confirmModalActions
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles.confirmCancelButton
                                        }
                                        onClick={closeTopicReportModal}
                                        disabled={topicReportLoading}
                                    >
                                        {language === "tr"
                                            ? "Vazgeç"
                                            : "Cancel"}
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            styles.confirmReportButton
                                        }
                                        disabled={
                                            !reportReason ||
                                            topicReportLoading
                                        }
                                        onClick={() => {
                                            void handleTopicReport();
                                        }}
                                    >
                                        <ReportIcon />

                                        {topicReportLoading
                                            ? language === "tr"
                                                ? "Gönderiliyor..."
                                                : "Submitting..."
                                            : language === "tr"
                                                ? "Şikâyeti Gönder"
                                                : "Submit Report"}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}

            {reportModalComment && (
                <div
                    className={styles.modalBackdrop}
                    onMouseDown={closeReportModal}
                >
                    <section
                        className={`${styles.confirmModal} ${styles.reportModal}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="report-comment-title"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div
                            className={`${styles.confirmModalIcon} ${reportCompleted
                                ? styles.reportSuccessIcon
                                : styles.reportModalIcon
                                }`}
                        >
                            <ReportIcon />
                        </div>

                        <span
                            className={
                                styles.confirmModalLabel
                            }
                        >
                            {language === "tr"
                                ? "TOPLULUK GÜVENLİĞİ"
                                : "COMMUNITY SAFETY"}
                        </span>

                        {reportCompleted ? (
                            <>
                                <h2 id="report-comment-title">
                                    {language === "tr"
                                        ? "Şikâyetin iletildi"
                                        : "Report submitted"}
                                </h2>

                                <p>
                                    {language === "tr"
                                        ? "Bildirimin moderasyon sistemine kaydedildi. İnceleme sonucunda gerekli işlem uygulanacaktır."
                                        : "Your report has been recorded for moderation review."}
                                </p>

                                <div
                                    className={`${styles.confirmModalActions} ${styles.reportSuccessActions}`
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles.confirmReportButton
                                        }
                                        onClick={closeReportModal}
                                    >
                                        {language === "tr"
                                            ? "Tamam"
                                            : "Done"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 id="report-comment-title">
                                    {language === "tr"
                                        ? "Bu yorumu neden şikâyet ediyorsun?"
                                        : "Why are you reporting this comment?"}
                                </h2>

                                <p>
                                    {language === "tr"
                                        ? "En uygun nedeni seç. Bildirimin yorum sahibine gösterilmez."
                                        : "Select the most appropriate reason. Your report will not be shown to the comment author."}
                                </p>

                                <div
                                    className={
                                        styles.reportReasonGrid
                                    }
                                >
                                    {[
                                        {
                                            value: "spam",
                                            tr: "Spam",
                                            en: "Spam",
                                        },
                                        {
                                            value: "harassment",
                                            tr: "Taciz veya zorbalık",
                                            en: "Harassment",
                                        },
                                        {
                                            value: "hate",
                                            tr: "Nefret söylemi",
                                            en: "Hate speech",
                                        },
                                        {
                                            value: "illegal",
                                            tr: "Yasadışı içerik",
                                            en: "Illegal content",
                                        },
                                        {
                                            value:
                                                "personal_information",
                                            tr: "Kişisel bilgi",
                                            en: "Personal information",
                                        },
                                        {
                                            value: "other",
                                            tr: "Diğer",
                                            en: "Other",
                                        },
                                    ].map((reason) => {
                                        const value =
                                            reason.value as ReportReason;

                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                className={`${styles.reportReasonButton} ${reportReason ===
                                                    value
                                                    ? styles.reportReasonActive
                                                    : ""
                                                    }`}
                                                aria-pressed={
                                                    reportReason ===
                                                    value
                                                }
                                                onClick={() => {
                                                    setReportReason(
                                                        value
                                                    );

                                                    setReportMessage(
                                                        null
                                                    );
                                                }}
                                            >
                                                {language === "tr"
                                                    ? reason.tr
                                                    : reason.en}
                                            </button>
                                        );
                                    })}
                                </div>

                                <label
                                    className={
                                        styles.reportDetailsLabel
                                    }
                                >
                                    <span>
                                        {language === "tr"
                                            ? "Ek açıklama (isteğe bağlı)"
                                            : "Additional details (optional)"}
                                    </span>

                                    <textarea
                                        value={reportDetails}
                                        maxLength={1000}
                                        placeholder={
                                            language === "tr"
                                                ? "Moderasyon ekibine yardımcı olacak kısa bir açıklama yaz..."
                                                : "Add a short explanation for the moderation team..."
                                        }
                                        onChange={(event) => {
                                            setReportDetails(
                                                event.target.value
                                            );

                                            setReportMessage(
                                                null
                                            );
                                        }}
                                    />

                                    <small>
                                        {reportDetails.length}
                                        /1000
                                    </small>
                                </label>

                                {reportMessage ===
                                    "reason" && (
                                        <p
                                            className={
                                                styles.reportFeedback
                                            }
                                        >
                                            {language === "tr"
                                                ? "Lütfen bir şikâyet nedeni seç."
                                                : "Please select a report reason."}
                                        </p>
                                    )}

                                {reportMessage ===
                                    "error" && (
                                        <p
                                            className={
                                                styles.reportFeedback
                                            }
                                        >
                                            {language === "tr"
                                                ? "Şikâyet gönderilemedi. Lütfen tekrar dene."
                                                : "The report could not be submitted. Please try again."}
                                        </p>
                                    )}

                                <div
                                    className={
                                        styles.confirmModalActions
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles.confirmCancelButton
                                        }
                                        onClick={
                                            closeReportModal
                                        }
                                        disabled={
                                            reportLoadingId ===
                                            reportModalComment.id
                                        }
                                    >
                                        {language === "tr"
                                            ? "Vazgeç"
                                            : "Cancel"}
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            styles.confirmReportButton
                                        }
                                        disabled={
                                            !reportReason ||
                                            reportLoadingId ===
                                            reportModalComment.id
                                        }
                                        onClick={() =>
                                            void handleReportComment()
                                        }
                                    >
                                        <ReportIcon />

                                        {reportLoadingId ===
                                            reportModalComment.id
                                            ? language === "tr"
                                                ? "Gönderiliyor..."
                                                : "Submitting..."
                                            : language === "tr"
                                                ? "Şikâyeti Gönder"
                                                : "Submit Report"}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}

            {removeConfirmComment && (
                <div
                    className={styles.modalBackdrop}
                    onMouseDown={() =>
                        setRemoveConfirmComment(null)
                    }
                >
                    <section
                        className={styles.confirmModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="remove-comment-title"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className={styles.confirmModalIcon}>
                            <RemoveIcon />
                        </div>

                        <span className={styles.confirmModalLabel}>
                            {language === "tr"
                                ? "YORUM YÖNETİMİ"
                                : "COMMENT MANAGEMENT"}
                        </span>

                        <h2 id="remove-comment-title">
                            {language === "tr"
                                ? "Yorumu kaldırmak istiyor musun?"
                                : "Remove this comment?"}
                        </h2>

                        <p>
                            {language === "tr"
                                ? "Bu yorum toplulukta artık görünmeyecek. Kayıt, güvenlik ve moderasyon amacıyla sistemde korunacaktır."
                                : "This comment will no longer be visible to the community. It will remain stored for security and moderation purposes."}
                        </p>

                        <div className={styles.confirmModalActions}>
                            <button
                                type="button"
                                className={styles.confirmCancelButton}
                                onClick={() =>
                                    setRemoveConfirmComment(null)
                                }
                                disabled={
                                    removeLoadingId ===
                                    removeConfirmComment.id
                                }
                            >
                                {language === "tr"
                                    ? "Vazgeç"
                                    : "Cancel"}
                            </button>

                            <button
                                type="button"
                                className={styles.confirmRemoveButton}
                                disabled={
                                    removeLoadingId ===
                                    removeConfirmComment.id
                                }
                                onClick={() => {
                                    const selectedComment =
                                        removeConfirmComment;

                                    void handleRemoveComment(
                                        selectedComment
                                    ).finally(() => {
                                        setRemoveConfirmComment(null);
                                    });
                                }}
                            >
                                <RemoveIcon />

                                {removeLoadingId ===
                                    removeConfirmComment.id
                                    ? language === "tr"
                                        ? "Kaldırılıyor..."
                                        : "Removing..."
                                    : language === "tr"
                                        ? "Yorumu Kaldır"
                                        : "Remove Comment"}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            <ForumFooter />

            <nav
                className="ff-bottom-nav"
                aria-label={
                    language === "tr"
                        ? "Ana menü"
                        : "Main menu"
                }
            >
                <Link
                    href="/akis"
                    className="active"
                    aria-current="page"
                >
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

                    <span>Blog</span>
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
