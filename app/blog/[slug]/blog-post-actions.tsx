"use client";

import {
    useEffect,
    useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type ReactionType =
    | "like"
    | "dislike"
    | null;

type ReportReason =
    | "yanlis_bilgi"
    | "telif"
    | "uygunsuz_icerik"
    | "reklam_spam"
    | "nefret_taciz"
    | "diger";

type BlogPostActionsProps = {
    postId: string;
    title: string;
    slug: string;
};

type EngagementResult = {
    like_count: number | string;
    dislike_count: number | string;
    save_count: number | string;
};

const reportReasons: Array<{
    value: ReportReason;
    label: string;
}> = [
        {
            value: "yanlis_bilgi",
            label: "Yanlış veya yanıltıcı bilgi",
        },
        {
            value: "telif",
            label: "Telif hakkı ihlali",
        },
        {
            value: "uygunsuz_icerik",
            label: "Uygunsuz içerik",
        },
        {
            value: "reklam_spam",
            label: "Reklam veya spam",
        },
        {
            value: "nefret_taciz",
            label: "Nefret söylemi veya taciz",
        },
        {
            value: "diger",
            label: "Diğer",
        },
    ];

function LikeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M7 10v10H4V10h3Z" />
            <path d="M7 10 11 3c.7 0 1.4.5 1.6 1.2.3 1 .1 2.4-.3 3.8H18a3 3 0 0 1 3 3l-1 6a3 3 0 0 1-3 2.5H7V10Z" />
        </svg>
    );
}

function DislikeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M7 14V4H4v10h3Z" />
            <path d="m7 14 4 7c.7 0 1.4-.5 1.6-1.2.3-1 .1-2.4-.3-3.8H18a3 3 0 0 0 3-3l-1-6A3 3 0 0 0 17 4.5H7V14Z" />
        </svg>
    );
}

function SaveIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M6 4h12v17l-6-4-6 4V4Z" />
        </svg>
    );
}

function ShareIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
        </svg>
    );
}

function ReportIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M6 21V4" />
            <path d="M6 5h10l-1.8 3L16 11H6" />
        </svg>
    );
}

function getCount(
    value: number | string | undefined
) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
}

