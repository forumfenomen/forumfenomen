import Link from "next/link";

import CommentModerationActions from "@/components/admin/comment-moderation-actions";
import { createClient } from "@/lib/supabase/server";

import styles from "../admin.module.css";

type ProfileSummary = {
    id: string;
    display_name: string | null;
    username: string | null;
};

type TopicSummary = {
    id: string;
    title: string;
};

type AdminComment = {
    id: string;
    content: string;
    status: string;
    topic_id: string;
    author_id: string | null;
    content_profile_id: string | null;
    created_at: string;
};

type AdminCommentsPageProps = {
    searchParams: Promise<{
        status?: string;
        search?: string;
    }>;
};

function getProfileName(
    profile: ProfileSummary | undefined
) {
    return (
        profile?.display_name?.trim() ||
        profile?.username
            ?.replace(/^@/, "")
            .trim() ||
        "ForumFenomen Üyesi"
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat(
        "tr-TR",
        {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Istanbul",
        }
    ).format(new Date(value));
}

export default async function AdminCommentsPage({
    searchParams,
}: AdminCommentsPageProps) {
    const params = await searchParams;

    const selectedStatus =
        params.status === "published" ||
            params.status === "hidden" ||
            params.status === "banned"
            ? params.status
            : "all";

    const searchText =
        params.search?.trim() ?? "";

    const supabase = await createClient();

    let commentsQuery = supabase
        .from("topic_comments")
        .select(`
  id,
  content,
  status,
  topic_id,
  author_id,
  content_profile_id,
  created_at
`)
        .order("created_at", {
            ascending: false,
        })
        .limit(200);

    if (selectedStatus !== "all") {
        commentsQuery = commentsQuery.eq(
            "status",
            selectedStatus
        );
    }

    if (searchText) {
        commentsQuery = commentsQuery.ilike(
            "content",
            `%${searchText}%`
        );
    }

    const [
        commentsResult,
        publishedCountResult,
        hiddenCountResult,
        bannedCountResult,
    ] = await Promise.all([
        commentsQuery,

        supabase
            .from("topic_comments")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("status", "published"),

        supabase
            .from("topic_comments")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("status", "hidden"),

        supabase
            .from("topic_comments")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("status", "banned"),
    ]);

    if (commentsResult.error) {
        console.error(
            "Yorumlar alınamadı:",
            commentsResult.error.message
        );
    }

    const comments =
        (commentsResult.data ??
            []) as AdminComment[];

    const profileIds = Array.from(
        new Set(
            comments
                .map(
                    (comment) =>
                        comment.author_id
                )
                .filter(
                    (
                        value
                    ): value is string =>
                        Boolean(value)
                )
        )
    );

    const contentProfileIds = Array.from(
        new Set(
            comments
                .map(
                    (comment) =>
                        comment.content_profile_id
                )
                .filter(
                    (
                        value
                    ): value is string =>
                        Boolean(value)
                )
        )
    );

    const topicIds = Array.from(
        new Set(
            comments.map(
                (comment) => comment.topic_id
            )
        )
    );

    let profiles: ProfileSummary[] = [];
    let contentProfiles: ProfileSummary[] = [];
    let topics: TopicSummary[] = [];

    if (contentProfileIds.length > 0) {
        const contentProfilesResult =
            await supabase
                .from("content_profiles")
                .select(`
                id,
                display_name,
                username
            `)
                .in("id", contentProfileIds);

        if (contentProfilesResult.error) {
            console.error(
                "Yorum içerik profilleri alınamadı:",
                contentProfilesResult.error.message
            );
        }

        contentProfiles =
            (contentProfilesResult.data ??
                []) as ProfileSummary[];
    }

    if (profileIds.length > 0) {
        const profilesResult = await supabase.rpc(
            "get_profile_summaries_by_ids",
            {
                p_profile_ids: profileIds,
            }
        );

        if (profilesResult.error) {
            console.error(
                "Yorum kullanıcıları alınamadı:",
                profilesResult.error.message
            );
        }

        profiles =
            (profilesResult.data ??
                []) as ProfileSummary[];
    }

    if (topicIds.length > 0) {
        const topicsResult = await supabase
            .from("topics")
            .select(`
        id,
        title
      `)
            .in("id", topicIds);

        if (topicsResult.error) {
            console.error(
                "Yorum konuları alınamadı:",
                topicsResult.error.message
            );
        }

        topics =
            (topicsResult.data ??
                []) as TopicSummary[];
    }

    const profileMap = new Map(
        profiles.map((profile) => [
            profile.id,
            profile,
        ])
    );

    const contentProfileMap = new Map(
        contentProfiles.map((profile) => [
            profile.id,
            profile,
        ])
    );

    const topicMap = new Map(
        topics.map((topic) => [
            topic.id,
            topic,
        ])
    );

    const publishedCount =
        publishedCountResult.count ?? 0;

    const hiddenCount =
        hiddenCountResult.count ?? 0;

    const bannedCount =
        bannedCountResult.count ?? 0;

    const totalCount =
        publishedCount +
        hiddenCount +
        bannedCount;

    return (
        <>
            <header className={styles.pageHeader}>
                <div>
                    <span>İÇERİK YÖNETİMİ</span>

                    <h1>Yorumlar</h1>

                    <p>
                        Forumdaki yorumları incele, gizle
                        veya yeniden yayınla.
                    </p>
                </div>

                <Link
                    href="/admin/yorumlar/yeni"
                    className={styles.newTopicButton}
                >
                    <span>＋</span>
                    Yeni Yorum
                </Link>
            </header>

            <section
                className={styles.topicSummaryGrid}
            >
                <Link
                    href="/admin/yorumlar"
                    className={`${styles.topicSummaryCard} ${styles.commentSummaryLink} ${selectedStatus === "all"
                        ? styles.commentSummaryActive
                        : ""
                        }`}
                >
                    <span>Toplam yorum</span>
                    <strong>{totalCount}</strong>
                </Link>

                <Link
                    href="/admin/yorumlar?status=published"
                    className={`${styles.topicSummaryCard} ${styles.commentSummaryLink} ${selectedStatus === "published"
                        ? styles.commentSummaryActive
                        : ""
                        }`}
                >
                    <span>Yayındaki</span>
                    <strong>{publishedCount}</strong>
                </Link>

                <Link
                    href="/admin/yorumlar?status=hidden"
                    className={`${styles.topicSummaryCard} ${styles.commentSummaryLink} ${selectedStatus === "hidden"
                        ? styles.commentSummaryActive
                        : ""
                        }`}
                >
                    <span>Gizlenen</span>
                    <strong>{hiddenCount}</strong>
                </Link>

                <Link
                    href="/admin/yorumlar?status=banned"
                    className={`${styles.topicSummaryCard} ${styles.commentSummaryLink} ${selectedStatus === "banned"
                        ? styles.commentSummaryActive
                        : ""
                        }`}
                >
                    <span>Yasaklanan</span>
                    <strong>{bannedCount}</strong>
                </Link>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span>YORUM LİSTESİ</span>

                        <h2>
                            {selectedStatus === "published"
                                ? "Yayındaki Yorumlar"
                                : selectedStatus === "hidden"
                                    ? "Gizlenen Yorumlar"
                                    : selectedStatus === "banned"
                                        ? "Yasaklanan Yorumlar"
                                        : "Tüm Yorumlar"}
                        </h2>
                    </div>

                    <div
                        className={
                            styles.topicCountBadge
                        }
                    >
                        {comments.length} yorum
                    </div>
                </div>

                <form
                    method="get"
                    className={
                        styles.topicAdminSearch
                    }
                >
                    {selectedStatus !== "all" ? (
                        <input
                            type="hidden"
                            name="status"
                            value={selectedStatus}
                        />
                    ) : null}

                    <div
                        className={
                            styles.topicAdminSearchField
                        }
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="11"
                                cy="11"
                                r="7"
                            />

                            <path d="m20 20-3.5-3.5" />
                        </svg>

                        <input
                            type="search"
                            name="search"
                            defaultValue={searchText}
                            placeholder="Yorum içeriği, kullanıcı veya konu ara..."
                        />
                    </div>

                    {searchText ? (
                        <Link
                            href={
                                selectedStatus === "all"
                                    ? "/admin/yorumlar"
                                    : `/admin/yorumlar?status=${selectedStatus}`
                            }
                            className={
                                styles.topicAdminSearchClear
                            }
                        >
                            Temizle
                        </Link>
                    ) : null}

                    <button
                        type="submit"
                        className={
                            styles.topicSearchButton
                        }
                    >
                        Ara
                    </button>
                </form>

                {comments.length === 0 ? (
                    <div className={styles.emptyState}>
                        Filtrelere uygun yorum bulunamadı.
                    </div>
                ) : (
                    <div
                        className={styles.adminReportList}
                    >
                        {comments.map((comment) => {
                            const normalAuthor =
                                comment.author_id
                                    ? profileMap.get(
                                        comment.author_id
                                    )
                                    : undefined;

                            const managedAuthor =
                                comment.content_profile_id
                                    ? contentProfileMap.get(
                                        comment.content_profile_id
                                    )
                                    : undefined;

                            const author =
                                managedAuthor ??
                                normalAuthor;

                            const topic =
                                topicMap.get(
                                    comment.topic_id
                                );

                            const isPublished =
                                comment.status === "published";

                            const isHidden =
                                comment.status === "hidden";

                            const statusLabel =
                                isPublished
                                    ? "Yayında"
                                    : isHidden
                                        ? "Gizlendi"
                                        : "Yasaklandı";

                            const statusClass =
                                isPublished
                                    ? styles.commentStatusPublished
                                    : isHidden
                                        ? styles.commentStatusHidden
                                        : styles.commentStatusBanned;

                            return (
                                <article
                                    key={comment.id}
                                    className={
                                        styles.adminReportCard
                                    }
                                >
                                    <div
                                        className={
                                            styles.adminReportTop
                                        }
                                    >
                                        <div>
                                            <span
                                                className={
                                                    styles.adminReportReason
                                                }
                                            >
                                                YORUM
                                            </span>

                                            <strong>
                                                {getProfileName(author)}
                                            </strong>
                                        </div>

                                        <div
                                            className={
                                                styles.adminReportTopMeta
                                            }
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-end",
                                                    gap: 8,
                                                }}
                                            >
                                                <span
                                                    className={`${styles.adminReportStatus} ${styles.commentStatusBadge} ${statusClass}`}
                                                >
                                                    {statusLabel}
                                                </span>

                                                <CommentModerationActions
                                                    commentId={comment.id}
                                                    status={comment.status}
                                                />
                                            </div>

                                            <small>
                                                {formatDate(
                                                    comment.created_at
                                                )}
                                            </small>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            styles.reportedCommentBox
                                        }
                                    >
                                        <div
                                            className={
                                                styles.reportedCommentHeader
                                            }
                                        >
                                            <span>Yorum içeriği</span>

                                            <strong>
                                                {getProfileName(author)}
                                            </strong>
                                        </div>

                                        <p>{comment.content}</p>

                                        {topic ? (
                                            <Link
                                                href={`/konu/${topic.id}#comment-${comment.id}`}
                                                className={
                                                    styles.reportTopicLink
                                                }
                                            >
                                                Konuya git:{" "}
                                                {topic.title}
                                            </Link>
                                        ) : null}
                                    </div>


                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}