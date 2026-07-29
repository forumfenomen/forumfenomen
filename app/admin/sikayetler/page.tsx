import Link from "next/link";

import ReportModerationActions from "@/components/admin/report-moderation-actions";
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
  status: string;
  author_id: string;
};

type ReportComment = {
  id: string;
  content: string;
  status: string;
  topic_id: string;
  author_id: string;
};

type CommentReportRow = {
  id: string;
  reporter_id: string;
  comment_id: string;
  reason: string;
  details: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  created_at: string;
  reported_comment: ReportComment | null;
};

type TopicReportRow = {
  id: string;
  reporter_id: string;
  topic_id: string;
  reason: string;
  details: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  created_at: string;
};

type AdminReport = {
  id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  created_at: string;
  reportType: "comment" | "topic";
  topic_id: string | null;
  reported_comment: ReportComment | null;
};

type ReportFilter =
  | "all"
  | "pending"
  | "reviewing"
  | "resolved"
  | "dismissed";

const reasonNames: Record<string, string> = {
  spam: "Spam",
  harassment: "Taciz veya zorbalık",
  hate: "Nefret söylemi",
  illegal: "Yasadışı içerik",
  personal_information:
    "Kişisel bilgi paylaşımı",
  other: "Diğer",
};

const statusNames: Record<string, string> = {
  open: "Bekliyor",
  pending: "Bekliyor",
  reviewing: "İnceleniyor",
  resolved: "İhlal doğrulandı",
  dismissed: "Reddedildi",
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

function isPendingStatus(status: string) {
  return (
    status === "pending" ||
    status === "open"
  );
}

function getStatusClass(status: string) {
  if (status === "reviewing") {
    return styles.reportStatusReviewing;
  }

  if (status === "resolved") {
    return styles.reportStatusResolved;
  }

  if (status === "dismissed") {
    return styles.reportStatusDismissed;
  }

  return styles.reportStatusPending;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    durum?: string;
  }>;
}) {
  const resolvedSearchParams =
    await searchParams;

  const requestedFilter =
    resolvedSearchParams.durum;

  const activeFilter: ReportFilter =
    requestedFilter === "pending" ||
    requestedFilter === "reviewing" ||
    requestedFilter === "resolved" ||
    requestedFilter === "dismissed"
      ? requestedFilter
      : "all";

  const supabase = await createClient();

  const [
    commentReportsResult,
    topicReportsResult,
  ] = await Promise.all([
    supabase
      .from("comment_reports")
      .select(`
        id,
        reporter_id,
        comment_id,
        reason,
        details,
        status,
        reviewed_by,
        reviewed_at,
        resolution_note,
        created_at,
        reported_comment:topic_comments!comment_reports_comment_id_fkey (
          id,
          content,
          status,
          topic_id,
          author_id
        )
      `)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("topic_reports")
      .select(`
        id,
        reporter_id,
        topic_id,
        reason,
        details,
        status,
        reviewed_by,
        reviewed_at,
        resolution_note,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (commentReportsResult.error) {
    console.error(
      "Yorum şikâyetleri alınamadı:",
      commentReportsResult.error.message
    );
  }

  if (topicReportsResult.error) {
    console.error(
      "Konu şikâyetleri alınamadı:",
      topicReportsResult.error.message
    );
  }

  const commentReports =
    (commentReportsResult.data ??
      []) as unknown as CommentReportRow[];

  const topicReports =
    (topicReportsResult.data ??
      []) as unknown as TopicReportRow[];

  const reports: AdminReport[] = [
    ...commentReports.map(
      (report): AdminReport => ({
        id: report.id,
        reporter_id: report.reporter_id,
        reason: report.reason,
        details: report.details,
        status: report.status,
        reviewed_by: report.reviewed_by,
        reviewed_at: report.reviewed_at,
        resolution_note:
          report.resolution_note,
        created_at: report.created_at,
        reportType: "comment",
        topic_id:
          report.reported_comment
            ?.topic_id ?? null,
        reported_comment:
          report.reported_comment,
      })
    ),

    ...topicReports.map(
      (report): AdminReport => ({
        id: report.id,
        reporter_id: report.reporter_id,
        reason: report.reason,
        details: report.details,
        status: report.status,
        reviewed_by: report.reviewed_by,
        reviewed_at: report.reviewed_at,
        resolution_note:
          report.resolution_note,
        created_at: report.created_at,
        reportType: "topic",
        topic_id: report.topic_id,
        reported_comment: null,
      })
    ),
  ].sort(
    (firstReport, secondReport) =>
      new Date(
        secondReport.created_at
      ).getTime() -
      new Date(
        firstReport.created_at
      ).getTime()
  );

  const topicIds = Array.from(
    new Set(
      reports
        .map((report) => report.topic_id)
        .filter(
          (id): id is string =>
            typeof id === "string"
        )
    )
  );

  let topics: TopicSummary[] = [];

  if (topicIds.length > 0) {
    const topicsResult = await supabase
      .from("topics")
      .select(`
        id,
        title,
        status,
        author_id
      `)
      .in("id", topicIds);

    if (topicsResult.error) {
      console.error(
        "Şikâyet konuları alınamadı:",
        topicsResult.error.message
      );
    }

    topics =
      (topicsResult.data ??
        []) as TopicSummary[];
  }

  const topicMap = new Map(
    topics.map((topic) => [
      topic.id,
      topic,
    ])
  );

  const profileIds = Array.from(
    new Set(
      reports.flatMap((report) => {
        const topic = report.topic_id
          ? topicMap.get(report.topic_id)
          : undefined;

        const ids = [
          report.reporter_id,
          report.reviewed_by,
          report.reported_comment
            ?.author_id,
          topic?.author_id,
        ];

        return ids.filter(
          (id): id is string =>
            typeof id === "string"
        );
      })
    )
  );

  let profiles: ProfileSummary[] = [];

  if (profileIds.length > 0) {
    const profilesResult = await supabase
      .from("public_profiles")
      .select(`
        id,
        display_name,
        username
      `)
      .in("id", profileIds);

    if (profilesResult.error) {
      console.error(
        "Şikâyet kullanıcıları alınamadı:",
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

  const pendingCount = reports.filter(
    (report) =>
      isPendingStatus(report.status)
  ).length;

  const reviewingCount = reports.filter(
    (report) =>
      report.status === "reviewing"
  ).length;

  const resolvedCount = reports.filter(
    (report) =>
      report.status === "resolved"
  ).length;

  const dismissedCount = reports.filter(
    (report) =>
      report.status === "dismissed"
  ).length;

  const filteredReports =
    activeFilter === "all"
      ? reports
      : reports.filter((report) =>
          activeFilter === "pending"
            ? isPendingStatus(
                report.status
              )
            : report.status ===
              activeFilter
        );

  const reportFilters = [
    {
      value: "all",
      label: "Tümü",
      count: reports.length,
      href: "/admin/sikayetler",
    },
    {
      value: "pending",
      label: "Bekleyen",
      count: pendingCount,
      href: "/admin/sikayetler?durum=pending",
    },
    {
      value: "reviewing",
      label: "İncelenen",
      count: reviewingCount,
      href: "/admin/sikayetler?durum=reviewing",
    },
    {
      value: "resolved",
      label: "İhlal doğrulandı",
      count: resolvedCount,
      href: "/admin/sikayetler?durum=resolved",
    },
    {
      value: "dismissed",
      label: "Reddedilen",
      count: dismissedCount,
      href: "/admin/sikayetler?durum=dismissed",
    },
  ] as const;

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>MODERASYON MERKEZİ</span>

          <h1>Şikâyetler</h1>

          <p>
            Yorum ve konu şikâyetlerini
            incele, sonuçlandır veya reddet.
          </p>
        </div>

        <div className={styles.securityBadge}>
          ● Yetkili erişimi
        </div>
      </header>

      <nav
        className={styles.reportSummaryGrid}
        aria-label="Şikâyet filtreleri"
      >
        {reportFilters
          .filter(
            (filter) =>
              filter.value !== "all"
          )
          .map((filter) => (
            <Link
              key={filter.value}
              href={filter.href}
              className={[
                styles.reportSummaryCard,
                activeFilter ===
                filter.value
                  ? styles.reportSummaryCardActive
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{filter.label}</span>

              <strong>{filter.count}</strong>
            </Link>
          ))}
      </nav>

      {activeFilter !== "all" ? (
        <div
          className={
            styles.reportFilterReset
          }
        >
          <Link href="/admin/sikayetler">
            Tüm şikâyetleri göster
          </Link>
        </div>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>
              {activeFilter === "pending"
                ? "BEKLEYEN KAYITLAR"
                : activeFilter ===
                    "reviewing"
                  ? "İNCELEMEDEKİ KAYITLAR"
                  : activeFilter ===
                      "resolved"
                    ? "DOĞRULANAN İHLALLER"
                    : activeFilter ===
                        "dismissed"
                      ? "REDDEDİLEN KAYITLAR"
                      : "ŞİKÂYET KAYITLARI"}
            </span>

            <h2>
              {activeFilter === "pending"
                ? "Bekleyen Şikâyetler"
                : activeFilter ===
                    "reviewing"
                  ? "İncelenen Şikâyetler"
                  : activeFilter ===
                      "resolved"
                    ? "İhlali Doğrulanan Şikâyetler"
                    : activeFilter ===
                        "dismissed"
                      ? "Reddedilen Şikâyetler"
                      : "Tüm Şikâyetler"}
            </h2>
          </div>

          <div className={styles.panelBadge}>
            {filteredReports.length} kayıt
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className={styles.emptyState}>
            Bu filtreye uygun şikâyet
            bulunmuyor.
          </div>
        ) : (
          <div
            className={
              styles.adminReportList
            }
          >
            {filteredReports.map(
              (report) => {
                const comment =
                  report.reported_comment;

                const topic =
                  report.topic_id
                    ? topicMap.get(
                        report.topic_id
                      )
                    : undefined;

                const reporter =
                  profileMap.get(
                    report.reporter_id
                  );

                const contentAuthorId =
                  report.reportType ===
                  "comment"
                    ? comment?.author_id
                    : topic?.author_id;

                const contentAuthor =
                  contentAuthorId
                    ? profileMap.get(
                        contentAuthorId
                      )
                    : undefined;

                const reviewer =
                  report.reviewed_by
                    ? profileMap.get(
                        report.reviewed_by
                      )
                    : undefined;

                return (
                  <article
                    key={`${report.reportType}-${report.id}`}
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
                          {report.reportType ===
                          "topic"
                            ? "KONU ŞİKÂYETİ"
                            : "YORUM ŞİKÂYETİ"}
                          {" · "}
                          {reasonNames[
                            report.reason
                          ] ?? report.reason}
                        </span>

                        <strong>
                          Şikâyet eden:{" "}
                          {getProfileName(
                            reporter
                          )}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.adminReportTopMeta
                        }
                      >
                        <span
                          className={`${styles.adminReportStatus} ${getStatusClass(
                            report.status
                          )}`}
                        >
                          {statusNames[
                            report.status
                          ] ?? report.status}
                        </span>

                        <small>
                          {formatDate(
                            report.created_at
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
                        <span>
                          {report.reportType ===
                          "topic"
                            ? "Şikâyet edilen konu"
                            : "Şikâyet edilen yorum"}
                        </span>

                        <strong>
                          {getProfileName(
                            contentAuthor
                          )}
                        </strong>
                      </div>

                      <p>
                        {report.reportType ===
                        "topic"
                          ? topic?.title ??
                            "Konu bulunamadı."
                          : comment?.content ??
                            "Yorum içeriği bulunamadı."}
                      </p>

                      {topic ? (
                        <Link
                          href={`/konu/${topic.id}`}
                          className={
                            styles.reportTopicLink
                          }
                        >
                          {report.reportType ===
                          "topic"
                            ? "Konuyu aç"
                            : `Konuya git: ${topic.title}`}
                        </Link>
                      ) : null}
                    </div>

                    {report.details ? (
                      <div
                        className={
                          styles.reportDetailsBox
                        }
                      >
                        <span>
                          Kullanıcının açıklaması
                        </span>

                        <p>
                          {report.details}
                        </p>
                      </div>
                    ) : null}

                    {report.resolution_note ? (
                      <div
                        className={
                          styles.reportResolutionBox
                        }
                      >
                        <span>
                          Yönetici işlem notu
                        </span>

                        <p>
                          {
                            report.resolution_note
                          }
                        </p>

                        <small>
                          {reviewer
                            ? `İşlemi yapan: ${getProfileName(
                                reviewer
                              )}`
                            : "Yetkili kullanıcı"}

                          {report.reviewed_at
                            ? ` · ${formatDate(
                                report.reviewed_at
                              )}`
                            : ""}
                        </small>
                      </div>
                    ) : null}

                    <div
                      className={
                        styles.adminReportFooter
                      }
                    >
                      <span>
                        {report.reportType ===
                        "topic"
                          ? "Konu durumu"
                          : "Yorum durumu"}
                        :{" "}
                        {report.reportType ===
                        "topic"
                          ? topic?.status ??
                            "bulunamadı"
                          : comment?.status ??
                            "bulunamadı"}
                      </span>

                      <ReportModerationActions
                        reportId={report.id}
                        status={report.status}
                        reportType={
                          report.reportType
                        }
                      />
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );
}