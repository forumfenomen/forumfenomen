import Link from "next/link";

import TopicModerationActions from "@/components/admin/topic-moderation-actions";
import { createClient } from "@/lib/supabase/server";

import styles from "../admin.module.css";

type TopicStatus =
  | "published"
  | "hidden"
  | "banned";

type AdminTopic = {
  id: string;
  author_id: string | null;
  content_profile_id: string | null;
  author_source: "user" | "content_profile";
  author_display_name: string | null;
  author_username: string | null;
  category_id: number | string;
  title: string;
  content: string;
  status: TopicStatus;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number | string;
  comment_count: number | string;
  like_count: number | string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
};

type TopicFilter =
  | "all"
  | "published"
  | "hidden"
  | "banned";

type PageProps = {
  searchParams: Promise<{
    filter?: string;
    search?: string;
  }>;
};

const statusNames: Record<TopicStatus, string> = {
  published: "Yayında",
  hidden: "Gizlendi",
  banned: "Yasaklandı",
};

const filterOptions: Array<{
  value: TopicFilter;
  label: string;
}> = [
    {
      value: "all",
      label: "Tümü",
    },
    {
      value: "published",
      label: "Yayında",
    },
    {
      value: "hidden",
      label: "Gizlenenler",
    },
    {
      value: "banned",
      label: "Yasaklananlar",
    },
  ];

function isValidFilter(
  value: string | undefined
): value is TopicFilter {
  return filterOptions.some(
    (option) => option.value === value
  );
}

function getCount(value: number | string) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

function getAuthorName(topic: AdminTopic) {
  return (
    topic.author_display_name?.trim() ||
    topic.author_username
      ?.replace(/^@/, "")
      .trim() ||
    "Bilinmeyen kullanıcı"
  );
}

