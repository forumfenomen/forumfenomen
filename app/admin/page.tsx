import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "./admin.module.css";

type RecentReport = {
    id: string;
    reason: string;
    status: string;
    details: string | null;
    created_at: string;

    reporter: {
        display_name: string | null;
        username: string | null;
    } | null;

    reported_comment: {
        content: string;
    } | null;
};

type TopicSummary = {
    id: string;
    title: string;
    comment_count: number;
    status: string;
    created_at: string;
};

const reasonNames: Record<string, string> = {
    spam: "Spam",
    harassment: "Taciz veya zorbalık",
    hate: "Nefret söylemi",
    illegal: "Yasadışı içerik",
    personal_information: "Kişisel bilgi",
    other: "Diğer",
};

const statusNames: Record<string, string> = {
    pending: "Bekliyor",
    reviewing: "İnceleniyor",
    resolved: "Sonuçlandı",
    dismissed: "Reddedildi",
};

function getReporterName(
    report: RecentReport
) {
    return (
        report.reporter?.display_name?.trim() ||
        report.reporter?.username
            ?.replace(/^@/, "")
            .trim() ||
        "ForumFenomen Üyesi"
    );
}

export default async function AdminPage() {
    const supabase = await createClient();

    const [
        usersResult,
        pendingReportsResult,
        publishedCommentsResult,
        deletedCommentsResult,
        topicSummariesResult,
        recentReportsResult,
    ] = await Promise.all([

        supabase
            .from("profiles")
            .select("id", {
                count: "exact",
                head: true,
            }),

        supabase
            .from("comment_reports")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("status", "pending"),

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
            .eq("status", "deleted"),

        supabase
            .from("topics")
            .select(`
    id,
    title,
    comment_count,
    status,
    created_at
  `)
            .order("comment_count", {
                ascending: false,
            })
            .order("created_at", {
                ascending: false,
            })
            .limit(20),

        supabase
            .from("comment_reports")
            .select(`
        id,
        reason,
        status,
        details,
        created_at,
        reporter:profiles!comment_reports_reporter_id_fkey (
          display_name,
          username
        ),
        reported_comment:topic_comments!comment_reports_comment_id_fkey (
          content
        )
      `)
            .order("created_at", {
                ascending: false,
            })
            .limit(5),
    ]);

    if (recentReportsResult.error) {
        console.error(
            "Son şikâyetler alınamadı:",
            recentReportsResult.error.message
        );
    }

    const topicSummaries =
        (topicSummariesResult.data ??
            []) as unknown as TopicSummary[];

    const recentReports =
        (recentReportsResult.data ??
            []) as unknown as RecentReport[];

    return (
        <>
            <header className={styles.pageHeader}>
                <div>
                    <span>FORUMFENOMEN YÖNETİM</span>

                    <h1>Genel Bakış</h1>

                    <p>
                        Kullanıcıları, yorumları ve moderasyon
                        süreçlerini tek merkezden takip et.
                    </p>
                </div>

                <div className={styles.securityBadge}>
                    ● Güvenli admin oturumu
                </div>
            </header>

            <section className={styles.statsGrid}>
                <article className={styles.statCard}>
                    <span className={styles.statLabel}>
                        Kullanıcı Sayısı
                    </span>

                    <strong>
                        {usersResult.count ?? 0}
                    </strong>

                    <p>Toplam kayıtlı kullanıcı</p>
                </article>

                <article className={styles.statCard}>
                    <span className={styles.statLabel}>
                        Bekleyen Şikayet
                    </span>

                    <strong>
                        {pendingReportsResult.count ?? 0}
                    </strong>

                    <p>İnceleme bekleyen şikâyet</p>
                </article>

                <article className={styles.statCard}>
                    <span className={styles.statLabel}>
                        Yayındaki Yorum
                    </span>

                    <strong>
                        {publishedCommentsResult.count ?? 0}
                    </strong>

                    <p>Yayındaki yorum</p>
                </article>

                <article className={styles.statCard}>
                    <span className={styles.statLabel}>
                        Silinen Yorum
                    </span>

                    <strong>
                        {deletedCommentsResult.count ?? 0}
                    </strong>

                    <p>Kullanıcı tarafından kaldırılan yorum</p>
                </article>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span>MODERASYON</span>
                        <h2>Son Şikâyetler</h2>
                    </div>

                    <div className={styles.panelBadge}>
                        Son {recentReports.length} kayıt
                    </div>
                </div>

                {recentReports.length === 0 ? (
                    <div className={styles.emptyState}>
                        Henüz şikâyet kaydı bulunmuyor.
                    </div>
                ) : (
                    <div className={styles.reportList}>
                        {recentReports.map((report) => {
                            const content =
                                report.reported_comment?.content ??
                                "Yorum içeriği bulunamadı.";

                            const formattedDate =
                                new Intl.DateTimeFormat(
                                    "tr-TR",
                                    {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    }
                                ).format(
                                    new Date(report.created_at)
                                );

                            return (
                                <article
                                    key={report.id}
                                    className={styles.reportItem}
                                >
                                    <div>
                                        <strong>
                                            {getReporterName(report)} ·{" "}
                                            {reasonNames[report.reason] ??
                                                report.reason}
                                        </strong>

                                        <p>
                                            {content.length > 130
                                                ? `${content.slice(0, 130)}…`
                                                : content}
                                        </p>
                                    </div>

                                    <div className={styles.reportMeta}>
                                        <span
                                            className={
                                                styles.reportStatus
                                            }
                                        >
                                            {statusNames[report.status] ??
                                                report.status}
                                        </span>

                                        <small>{formattedDate}</small>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span>İÇERİK TAKİBİ</span>

                        <h2>Konular ve Yorum Sayıları</h2>
                    </div>

                    <div className={styles.panelBadge}>
                        {topicSummaries.length} konu
                    </div>
                </div>

                {topicSummaries.length === 0 ? (
                    <div className={styles.emptyState}>
                        Henüz konu bulunmuyor.
                    </div>
                ) : (
                    <div className={styles.topicList}>
                        {topicSummaries.map((topic) => {
                            const formattedDate =
                                new Intl.DateTimeFormat(
                                    "tr-TR",
                                    {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    }
                                ).format(
                                    new Date(topic.created_at)
                                );

                            return (
                                <article
                                    key={topic.id}
                                    className={styles.topicItem}
                                >
                                    <div className={styles.topicMain}>
                                        <Link
                                            href={`/konu/${topic.id}`}
                                        >
                                            {topic.title}
                                        </Link>

                                        <small>
                                            {formattedDate} ·{" "}
                                            {topic.status === "published"
                                                ? "Yayında"
                                                : topic.status}
                                        </small>
                                    </div>

                                    <div
                                        className={
                                            styles.topicCommentCount
                                        }
                                    >
                                        <strong>
                                            {topic.comment_count ?? 0}
                                        </strong>

                                        <span>yorum</span>
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