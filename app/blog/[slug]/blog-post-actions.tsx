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

        const previousReaction =
            reaction;

        if (
            previousReaction ===
            nextReaction
        ) {
            const { error } =
                await supabase
                    .from(
                        "blog_post_reactions"
                    )
                    .delete()
                    .eq(
                        "blog_post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        userId
                    );

            if (!error) {
                setReaction(null);

                if (
                    nextReaction ===
                    "like"
                ) {
                    setLikeCount(
                        (count) =>
                            Math.max(
                                0,
                                count - 1
                            )
                    );
                } else {
                    setDislikeCount(
                        (count) =>
                            Math.max(
                                0,
                                count - 1
                            )
                    );
                }
            }

            setBusy(false);
            return;
        }

        const { error } =
            await supabase
                .from(
                    "blog_post_reactions"
                )
                .upsert(
                    {
                        blog_post_id:
                            postId,
                        user_id: userId,
                        reaction_type:
                            nextReaction,
                    },
                    {
                        onConflict:
                            "blog_post_id,user_id",
                    }
                );

        if (!error) {
            setReaction(
                nextReaction
            );

            if (
                previousReaction ===
                "like"
            ) {
                setLikeCount(
                    (count) =>
                        Math.max(
                            0,
                            count - 1
                        )
                );
            }

            if (
                previousReaction ===
                "dislike"
            ) {
                setDislikeCount(
                    (count) =>
                        Math.max(
                            0,
                            count - 1
                        )
                );
            }

            if (
                nextReaction ===
                "like"
            ) {
                setLikeCount(
                    (count) =>
                        count + 1
                );
            } else {
                setDislikeCount(
                    (count) =>
                        count + 1
                );
            }
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

        if (saved) {
            const { error } =
                await supabase
                    .from(
                        "blog_post_saves"
                    )
                    .delete()
                    .eq(
                        "blog_post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        userId
                    );

            if (!error) {
                setSaved(false);

                setSaveCount(
                    (count) =>
                        Math.max(
                            0,
                            count - 1
                        )
                );
            }
        } else {
            const { error } =
                await supabase
                    .from(
                        "blog_post_saves"
                    )
                    .insert({
                        blog_post_id:
                            postId,
                        user_id: userId,
                    });

            if (!error) {
                setSaved(true);

                setSaveCount(
                    (count) =>
                        count + 1
                );
            }
        }

        setBusy(false);
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

        const { error } =
            await supabase
                .from(
                    "blog_post_reports"
                )
                .upsert(
                    {
                        blog_post_id:
                            postId,
                        user_id: userId,
                        reason:
                            reportReason,
                        details:
                            reportDetails
                                .trim() ||
                            null,
                        status:
                            "pending",
                    },
                    {
                        onConflict:
                            "blog_post_id,user_id",
                    }
                );

        if (error) {
            setReportMessage(
                "Şikâyet gönderilemedi. Daha sonra tekrar deneyin."
            );
        } else {
            setReportMessage(
                "Şikâyetiniz inceleme için gönderildi."
            );

            setReportDetails("");
        }

        setBusy(false);
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
                        ♡
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
                        ♢
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
                        ▱
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
                        ↗
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
                        ⚑
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
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setReportOpen(
                                false
                            );
                        }
                    }}
                >
                    <section
                        className="blog-report-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="blog-report-title"
                    >
                        <div className="blog-report-header">
                            <div>
                                <span>
                                    İÇERİK
                                    ŞİKÂYETİ
                                </span>

                                <h2 id="blog-report-title">
                                    Bu yazıyı
                                    bildir
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setReportOpen(
                                        false
                                    )
                                }
                                aria-label="Pencereyi kapat"
                            >
                                ×
                            </button>
                        </div>

                        <label>
                            <span>
                                Şikâyet
                                nedeni
                            </span>

                            <select
                                value={
                                    reportReason
                                }
                                onChange={(
                                    event
                                ) =>
                                    setReportReason(
                                        event
                                            .target
                                            .value as ReportReason
                                    )
                                }
                            >
                                {reportReasons.map(
                                    (
                                        reason
                                    ) => (
                                        <option
                                            key={
                                                reason.value
                                            }
                                            value={
                                                reason.value
                                            }
                                        >
                                            {
                                                reason.label
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label>
                            <span>
                                Açıklama
                                (isteğe
                                bağlı)
                            </span>

                            <textarea
                                rows={5}
                                maxLength={
                                    1000
                                }
                                value={
                                    reportDetails
                                }
                                onChange={(
                                    event
                                ) =>
                                    setReportDetails(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="İncelenmesi gereken durumu kısaca açıklayın..."
                            />
                        </label>

                        {reportMessage ? (
                            <p>
                                {
                                    reportMessage
                                }
                            </p>
                        ) : null}

                        <div className="blog-report-actions">
                            <button
                                type="button"
                                onClick={() =>
                                    setReportOpen(
                                        false
                                    )
                                }
                            >
                                Vazgeç
                            </button>

                            <button
                                type="button"
                                disabled={
                                    busy
                                }
                                onClick={
                                    submitReport
                                }
                            >
                                Şikâyeti
                                Gönder
                            </button>
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    );
}