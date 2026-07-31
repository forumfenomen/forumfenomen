import Link from "next/link";

import { requireAdminAccess } from "@/lib/admin/require-admin-access";

import styles from "../admin.module.css";

type AdminActionLog = {
    id: string;
    actor_id: string;
    action_type: string;
    target_type: string;
    target_id: string | null;
    target_user_id: string | null;
    old_value: string | null;
    new_value: string | null;
    note: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
};

type ProfileSummary = {
    id: string;
    display_name: string | null;
    username: string | null;
};

type AdminLogsPageProps = {
    searchParams: Promise<{
        type?: string;
        search?: string;
    }>;
};

const actionNames: Record<string, string> = {
    comment_hidden: "Yorum gizlendi",
    comment_banned: "Yorum yasaklandı",
    comment_published: "Yorum yeniden yayınlandı",

    topic_published: "Konu yeniden yayınlandı",
    topic_hidden: "Konu gizlendi",
    topic_banned: "Konu yasaklandı",

    report_reviewing: "Şikâyet incelemeye alındı",
    report_resolved: "Şikâyette ihlal doğrulandı",
    report_dismissed: "Şikâyet reddedildi",

    user_suspended: "Kullanıcı askıya alındı",
    user_banned: "Kullanıcı yasaklandı",
    user_activated: "Kullanıcı yeniden aktifleştirildi",

};

const statusNames: Record<string, string> = {
    published: "Yayında",
    hidden: "Gizlendi",
    banned: "Yasaklandı",
    pending: "Bekliyor",
    reviewing: "İnceleniyor",
    resolved: "İhlal doğrulandı",
    dismissed: "Reddedildi",
    active: "Aktif",
    suspended: "Askıya alındı",
};

function getStatusName(
    value: string | null
) {
    if (!value) {
        return "-";
    }

    return statusNames[value] ?? value;
}