function getProfileHref(topic: AdminTopic) {
  const username =
    topic.author_username
      ?.replace(/^@/, "")
      .trim();

  if (username) {
    return `/profil/${username}`;
  }

  if (topic.author_source === "user" && topic.author_id) {
    return `/profil/${topic.author_id}`;
  }

  return "#";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function normalizeSearchValue(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .trim();
}

function matchesFilter(
  topic: AdminTopic,
  filter: TopicFilter
) {
  return (
    filter === "all" ||
    topic.status === filter
  );
}

function matchesSearch(
  topic: AdminTopic,
  search: string
) {
  if (!search) {
    return true;
  }

  const normalizedSearch =
    normalizeSearchValue(search);

  const searchableText = [
    topic.title,
    topic.content,
    topic.author_display_name,
    topic.author_username,
    String(topic.category_id),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return searchableText.includes(
    normalizedSearch
  );
}

function getTopicCount(
  topics: AdminTopic[],
  filter: TopicFilter
) {
  return topics.filter((topic) =>
    matchesFilter(topic, filter)
  ).length;
}

function getFilterHref(
  filter: TopicFilter,
  search: string
) {
  const params = new URLSearchParams();

  if (filter !== "all") {
    params.set("filter", filter);
  }

  if (search) {
    params.set("search", search);
  }

  const query = params.toString();

  return query
    ? `/admin/konular?${query}`
    : "/admin/konular";
}

export default async function AdminTopicsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const activeFilter: TopicFilter =
    isValidFilter(params.filter)
      ? params.filter
      : "all";

  const search =
    params.search?.trim() ?? "";

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "admin_list_topics",
    {
      p_limit: 300,
    }
  );

  if (error) {
    console.error(
      "Konular alınamadı:",
      error.message
    );
  }

  const topics =
    (data ?? []) as unknown as AdminTopic[];

  const filteredTopics = topics.filter(
    (topic) =>
      matchesFilter(
        topic,
        activeFilter
      ) &&
      matchesSearch(topic, search)
  );

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>KONU YÖNETİMİ</span>

          <h1>Konular</h1>

          <p>
            Forum konularını ara, incele, gizle,
            yasakla veya yeniden yayına al.
          </p>
        </div>

        <div className={styles.panelBadge}>
          {topics.length} konu
        </div>
      </header>

      <section className={styles.topicSummaryGrid}>
        <Link
          href={getFilterHref("all", search)}
          className={`${styles.topicSummaryCard} ${activeFilter === "all"
              ? styles.topicSummaryActive
              : ""
            }`}
        >
          <span>Toplam konu</span>

          <strong>{topics.length}</strong>
        </Link>

        <Link
          href={getFilterHref("published", search)}
          className={`${styles.topicSummaryCard} ${activeFilter === "published"
              ? styles.topicSummaryActive
              : ""
            }`}
        >
          <span>Yayında</span>

          <strong>
            {getTopicCount(topics, "published")}
          </strong>
        </Link>

        <Link
          href={getFilterHref("hidden", search)}
          className={`${styles.topicSummaryCard} ${activeFilter === "hidden"
              ? styles.topicSummaryActive
              : ""
            }`}
        >
          <span>Gizlenen</span>

          <strong>
            {getTopicCount(topics, "hidden")}
          </strong>
        </Link>

        <Link
          href={getFilterHref("banned", search)}
          className={`${styles.topicSummaryCard} ${activeFilter === "banned"
              ? styles.topicSummaryActive
              : ""
            }`}
        >
          <span>Yasaklanan</span>

          <strong>
            {getTopicCount(topics, "banned")}
          </strong>
        </Link>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>KONU LİSTESİ</span>

            <h2>Tüm Konular</h2>
          </div>

          <div className={styles.panelBadge}>
            {filteredTopics.length} kayıt
          </div>
        </div>

        <form
          className={styles.topicAdminSearch}
          method="get"
        >
          {activeFilter !== "all" ? (
            <input
              type="hidden"
              name="filter"
              value={activeFilter}
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

              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Konu başlığı, içerik veya kullanıcı ara..."
            />
          </div>

          <button type="submit">
            Ara
          </button>

          {search ? (
            <Link
              href={getFilterHref(
                activeFilter,
                ""
              )}
              className={
                styles.topicAdminSearchClear
              }
            >
              Temizle
            </Link>
          ) : null}
        </form>

        
        {filteredTopics.length === 0 ? (
          <div className={styles.emptyState}>
            Arama veya filtreyle eşleşen konu
            bulunamadı.
          </div>
        ) : (
          <div
            className={styles.adminTopicList}
          >
            {filteredTopics.map((topic) => (
              <article
                key={topic.id}
                className={styles.adminTopicRow}
              >
                <div
                  className={
                    styles.adminTopicContent
                  }
                >
                  <div
                    className={
                      styles.adminTopicTopLine
                    }
                  >
                    <div
                      className={
                        styles.adminTopicBadges
                      }
                    >
                      <span
                        className={`${styles.adminTopicStatus} ${topic.status ===
                            "published"
                            ? styles.adminTopicPublished
                            : topic.status ===
                              "hidden"
                              ? styles.adminTopicHidden
                              : styles.adminTopicBanned
                          }`}
                      >
                        {
                          statusNames[
                          topic.status
                          ]
                        }
                      </span>

                      {topic.is_pinned ? (
                        <span
                          className={
                            styles.adminTopicPinned
                          }
                        >
                          Sabitlenmiş
                        </span>
                      ) : null}

                      {topic.is_locked ? (
                        <span
                          className={
                            styles.adminTopicLocked
                          }
                        >
                          Kilitli
                        </span>
                      ) : null}

                      <span
                        className={
                          styles.adminTopicCategory
                        }
                      >
                        Kategori #{topic.category_id}
                      </span>
                    </div>

                    <time>
                      {formatDate(
                        topic.created_at
                      )}
                    </time>
                  </div>

                  <h3>{topic.title}</h3>

                  <p
                    className={
                      styles.adminTopicExcerpt
                    }
                  >
                    {topic.content}
                  </p>

                  <div
                    className={
                      styles.adminTopicMeta
                    }
                  >
                    <Link
                      href={getProfileHref(topic)}
                    >
                      {getAuthorName(topic)}

                      {topic.author_username
                        ? ` · @${topic.author_username.replace(
                          /^@/,
                          ""
                        )}`
                        : null}
                    </Link>

                    <span>
                      {getCount(
                        topic.view_count
                      )}{" "}
                      görüntülenme
                    </span>

                    <span>
                      {getCount(
                        topic.comment_count
                      )}{" "}
                      yorum
                    </span>

                    <span>
                      {getCount(
                        topic.like_count
                      )}{" "}
                      beğeni
                    </span>

                    <span>
                      Son hareket:{" "}
                      {formatDate(
                        topic.last_activity_at
                      )}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.adminTopicSide
                  }
                >
                  <Link
                    href={`/konu/${topic.id}`}
                    className={
                      styles.adminTopicViewLink
                    }
                  >
                    Konuya git
                  </Link>

                  <TopicModerationActions
                    topicId={topic.id}
                    topicTitle={topic.title}
                    currentStatus={topic.status}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}