export default function BlogPostActions({
    postId,
    title,
    slug,
}: BlogPostActionsProps) {
    const [supabase] = useState(
        () => createClient()
    );

    const [userId, setUserId] =
        useState<string | null>(null);

    const [reaction, setReaction] =
        useState<ReactionType>(null);

    const [saved, setSaved] =
        useState(false);

    const [likeCount, setLikeCount] =
        useState(0);

    const [
        dislikeCount,
        setDislikeCount,
    ] = useState(0);

    const [saveCount, setSaveCount] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [busy, setBusy] =
        useState(false);

    const [
        reportOpen,
        setReportOpen,
    ] = useState(false);

    const [
        reportReason,
        setReportReason,
    ] = useState<ReportReason>(
        "yanlis_bilgi"
    );

    const [
        reportDetails,
        setReportDetails,
    ] = useState("");

    const [
        reportMessage,
        setReportMessage,
    ] = useState("");

    const [
        reportCompleted,
        setReportCompleted,
    ] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadActions() {
            const {
                data: engagementData,
            } = await supabase.rpc(
                "get_blog_post_engagement",
                {
                    target_post_id: postId,
                }
            );

            if (
                active &&
                Array.isArray(
                    engagementData
                ) &&
                engagementData[0]
            ) {
                const engagement =
                    engagementData[0] as EngagementResult;

                setLikeCount(
                    getCount(
                        engagement.like_count
                    )
                );

                setDislikeCount(
                    getCount(
                        engagement.dislike_count
                    )
                );

                setSaveCount(
                    getCount(
                        engagement.save_count
                    )
                );
            }

            const {
                data: userData,
            } =
                await supabase.auth.getUser();

            const currentUser =
                userData.user;

            if (!active) {
                return;
            }

            if (!currentUser) {
                setLoading(false);
                return;
            }

            setUserId(currentUser.id);

            const [
                reactionResult,
                saveResult,
            ] = await Promise.all([
                supabase
                    .from(
                        "blog_post_reactions"
                    )
                    .select(
                        "reaction_type"
                    )
                    .eq(
                        "blog_post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .maybeSingle(),

                supabase
                    .from(
                        "blog_post_saves"
                    )
                    .select("id")
                    .eq(
                        "blog_post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .maybeSingle(),
            ]);

            if (!active) {
                return;
            }

            setReaction(
                reactionResult.data
                    ?.reaction_type ===
                    "like" ||
                    reactionResult.data
                        ?.reaction_type ===
                    "dislike"
                    ? reactionResult.data
                        .reaction_type
                    : null
            );

            setSaved(
                Boolean(saveResult.data)
            );

            setLoading(false);
        }

        void loadActions();

        return () => {
            active = false;
        };
    }, [postId, supabase]);

    function requireLogin() {
        if (userId) {
            return true;
        }

        const returnUrl =
            window.location.pathname;

        window.location.href =
            `/giris?returnUrl=${encodeURIComponent(
                returnUrl
            )}`;

        return false;
    }

    async function handleReaction(
        nextReaction:
            | "like"
            | "dislike"
    ) {
        if (
            busy ||
            !requireLogin() ||
            !userId
        ) {
            return;
        }

        setBusy(true);

        const { data, error } =
            await supabase.rpc(
                "toggle_blog_post_reaction",
                {
                    p_blog_post_id:
                        postId,
                    p_reaction_type:
                        nextReaction,
                }
            );

        if (error) {
            console.error(
                "Blog reaction error:",
                error
            );

            setBusy(false);
            return;
        }

        const result =
            Array.isArray(data)
                ? data[0]
                : null;

        if (result) {
            setReaction(
                result.reaction_type ===
                    "like" ||
                    result.reaction_type ===
                    "dislike"
                    ? result.reaction_type
                    : null
            );

            setLikeCount(
                Number(
                    result.like_count ?? 0
                )
            );

            setDislikeCount(
                Number(
                    result.dislike_count ??
                    0
                )
            );
        }

        setBusy(false);
    }

    async function handleSave() {
        if (
            busy ||
            !requireLogin() ||
            !userId
        ) {
            return;
        }

        setBusy(true);

        try {
            const {
                data: nextSavedState,
                error,
            } = await supabase.rpc(
                "toggle_saved_blog_post",
                {
                    p_blog_post_id: postId,
                }
            );

            if (error) {
                console.error(
                    "Blog kaydetme işlemi başarısız:",
                    error.message
                );

                return;
            }

            const isNowSaved =
                nextSavedState === true;

            setSaved(isNowSaved);

            setSaveCount((count) =>
                isNowSaved
                    ? count + 1
                    : Math.max(0, count - 1)
            );
        } finally {
            setBusy(false);
        }
    }

    async function handleShare() {
        const shareUrl =
            `${window.location.origin}/blog/${slug}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: title,
                    url: shareUrl,
                });

                return;
            } catch {
                return;
            }
        }

        await navigator.clipboard.writeText(
            shareUrl
        );

        window.alert(
            "Yazının bağlantısı kopyalandı."
        );
    }

    function openReport() {
        if (!requireLogin()) {
            return;
        }

        setReportMessage("");
        setReportCompleted(false);
        setReportOpen(true);
    }

    async function submitReport() {
        if (
            busy ||
            !userId
        ) {
            return;
        }

        setBusy(true);
        setReportMessage("");

        try {
            const { error } =
                await supabase.rpc(
                    "submit_blog_post_report",
                    {
                        p_blog_post_id:
                            postId,
                        p_reason:
                            reportReason,
                        p_details:
                            reportDetails
                                .trim() ||
                            null,
                    }
                );

            if (error) {
                console.error(
                    "Blog şikâyeti gönderilemedi:",
                    error.message
                );

                setReportMessage(
                    error.message.includes(
                        "duplicate key"
                    )
                        ? "Bu yazıyı daha önce şikâyet ettiniz."
                        : "Şikâyet gönderilemedi. Daha sonra tekrar deneyin."
                );

                return;
            }

            setReportMessage("");
            setReportCompleted(true);
            setReportDetails("");
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <section
                className="blog-post-actions"
                aria-label="Blog yazısı işlemleri"
            >
                <button
                    type="button"
                    className={
                        reaction === "like"
                            ? "active"
                            : ""
                    }
                    disabled={
                        loading ||
                        busy
                    }
                    onClick={() =>
                        handleReaction(
                            "like"
                        )
                    }
                >
                    <span
                        aria-hidden="true"
                    >
                        <LikeIcon />
                    </span>

                    <span>Beğen</span>

                    <strong>
                        {likeCount}
                    </strong>
                </button>

                <button
                    type="button"
                    className={
                        reaction ===
                            "dislike"
                            ? "active negative"
                            : ""
                    }
                    disabled={
                        loading ||
                        busy
                    }
                    onClick={() =>
                        handleReaction(
                            "dislike"
                        )
                    }
                >
                    <span
                        aria-hidden="true"
                    >
                        <DislikeIcon />
                    </span>

                    <span>
                        Beğenme
                    </span>

                    <strong>
                        {dislikeCount}
                    </strong>
                </button>

                <button
                    type="button"
                    className={
                        saved
                            ? "active"
                            : ""
                    }
                    disabled={
                        loading ||
                        busy
                    }
                    onClick={
                        handleSave
                    }
                >
                    <span
                        aria-hidden="true"
                    >
                        <SaveIcon />
                    </span>

                    <span>
                        {saved
                            ? "Kaydedildi"
                            : "Kaydet"}
                    </span>

                    <strong>
                        {saveCount}
                    </strong>
                </button>

                <button
                    type="button"
                    onClick={
                        handleShare
                    }
                >
                    <span
                        aria-hidden="true"
                    >
                        <ShareIcon />
                    </span>

                    <span>Paylaş</span>
                </button>

                <button
                    type="button"
                    className="report"
                    onClick={
                        openReport
                    }
                >
                    <span
                        aria-hidden="true"
                    >
                        <ReportIcon />
                    </span>

                    <span>
                        Şikâyet Et
                    </span>
                </button>
            </section>

            {reportOpen ? (
                <div
                    className="blog-report-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget &&
                            !busy
                        ) {
                            setReportOpen(false);
                            setReportCompleted(false);
                            setReportMessage("");
                        }
                    }}
                >
                    <section
                        className="blog-report-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="blog-report-title"
                    >
                        <div
                            className={`blog-report-icon ${reportCompleted
                                    ? "blog-report-success-icon"
                                    : ""
                                }`}
                        >
                            <ReportIcon />
                        </div>

                        <span className="blog-report-label">
                            TOPLULUK GÜVENLİĞİ
                        </span>

                        {reportCompleted ? (
                            <>
                                <h2 id="blog-report-title">
                                    Şikâyetin iletildi
                                </h2>

                                <p className="blog-report-description">
                                    Yazı hakkındaki bildirimin
                                    moderasyon sistemine kaydedildi.
                                    İnceleme sonucunda gerekli işlem
                                    uygulanacaktır.
                                </p>

                                <div
                                    className="blog-report-actions blog-report-success-actions"
                                >
                                    <button
                                        type="button"
                                        className="blog-report-submit-button"
                                        onClick={() => {
                                            setReportOpen(false);
                                            setReportCompleted(false);
                                            setReportMessage("");
                                        }}
                                    >
                                        Tamam
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 id="blog-report-title">
                                    Bu yazıyı neden şikâyet ediyorsun?
                                </h2>

                                <p className="blog-report-description">
                                    En uygun nedeni seç. Bildirimin
                                    yazı sahibine gösterilmez.
                                </p>

                                <div className="blog-report-reason-grid">
                                    {reportReasons.map((reason) => (
                                        <button
                                            key={reason.value}
                                            type="button"
                                            className={
                                                reportReason ===
                                                    reason.value
                                                    ? "blog-report-reason-active"
                                                    : ""
                                            }
                                            disabled={busy}
                                            onClick={() => {
                                                setReportReason(
                                                    reason.value
                                                );

                                                setReportMessage("");
                                            }}
                                        >
                                            {reason.label}
                                        </button>
                                    ))}
                                </div>

                                <label className="blog-report-field">
                                    <span>
                                        Ek açıklama (isteğe bağlı)
                                    </span>

                                    <textarea
                                        rows={5}
                                        maxLength={1000}
                                        value={reportDetails}
                                        disabled={busy}
                                        onChange={(event) => {
                                            setReportDetails(
                                                event.target.value
                                            );

                                            setReportMessage("");
                                        }}
                                        placeholder="İncelenmesi gereken durumu kısaca açıklayın..."
                                    />

                                    <small>
                                        {reportDetails.length}/1000
                                    </small>
                                </label>

                                {reportMessage ? (
                                    <p className="blog-report-feedback">
                                        {reportMessage}
                                    </p>
                                ) : null}

                                <div className="blog-report-actions">
                                    <button
                                        type="button"
                                        className="blog-report-submit-button"
                                        disabled={busy}
                                        onClick={submitReport}
                                    >
                                        <ReportIcon />

                                        {busy
                                            ? "Gönderiliyor..."
                                            : "Şikâyeti Gönder"}
                                    </button>

                                    <button
                                        type="button"
                                        className="blog-report-cancel-button"
                                        disabled={busy}
                                        onClick={() => {
                                            setReportOpen(false);
                                            setReportCompleted(false);
                                            setReportMessage("");
                                        }}
                                    >
                                        Vazgeç
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            ) : null}
        </>
    );
}