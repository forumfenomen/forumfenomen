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
    search?: string;
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

function getActivityTypeLabel(
  activityType: string
) {
  if (activityType === "topic_created") {
    return "Konu";
  }

  if (activityType === "comment_created") {
    return "Yorum";
  }

  if (activityType === "user_followed") {
    return "Takip";
  }

  if (
    activityType.startsWith(
      "follow_request_"
    )
  ) {
    return "Takip isteği";
  }

  return "Etkinlik";
}

function getActivityListTitle(
  filter: string
) {
  switch (filter) {
    case "topics":
      return "Konu Etkinlikleri";

    case "comments":
      return "Yorum Etkinlikleri";

    case "follows":
      return "Takip Etkinlikleri";

    case "follow_requests":
      return "Takip İsteği Etkinlikleri";

    default:
      return "Etkinlik Akışı";
  }
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

  const searchText =
    params.search?.trim() ?? "";

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
      ? await supabase.rpc(
        "get_profile_summaries_by_ids",
        {
          p_profile_ids: profileIds,
        }
      )
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

  const normalizedSearchText =
    searchText.toLocaleLowerCase("tr-TR");

  const filteredActivities =
    activities.filter((activity) => {
      if (
        !matchesFilter(
          activity,
          activeFilter
        )
      ) {
        return false;
      }

      if (!normalizedSearchText) {
        return true;
      }

      const actor = activity.actor_id
        ? profileMap.get(activity.actor_id)
        : undefined;

      const target =
        activity.target_user_id
          ? profileMap.get(
            activity.target_user_id
          )
          : undefined;

      const searchableText = [
        activityNames[
        activity.activity_type
        ] ?? activity.activity_type,
        getActivityTypeLabel(
          activity.activity_type
        ),
        getDisplayName(actor),
        target
          ? getDisplayName(target)
          : "",
        activity.detail ?? "",
        activity.title ?? "",
        activity.status
          ? statusNames[
          activity.status
          ] ?? activity.status
          : "",
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return searchableText.includes(
        normalizedSearchText
      );
    });

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

        <div className={styles.securityBadge}>
          ● {activities.length} etkinlik
        </div>
      </header>

      <section className={styles.topicSummaryGrid}>

        <Link
          href="/admin/forum-etkinlikleri?filter=topics"
          className={`${styles.topicSummaryCard} ${activeFilter === "topics"
            ? styles.topicSummaryActive
            : ""
            }`}
        >
          <span>Konular</span>

          <strong>
            {getActivityCount(
              activities,
              "topics"
            )}
          </strong>
        </Link>

        <Link
          href="/admin/forum-etkinlikleri?filter=comments"
          className={`${styles.topicSummaryCard} ${activeFilter === "comments"
            ? styles.topicSummaryActive
            : ""
            }`}
        >
          <span>Yorumlar</span>

          <strong>
            {getActivityCount(
              activities,
              "comments"
            )}
          </strong>
        </Link>

        <Link
          href="/admin/forum-etkinlikleri?filter=follows"
          className={`${styles.topicSummaryCard} ${activeFilter === "follows"
            ? styles.topicSummaryActive
            : ""
            }`}
        >
          <span>Takipler</span>

          <strong>
            {getActivityCount(
              activities,
              "follows"
            )}
          </strong>
        </Link>

        <Link
          href="/admin/forum-etkinlikleri?filter=follow_requests"
          className={`${styles.topicSummaryCard} ${activeFilter ===
            "follow_requests"
            ? styles.topicSummaryActive
            : ""
            }`}
        >
          <span>Takip istekleri</span>

          <strong>
            {getActivityCount(
              activities,
              "follow_requests"
            )}
          </strong>
        </Link>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>ARAMA VE FİLTRE</span>

            <h2>Etkinlikleri Filtrele</h2>
          </div>


        </div>

        <form
          method="get"
          className={
            searchText
              ? `${styles.forumActivitySearch} ${styles.forumActivitySearchActive}`
              : styles.forumActivitySearch
          }
        >
          {activeFilter !== "all" ? (
            <input
              type="hidden"
              name="filter"
              value={activeFilter}
            />
          ) : null}

          <label
            className={
              styles.forumActivitySearchField
            }
          >
            <input
              type="search"
              name="search"
              defaultValue={searchText}
              placeholder="Kullanıcı, konu veya içerik ara..."
            />
          </label>

          {searchText ? (
            <Link
              href={
                activeFilter === "all"
                  ? "/admin/forum-etkinlikleri"
                  : `/admin/forum-etkinlikleri?filter=${activeFilter}`
              }
              className={
                styles.forumActivitySearchClear
              }
              aria-label="Aramayı temizle"
            >
              ×
            </Link>
          ) : null}

          <button
            type="submit"
            className={
              styles.forumActivitySearchButton
            }
          >
            Ara
          </button>
        </form>


      </section>

      <section className={styles.panel}>
        <div
          className={`${styles.panelHeader} ${styles.forumActivityListHeader}`}
        >
          <div>
            <span>DENETİM GÜNLÜĞÜ</span>

            <h2>
              {getActivityListTitle(activeFilter)}
            </h2>
          </div>

          <div className={styles.panelBadge}>
            {filteredActivities.length} kayıt
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className={styles.emptyState}>
            Bu filtreye uygun etkinlik bulunmuyor.
          </div>
        ) : (
          <div className={styles.forumActivityList}>
            {filteredActivities.map((activity) => {
              const actor =
                activity.actor_id
                  ? profileMap.get(activity.actor_id)
                  : undefined;

              const target =
                activity.target_user_id
                  ? profileMap.get(
                    activity.target_user_id
                  )
                  : undefined;

              return (
                <article
                  key={activity.activity_id}
                  className={styles.forumActivityRow}
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
                          activity.activity_type
                        ] ?? activity.activity_type}
                      </strong>

                      <div
                        className={
                          styles.forumActivityTopMeta
                        }
                      >
                        <span
                          className={
                            styles.forumActivityDate
                          }
                        >
                          {formatDate(
                            activity.created_at
                          )}
                        </span>

                        <span
                          className={
                            styles.forumActivityType
                          }
                        >
                          {getActivityTypeLabel(
                            activity.activity_type
                          )}
                        </span>
                      </div>
                    </div>

                    <p>
                      <b>{getDisplayName(actor)}</b>

                      {activity.detail
                        ? ` — ${activity.detail}`
                        : null}

                      {target ? (
                        <>
                          {" "}
                          <b>
                            {getDisplayName(target)}
                          </b>
                        </>
                      ) : null}
                    </p>

                    {activity.title ? (
                      <small>{activity.title}</small>
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
                        ] ?? activity.status}
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
            })}
          </div>
        )}
      </section>
    </>
  );
}