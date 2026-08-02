import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import styles from "../admin.module.css";

type BlogStatus =
  | "draft"
  | "published"
  | "archived";

type BlogContentProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: BlogStatus;
  is_featured: boolean;
  reading_time: number | string;
  view_count: number | string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  content_profile_id: string;
  content_profiles:
    | BlogContentProfile
    | BlogContentProfile[]
    | null;
};

type BlogFilter =
  | "all"
  | "published"
  | "draft"
  | "archived";

type PageProps = {
  searchParams: Promise<{
    filter?: string;
    search?: string;
  }>;
};

const statusNames: Record<BlogStatus, string> = {
  published: "Yayında",
  draft: "Taslak",
  archived: "Arşivlendi",
};

const filterOptions: Array<{
  value: BlogFilter;
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
    value: "draft",
    label: "Taslaklar",
  },
  {
    value: "archived",
    label: "Arşivlenenler",
  },
];

function isValidFilter(
  value: string | undefined
): value is BlogFilter {
  return filterOptions.some(
    (option) => option.value === value
  );
}

function normalizeSearchValue(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .trim();
}

function getNumber(value: number | string) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

function getContentProfile(
  post: BlogPostRow
): BlogContentProfile | null {
  if (Array.isArray(post.content_profiles)) {
    return post.content_profiles[0] ?? null;
  }

  return post.content_profiles;
}

function getAuthorName(post: BlogPostRow) {
  const profile = getContentProfile(post);

  return (
    profile?.display_name?.trim() ||
    profile?.username
      ?.replace(/^@/, "")
      .trim() ||
    "ForumFenomen Editör"
  );
}

function getAuthorUsername(post: BlogPostRow) {
  return getContentProfile(post)
    ?.username
    ?.replace(/^@/, "")
    .trim() ?? "";
}

function getAuthorHref(post: BlogPostRow) {
  const username = getAuthorUsername(post);

  return username
    ? `/icerik-profili/${username}`
    : "#";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Henüz yayınlanmadı";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function matchesFilter(
  post: BlogPostRow,
  filter: BlogFilter
) {
  return (
    filter === "all" ||
    post.status === filter
  );
}

