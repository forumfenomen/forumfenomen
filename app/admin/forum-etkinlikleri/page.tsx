import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import styles from "../admin.module.css";

type ForumActivity = {
  activity_id: string;
  activity_type: string;
  actor_id: string | null;
  target_user_id: string | null;
  topic_id: string | null;
  comment_id: string | null;
  title: string | null;
  detail: string | null;
  status: string | null;
  created_at: string;
};

type ProfileSummary = {
  id: string;
  display_name: string | null;
  username: string | null;
};

type ActivityFilter =
  | "all"
  | "topics"
  | "comments"
  | "follows"
  | "follow_requests";

type PageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

const activityNames: Record<string, string> = {
  topic_created: "Konu oluşturuldu",
  comment_created: "Yorum yapıldı",
  user_followed: "Kullanıcı takip edildi",
  follow_request_sent: "Takip isteği gönderildi",
  follow_request_accepted: "Takip isteği kabul edildi",
  follow_request_rejected: "Takip isteği reddedildi",
  follow_request_updated: "Takip isteği güncellendi",
};

const statusNames: Record<string, string> = {
  published: "Yayında",
  hidden: "Gizli",
  banned: "Yasaklandı",
  deleted: "Silindi",
  active: "Aktif",
  pending: "Bekliyor",
  accepted: "Kabul edildi",
  rejected: "Reddedildi",
};

const filterOptions: Array<{
  value: ActivityFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "Tümü",
  },
  {
    value: "topics",
    label: "Konular",
  },
  {
    value: "comments",
    label: "Yorumlar",
  },
  {
    value: "follows",
    label: "Takipler",
  },
  {
    value: "follow_requests",
    label: "Takip İstekleri",
  },
];

