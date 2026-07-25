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
};

type ReportComment = {
  id: string;
  content: string;
  status: string;
  topic_id: string;
  author_id: string;
};

type AdminReport = {
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
  reported_comment:
    | ReportComment
    | null;
};

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

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    });

  if (error) {
    console.error(
      "Şikâyetler alınamadı:",
      error.message
    );
  }

  const reports =
    (data ?? []) as unknown as AdminReport[];

  const profileIds = Array.from(
    new Set(
      reports.flatMap((report) => {
        const ids = [
          report.reporter_id,
          report.reviewed_by,
          report.reported_comment
            ?.author_id,
        ];

        return ids.filter(
          (id): id is string =>
            typeof id === "string"
        );
      })
    )
  );

  const topicIds = Array.from(
    new Set(
      reports
        .map(
          (report) =>
            report.reported_comment
              ?.topic_id
        )
        .filter(
          (id): id is string =>
            typeof id === "string"
        )
    )
  );

  let profiles: ProfileSummary[] = [];
  let topics: TopicSummary[] = [];

  if (profileIds.length > 0) {
    const profilesResult = await supabase
      .from("profiles")
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
        "Şikâyet konuları alınamadı:",
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

  const topicMap = new Map(
    topics.map((topic) => [
      topic.id,
      topic,
    ])
  );

  const pendingCount = reports.filter(
    (report) =>
      report.status === "pending"
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

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>MODERASYON MERKEZİ</span>

          <h1>Şikâyetler</h1>

          <p>
            Kullanıcı şikâyetlerini incele,
            sonuçlandır veya reddet.
          </p>
        </div>

        <div className={styles.securityBadge}>
          ● Yetkili erişimi
        </div>
      </header>

      <section
        className={
          styles.reportSummaryGrid
        }
      >
        <article
          className={
            styles.reportSummaryCard
          }
        >
          <span>Bekleyen</span>
          <strong>{pendingCount}</strong>
        </article>

        <article
          className={
            styles.reportSummaryCard
          }
        >
          <span>İncelenen</span>
          <strong>{reviewingCount}</strong>
        </article>

        <article
          className={
            styles.reportSummaryCard
          }
        >
          <span>İhlal doğrulandı</span>
          <strong>{resolvedCount}</strong>
        </article>

        <article
          className={
            styles.reportSummaryCard
          }
        >
          <span>Reddedilen</span>
          <strong>{dismissedCount}</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>ŞİKÂYET KAYITLARI</span>

            <h2>Tüm Şikâyetler</h2>
          </div>

          <div className={styles.panelBadge}>
            {reports.length} kayıt
          </div>
        </div>

        {reports.length === 0 ? (
          <div className={styles.emptyState}>
            Henüz şikâyet bulunmuyor.
          </div>
        ) : (
          <div
            className={
              styles.adminReportList
            }
          >
            {reports.map((report) => {
              const comment =
                report.reported_comment;

              const reporter =
                profileMap.get(
                  report.reporter_id
                );

              const commentAuthor =
                comment
                  ? profileMap.get(
                      comment.author_id
                    )
                  : undefined;

              const reviewer =
                report.reviewed_by
                  ? profileMap.get(
                      report.reviewed_by
                    )
                  : undefined;

              const topic =
                comment
                  ? topicMap.get(
                      comment.topic_id
                    )
                  : undefined;

              return (
                <article
                  key={report.id}
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
                        Şikâyet edilen yorum
                      </span>

                      <strong>
                        {getProfileName(
                          commentAuthor
                        )}
                      </strong>
                    </div>

                    <p>
                      {comment?.content ??
                        "Yorum içeriği bulunamadı."}
                    </p>

                    {topic ? (
                      <Link
                        href={`/konu/${topic.id}`}
                        className={
                          styles.reportTopicLink
                        }
                      >
                        Konuya git:{" "}
                        {topic.title}
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

                      <p>{report.details}</p>
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
                        {report.resolution_note}
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
                      Yorum durumu:{" "}
                      {comment?.status ??
                        "bulunamadı"}
                    </span>

                    <ReportModerationActions
                      reportId={report.id}
                      status={report.status}
                    />
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