function matchesSearch(
  post: BlogPostRow,
  search: string
) {
  if (!search) {
    return true;
  }

  const profile = getContentProfile(post);

  const searchableText = [
    post.title,
    post.slug,
    post.excerpt,
    post.category,
    profile?.display_name,
    profile?.username,
    statusNames[post.status],
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return searchableText.includes(
    normalizeSearchValue(search)
  );
}

function getBlogCount(
  posts: BlogPostRow[],
  filter: BlogFilter
) {
  return posts.filter((post) =>
    matchesFilter(post, filter)
  ).length;
}

function getFilterHref(
  filter: BlogFilter,
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
    ? `/admin/blog?${query}`
    : "/admin/blog";
}

function getStatusClass(
  status: BlogStatus
) {
  if (status === "published") {
    return styles.adminTopicPublished;
  }

  if (status === "archived") {
    return styles.adminTopicBanned;
  }

  return styles.adminTopicHidden;
}

export default async function AdminBlogPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const activeFilter: BlogFilter =
    isValidFilter(params.filter)
      ? params.filter
      : "all";

  const search =
    params.search?.trim() ?? "";

  const panelTitle =
    activeFilter === "published"
      ? "Yayındaki Blog Yazıları"
      : activeFilter === "draft"
        ? "Taslak Blog Yazıları"
        : activeFilter === "archived"
          ? "Arşivlenen Blog Yazıları"
          : "Tüm Blog Yazıları";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      status,
      is_featured,
      reading_time,
      view_count,
      published_at,
      created_at,
      updated_at,
      content_profile_id,
      content_profiles (
        id,
        display_name,
        username
      )
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(300);

  if (error) {
    console.error(
      "Blog yazıları alınamadı:",
      error.message
    );
  }

  const posts =
    (data ?? []) as unknown as BlogPostRow[];

  const filteredPosts = posts.filter(
    (post) =>
      matchesFilter(
        post,
        activeFilter
      ) &&
      matchesSearch(post, search)
  );

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>BLOG YÖNETİMİ</span>

          <h1>Blog Yazıları</h1>

          <p>
            Blog içeriklerini ara, düzenle,
            öne çıkar, yayınla veya arşivle.
          </p>
        </div>

        <Link
          href="/admin/blog/yeni"
          className={styles.newTopicButton}
        >
          <span aria-hidden="true">+</span>

          Yeni Blog Yazısı
        </Link>
      </header>

      <section className={styles.topicSummaryGrid}>
        <Link
          href={getFilterHref("all", search)}
          className={`${styles.topicSummaryCard} ${
            activeFilter === "all"
              ? styles.topicSummaryActive
              : ""
          }`}
        >
          <span>Toplam yazı</span>

          <strong>{posts.length}</strong>
        </Link>

        <Link
          href={getFilterHref(
            "published",
            search
          )}
          className={`${styles.topicSummaryCard} ${
            activeFilter === "published"
              ? styles.topicSummaryActive
              : ""
          }`}
        >
          <span>Yayında</span>

          <strong>
            {getBlogCount(
              posts,
              "published"
            )}
          </strong>
        </Link>

        <Link
          href={getFilterHref("draft", search)}
          className={`${styles.topicSummaryCard} ${
            activeFilter === "draft"
              ? styles.topicSummaryActive
              : ""
          }`}
        >
          <span>Taslak</span>

          <strong>
            {getBlogCount(posts, "draft")}
          </strong>
        </Link>

        <Link
          href={getFilterHref(
            "archived",
            search
          )}
          className={`${styles.topicSummaryCard} ${
            activeFilter === "archived"
              ? styles.topicSummaryActive
              : ""
          }`}
        >
          <span>Arşivlenen</span>

          <strong>
            {getBlogCount(
              posts,
              "archived"
            )}
          </strong>
        </Link>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>BLOG LİSTESİ</span>

            <h2>{panelTitle}</h2>
          </div>

          <div
            className={`${styles.panelBadge} ${styles.topicCountBadge}`}
          >
            {filteredPosts.length} yazı
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
              placeholder="Başlık, kategori, yazar veya içerik ara..."
            />
          </div>

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

          <button
            type="submit"
            className={styles.topicSearchButton}
          >
            Ara
          </button>
        </form>

        {filteredPosts.length === 0 ? (
          <div className={styles.emptyState}>
            Arama veya filtreyle eşleşen blog
            yazısı bulunamadı.
          </div>
        ) : (
          <div
            className={styles.adminTopicList}
          >
            {filteredPosts.map((post) => (
              <article
                key={post.id}
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
                        className={`${styles.adminTopicStatus} ${getStatusClass(
                          post.status
                        )}`}
                      >
                        {statusNames[post.status]}
                      </span>

                      {post.is_featured ? (
                        <span
                          className={
                            styles.adminTopicPinned
                          }
                        >
                          Öne çıkan
                        </span>
                      ) : null}

                      <span
                        className={
                          styles.adminTopicCategory
                        }
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <h3>{post.title}</h3>

                  <p
                    className={
                      styles.adminTopicExcerpt
                    }
                  >
                    {post.excerpt ||
                      "Bu yazı için kısa açıklama eklenmemiş."}
                  </p>

                  <div
                    className={
                      styles.adminTopicMeta
                    }
                  >
                    <Link
                      href={getAuthorHref(post)}
                    >
                      {getAuthorName(post)}

                      {getAuthorUsername(post)
                        ? ` · @${getAuthorUsername(
                            post
                          )}`
                        : null}
                    </Link>

                    <span>
                      {getNumber(
                        post.view_count
                      )}{" "}
                      görüntülenme
                    </span>

                    <span>
                      {getNumber(
                        post.reading_time
                      )}{" "}
                      dk okuma
                    </span>

                    <span>
                      Güncelleme:{" "}
                      {formatDate(
                        post.updated_at
                      )}
                    </span>
                  </div>
                </div>

                <div
                  className={styles.adminTopicSide}
                >
                  {post.status ===
                  "published" ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className={
                        styles.adminTopicViewLink
                      }
                    >
                      Yazıyı aç
                    </Link>
                  ) : null}

                  <Link
                    href={`/admin/blog/${post.id}`}
                    className={
                      styles.adminTopicViewLink
                    }
                  >
                    Düzenle
                  </Link>

                  <time>
                    {formatDate(
                      post.published_at ??
                        post.created_at
                    ).replace(
                      / (\d{2}:\d{2})$/,
                      "\n$1"
                    )}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}