function getProfileName(
    profile: ProfileSummary | undefined
) {
    return (
        profile?.display_name?.trim() ||
        profile?.username
            ?.replace(/^@/, "")
            .trim() ||
        "ForumFenomen Yetkilisi"
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

function getMetadataString(
    metadata: Record<string, unknown>,
    key: string
) {
    const value = metadata[key];

    return typeof value === "string"
        ? value
        : null;
}

export default async function AdminLogsPage({
    searchParams,
}: AdminLogsPageProps) {
    const { supabase } =
        await requireAdminAccess();

    const params = await searchParams;

    const selectedType =
        params.type === "comment" ||
            params.type === "report"
            ? params.type
            : "all";

    const searchText =
        params.search?.trim() ?? "";

    let logsQuery = supabase
        .from("admin_action_logs")
        .select(`
      id,
      actor_id,
      action_type,
      target_type,
      target_id,
      target_user_id,
      old_value,
      new_value,
      note,
      metadata,
      created_at
    `)
        .order("created_at", {
            ascending: false,
        })
        .limit(300);

    if (selectedType !== "all") {
        logsQuery = logsQuery.eq(
            "target_type",
            selectedType
        );
    }

    const [
        logsResult,
        totalResult,
        commentResult,
        reportResult,
    ] = await Promise.all([
        logsQuery,

        supabase
            .from("admin_action_logs")
            .select("id", {
                count: "exact",
                head: true,
            }),

        supabase
            .from("admin_action_logs")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("target_type", "comment"),

        supabase
            .from("admin_action_logs")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("target_type", "report"),
    ]);

    if (logsResult.error) {
        console.error(
            "İşlem kayıtları alınamadı:",
            logsResult.error.message
        );
    }

    const logs =
        (logsResult.data ??
            []) as AdminActionLog[];

    const actorIds = Array.from(
        new Set(
            logs.map((log) => log.actor_id)
        )
    );

    let profiles: ProfileSummary[] = [];

    if (actorIds.length > 0) {
        const profilesResult = await supabase.rpc(
            "get_profile_summaries_by_ids",
            {
                p_profile_ids: actorIds,
            }
        );

        if (profilesResult.error) {
            console.error(
                "İşlem yapan kullanıcılar alınamadı:",
                profilesResult.error.message
            );
        }

        profiles =
            (profilesResult.data ??
                []) as ProfileSummary[];
    }

    const profileMap = new Map(
        profiles.map((profile) => [
            profile.id,
            profile,
        ])
    );

    const filteredLogs = searchText
        ? logs.filter((log) => {
            const actorName =
                getProfileName(
                    profileMap.get(log.actor_id)
                );

            const commentContent =
                getMetadataString(
                    log.metadata,
                    "comment_content"
                ) ?? "";

            const searchableText = [
                actorName,
                actionNames[log.action_type] ??
                log.action_type,
                log.note ?? "",
                commentContent,
                log.old_value ?? "",
                log.new_value ?? "",
            ]
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            return searchableText.includes(
                searchText.toLocaleLowerCase("tr-TR")
            );
        })
        : logs;

    const totalCount =
        totalResult.count ?? 0;

    const commentCount =
        commentResult.count ?? 0;

    const reportCount =
        reportResult.count ?? 0;

    return (
        <>
            <header className={styles.pageHeader}>
                <div>
                    <span>YÖNETİM DENETİMİ</span>

                    <h1>İşlem Kayıtları</h1>

                    <p>
                        Admin ve moderatörlerin yaptığı
                        işlemleri tarih sırasıyla incele.
                    </p>
                </div>

                <div className={styles.securityBadge}>
                    ● Güvenli denetim kaydı
                </div>
            </header>

            <section
                className={styles.reportSummaryGrid}
            >
                <Link
                    href="/admin/islem-kayitlari"
                    className={`${styles.reportSummaryCard} ${styles.commentSummaryLink} ${selectedType === "all"
                        ? styles.commentSummaryActive
                        : ""
                        }`}
                >
                    <span>Toplam işlem</span>
                    <strong>{totalCount}</strong>
                </Link>

                <Link
                    href="/admin/islem-kayitlari?type=comment"
                    className={`${styles.reportSummaryCard} ${styles.commentSummaryLink} ${selectedType === "comment"
                        ? styles.commentSummaryActive
                        : ""
                        }`}
                >
                    <span>Yorum işlemleri</span>
                    <strong>{commentCount}</strong>
                </Link>

                <Link
                    href="/admin/islem-kayitlari?type=report"
                    className={`${styles.reportSummaryCard} ${styles.commentSummaryLink} ${selectedType === "report"
                        ? styles.commentSummaryActive
                        : ""
                        }`}
                >
                    <span>Şikâyet işlemleri</span>
                    <strong>{reportCount}</strong>
                </Link>

                <article
                    className={styles.reportSummaryCard}
                >
                    <span>Listelenen</span>
                    <strong>{filteredLogs.length}</strong>
                </article>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span>ARAMA VE FİLTRE</span>

                        <h2>Kayıtları Bul</h2>
                    </div>

                    <div className={styles.panelBadge}>
                        Son 300 kayıt
                    </div>
                </div>

                <form
                    method="get"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(220px, 1fr) 190px auto",
                        gap: 12,
                        alignItems: "end",
                    }}
                >
                    <label
                        style={{
                            display: "grid",
                            gap: 7,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                opacity: 0.7,
                            }}
                        >
                            Kayıtlarda ara
                        </span>

                        <input
                            type="search"
                            name="search"
                            defaultValue={searchText}
                            placeholder="Yetkili, not veya içerik ara..."
                            style={{
                                minHeight: 44,
                                padding: "0 14px",
                                borderRadius: 12,
                                border:
                                    "1px solid rgba(255,255,255,0.12)",
                                color: "inherit",
                                background:
                                    "rgba(255,255,255,0.05)",
                            }}
                        />
                    </label>

                    <label
                        style={{
                            display: "grid",
                            gap: 7,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                opacity: 0.7,
                            }}
                        >
                            İşlem türü
                        </span>

                        <select
                            name="type"
                            defaultValue={selectedType}
                            style={{
                                minHeight: 44,
                                padding: "0 12px",
                                borderRadius: 12,
                                border:
                                    "1px solid rgba(255,255,255,0.12)",
                                color: "inherit",
                                background: "#161521",
                            }}
                        >
                            <option value="all">
                                Tüm işlemler
                            </option>

                            <option value="comment">
                                Yorum işlemleri
                            </option>

                            <option value="report">
                                Şikâyet işlemleri
                            </option>
                        </select>
                    </label>

                    <button
                        type="submit"
                        className={styles.reviewReportButton}
                        style={{ minHeight: 44 }}
                    >
                        Filtrele
                    </button>
                </form>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span>DENETİM GÜNLÜĞÜ</span>

                        <h2>Son İşlemler</h2>
                    </div>

                    <div className={styles.panelBadge}>
                        {filteredLogs.length} kayıt
                    </div>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className={styles.emptyState}>
                        Filtrelere uygun işlem kaydı bulunamadı.
                    </div>
                ) : (
                    <div
                        className={styles.adminReportList}
                    >
                        {filteredLogs.map((log) => {
                            const actor =
                                profileMap.get(log.actor_id);

                            const commentContent =
                                getMetadataString(
                                    log.metadata,
                                    "comment_content"
                                );

                            const topicId =
                                getMetadataString(
                                    log.metadata,
                                    "topic_id"
                                );

                            const commentId =
                                log.target_type === "comment"
                                    ? log.target_id
                                    : getMetadataString(
                                        log.metadata,
                                        "comment_id"
                                    );

                            return (
                                <article
                                    key={log.id}
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
                                                {log.target_type === "comment"
                                                    ? "YORUM İŞLEMİ"
                                                    : log.target_type === "topic"
                                                        ? "KONU İŞLEMİ"
                                                        : log.target_type === "user"
                                                            ? "KULLANICI İŞLEMİ"
                                                            : "ŞİKÂYET İŞLEMİ"}
                                            </span>

                                            <strong>
                                                {actionNames[
                                                    log.action_type
                                                ] ?? log.action_type}
                                            </strong>
                                        </div>

                                        <div
                                            className={
                                                styles.adminReportTopMeta
                                            }
                                        >
                                            <span
                                                className={`${styles.adminReportStatus} ${styles.adminLogStatusBadge} ${log.new_value ===
                                                    "banned" ||
                                                    log.new_value ===
                                                    "resolved"
                                                    ? styles.reportStatusDismissed
                                                    : log.new_value ===
                                                        "published" ||
                                                        log.new_value ===
                                                        "dismissed"
                                                        ? styles.reportStatusResolved
                                                        : styles.reportStatusReviewing
                                                    }`}
                                            >
                                                {getStatusName(log.new_value)}
                                            </span>

                                            <small>
                                                {formatDate(
                                                    log.created_at
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
                                            <span>İşlemi yapan</span>

                                            <strong>
                                                {getProfileName(actor)}
                                            </strong>
                                        </div>

                                        {commentContent ? (
                                            <p>{commentContent}</p>
                                        ) : (
                                            <p>
                                                Bu işlem için içerik özeti
                                                bulunmuyor.
                                            </p>
                                        )}

                                        {topicId ? (
                                            <Link
                                                href={`/konu/${topicId}${commentId
                                                    ? `#comment-${commentId}`
                                                    : ""
                                                    }`}
                                                className={
                                                    styles.reportTopicLink
                                                }
                                            >
                                                İlgili içeriğe git
                                            </Link>
                                        ) : null}
                                    </div>

                                    <div
                                        className={
                                            styles.adminReportFooter
                                        }
                                    >
                                        <span className={styles.adminLogValue}>
                                            Önceki durum:{" "}
                                            <strong>
                                                {getStatusName(log.old_value)}
                                            </strong>
                                        </span>

                                        <span className={styles.adminLogValue}>
                                            Yeni durum:{" "}
                                            <strong>
                                                {getStatusName(log.new_value)}
                                            </strong>
                                        </span>
                                    </div>

                                    {log.note ? (
                                        <div
                                            className={
                                                styles.reportResolutionBox
                                            }
                                        >
                                            <span>İşlem notu</span>
                                            <p>{log.note}</p>
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}