function getDisplayName(
  profile: ProfileSummary | undefined
) {
  return (
    profile?.display_name?.trim() ||
    profile?.username
      ?.replace(/^@/, "")
      .trim() ||
    "Bilinmeyen kullanıcı"
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function isValidFilter(
  value: string | undefined
): value is ActivityFilter {
  return filterOptions.some(
    (option) => option.value === value
  );
}

function matchesFilter(
  activity: ForumActivity,
  filter: ActivityFilter
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "topics") {
    return (
      activity.activity_type ===
      "topic_created"
    );
  }

  if (filter === "comments") {
    return (
      activity.activity_type ===
      "comment_created"
    );
  }

  if (filter === "follows") {
    return (
      activity.activity_type ===
      "user_followed"
    );
  }

  if (filter === "follow_requests") {
    return activity.activity_type.startsWith(
      "follow_request_"
    );
  }

  return true;
}

function getActivityCount(
  activities: ForumActivity[],
  filter: ActivityFilter
) {
  return activities.filter((activity) =>
    matchesFilter(activity, filter)
  ).length;
}

function getProfileHref(
  profile: ProfileSummary | undefined,
  userId: string
) {
  const username = profile?.username
    ?.replace(/^@/, "")
    .trim();

  return username
    ? `/profil/${username}`
    : `/profil/${userId}`;
}

export default async function AdminForumActivitiesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const activeFilter: ActivityFilter =
    isValidFilter(params.filter)
      ? params.filter
      : "all";

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "admin_list_forum_activities",
    {
      p_limit: 300,
    }
  );

  if (error) {
    console.error(
      "Forum etkinlikleri alınamadı:",
      error.message
    );
  }

  const activities =
    (data ?? []) as unknown as ForumActivity[];

  const filteredActivities =
    activities.filter((activity) =>
      matchesFilter(activity, activeFilter)
    );

  const profileIds = Array.from(
    new Set(
      activities
        .flatMap((activity) => [
          activity.actor_id,
          activity.target_user_id,
        ])
        .filter(
          (value): value is string =>
            Boolean(value)
        )
    )
  );

  const { data: profileData } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select(
            "id, display_name, username"
          )
          .in("id", profileIds)
      : { data: [] };

  const profileMap = new Map<
    string,
    ProfileSummary
  >(
    (
      (profileData ?? []) as ProfileSummary[]
    ).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>FORUM HAREKETLERİ</span>

          <h1>Forum Etkinlikleri</h1>

          <p>
            Konu, yorum, takip ve takip isteği
            hareketlerini tarih sırasıyla takip et.
          </p>
        </div>

        <div className={styles.panelBadge}>
          {activities.length} etkinlik
        </div>
      </header>

      <section
        className={
          styles.forumActivitySummaryGrid
        }
      >
        <article
          className={
            styles.forumActivitySummaryCard
          }
        >
          <span>Konular</span>

          <strong>
            {getActivityCount(
              activities,
              "topics"
            )}
          </strong>
        </article>

        <article
          className={
            styles.forumActivitySummaryCard
          }
        >
          <span>Yorumlar</span>

          <strong>
            {getActivityCount(
              activities,
              "comments"
            )}
          </strong>
        </article>

        <article
          className={
            styles.forumActivitySummaryCard
          }
        >
          <span>Takipler</span>

          <strong>
            {getActivityCount(
              activities,
              "follows"
            )}
          </strong>
        </article>

        <article
          className={
            styles.forumActivitySummaryCard
          }
        >
          <span>Takip istekleri</span>

          <strong>
            {getActivityCount(
              activities,
              "follow_requests"
            )}
          </strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>SON HAREKETLER</span>

            <h2>Etkinlik Akışı</h2>
          </div>

          <div className={styles.panelBadge}>
            {filteredActivities.length} kayıt
          </div>
        </div>

        <nav
          className={
            styles.forumActivityFilters
          }
          aria-label="Forum etkinliği filtreleri"
        >
          {filterOptions.map((option) => {
            const isActive =
              activeFilter === option.value;

            const href =
              option.value === "all"
                ? "/admin/forum-etkinlikleri"
                : `/admin/forum-etkinlikleri?filter=${option.value}`;

            return (
              <Link
                key={option.value}
                href={href}
                className={
                  isActive
                    ? `${styles.forumActivityFilterButton} ${styles.forumActivityFilterActive}`
                    : styles.forumActivityFilterButton
                }
              >
                <span>{option.label}</span>

                <strong>
                  {getActivityCount(
                    activities,
                    option.value
                  )}
                </strong>
              </Link>
            );
          })}
        </nav>

        {filteredActivities.length === 0 ? (
          <div className={styles.emptyState}>
            Bu filtreye uygun etkinlik
            bulunmuyor.
          </div>
        ) : (
          <div
            className={
              styles.forumActivityList
            }
          >
            {filteredActivities.map(
              (activity) => {
                const actor =
                  activity.actor_id
                    ? profileMap.get(
                        activity.actor_id
                      )
                    : undefined;

                const target =
                  activity.target_user_id
                    ? profileMap.get(
                        activity.target_user_id
                      )
                    : undefined;

                return (
                  <article
                    key={
                      activity.activity_id
                    }
                    className={
                      styles.forumActivityRow
                    }
                  >
                    <div
                      className={
                        styles.forumActivityMain
                      }
                    >
                      <div
                        className={
                          styles.forumActivityTopLine
                        }
                      >
                        <strong>
                          {activityNames[
                            activity
                              .activity_type
                          ] ??
                            activity.activity_type}
                        </strong>

                        <span>
                          {formatDate(
                            activity.created_at
                          )}
                        </span>
                      </div>

                      <p>
                        <b>
                          {getDisplayName(
                            actor
                          )}
                        </b>

                        {activity.detail
                          ? ` — ${activity.detail}`
                          : null}

                        {target ? (
                          <>
                            {" "}
                            <b>
                              {getDisplayName(
                                target
                              )}
                            </b>
                          </>
                        ) : null}
                      </p>

                      {activity.title ? (
                        <small>
                          {activity.title}
                        </small>
                      ) : null}
                    </div>

                    <div
                      className={
                        styles.forumActivityActions
                      }
                    >
                      {activity.status ? (
                        <span
                          className={
                            styles.forumActivityStatus
                          }
                        >
                          {statusNames[
                            activity.status
                          ] ??
                            activity.status}
                        </span>
                      ) : null}

                      {activity.topic_id ? (
                        <Link
                          href={`/konu/${activity.topic_id}`}
                          className={
                            styles.forumActivityLink
                          }
                        >
                          Konuya git
                        </Link>
                      ) : activity.actor_id ? (
                        <Link
                          href={getProfileHref(
                            actor,
                            activity.actor_id
                          )}
                          className={
                            styles.forumActivityLink
                          }
                        >
                          Profile git
                        </Link>
                      ) : null}
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