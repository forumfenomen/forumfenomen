"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  getForumLanguage,
  setForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";

import {
  blogPosts,
  type BlogCategory,
  type BlogPost,
} from "@/data/blog-posts";

import styles from "./page.module.css";

type Theme = "dark" | "light";
type CategoryFilter = "all" | BlogCategory;

const text = {
  tr: {
    eyebrow: "ForumFenomen Blog",
    title: "Fikirden etkiye uzanan dijital rehberler.",
    description:
      "İçerik üretimi, büyüme, platformlar, para kazanma ve dijital dünyanın kuralları hakkında derinlemesine içerikler.",
    featured: "Öne Çıkanlar",
    latest: "Son Eklenen Yazılar",
    quick: "5 Dakikada Öğren",
    editor: "ForumFenomen Seçkisi",
    read: "Devamını Oku",
    minutes: "dk okuma",
    adLabel: "REKLAM",
    adTitle: "Markanız burada görünsün ister misiniz?",
    adDescription:
      "ForumFenomen reklam alanında hedef kitlenize ulaşın.",
    advertise: "Reklam Ver",
    searchPlaceholder: "Blog yazılarında ara...",
    noResults: "Aramanızla eşleşen yazı bulunamadı.",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    createTopic: "Konu Oluştur",
    blog: "Blog",
    profile: "Profil",
    theme: "Temayı değiştir",
    notifications: "Bildirimler",
    search: "Ara",
    categoryNames: {
      all: "Tümü",
      platforms: "Platformlar",
      content: "İçerik Üretimi",
      growth: "Büyüme",
      money: "Para Kazanma",
      education: "Eğitim",
      legal: "Yasal Mevzuat",
    },
  },
  en: {
    eyebrow: "ForumFenomen Blog",
    title: "Digital guides from ideas to influence.",
    description:
      "In-depth content about creation, growth, platforms, monetization and the rules of the digital world.",
    featured: "Featured",
    latest: "Latest Articles",
    quick: "Learn in 5 Minutes",
    editor: "ForumFenomen Selection",
    read: "Read More",
    minutes: "min read",
    adLabel: "ADVERTISEMENT",
    adTitle: "Would you like your brand to appear here?",
    adDescription:
      "Reach your target audience in ForumFenomen advertising spaces.",
    advertise: "Advertise",
    searchPlaceholder: "Search blog articles...",
    noResults: "No articles matched your search.",
    home: "Home",
    categories: "Categories",
    createTopic: "Create Topic",
    blog: "Blog",
    profile: "Profile",
    theme: "Change theme",
    notifications: "Notifications",
    search: "Search",
    categoryNames: {
      all: "All",
      platforms: "Platforms",
      content: "Content Creation",
      growth: "Growth",
      money: "Monetization",
      education: "Education",
      legal: "Legal Regulations",
    },
  },
} as const;

const categoryOrder: CategoryFilter[] = [
  "all",
  "platforms",
  "content",
  "growth",
  "money",
  "education",
  "legal",
];

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}


function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 10v10h13V10" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h5" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M4.5 21c.7-5 3.2-7 7.5-7s6.8 2 7.5 7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function Cover({
  post,
  large = false,
}: {
  post: BlogPost;
  large?: boolean;
}) {
  return (
    <div
      className={
        large
          ? `${styles.cover} ${styles.coverLarge}`
          : styles.cover
      }
      style={
        {
          "--accent": post.accent,
        } as CSSProperties
      }
    >
      <span className={styles.coverGrid} />
      <span className={styles.coverOrbOne} />
      <span className={styles.coverOrbTwo} />
      <span className={styles.coverMark}>BLOG</span>
    </div>
  );
}

function ArticleMeta({
  post,
  language,
}: {
  post: BlogPost;
  language: ForumLanguage;
}) {
  const t = text[language];

  return (
    <div className={styles.articleMeta}>
      <span>{post.author}</span>

      <span className={styles.metaDot} />

      <span>
        <ClockIcon />
        {post.readMinutes} {t.minutes}
      </span>
    </div>
  );
}

function ArticleCard({
  post,
  language,
}: {
  post: BlogPost;
  language: ForumLanguage;
}) {
  const t = text[language];

  return (
    <article
      data-blog-id={post.id}
      className={styles.articleCard}
    >
      <Cover post={post} />

      <div className={styles.articleCardBody}>
        <span
          className={styles.categoryBadge}
          style={
            {
              "--accent": post.accent,
            } as CSSProperties
          }
        >
          {
            t.categoryNames[
            post.category
            ]
          }
        </span>

        <h3>{post.title[language]}</h3>

        <p>{post.excerpt[language]}</p>

        <ArticleMeta
          post={post}
          language={language}
        />

        <button type="button" className={styles.readButton}>
          {t.read}
          <ArrowIcon />
        </button>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [category, setCategory] =
    useState<CategoryFilter>("all");


  useEffect(() => {
    const savedLanguage =
      getForumLanguage();

    setLanguage(savedLanguage);
    setForumLanguage(savedLanguage);

    const savedTheme =
      window.localStorage.getItem(
        "forumfenomen-theme"
      );

    const resolvedTheme: Theme =
      savedTheme === "light"
        ? "light"
        : "dark";

    setTheme(resolvedTheme);

    document.documentElement.dataset.theme =
      resolvedTheme;
  }, []);

  useEffect(() => {
    function scrollToBlogPost() {
      const prefix = "#blog-";
      const hash = window.location.hash;

      if (!hash.startsWith(prefix)) {
        return;
      }

      const postId = decodeURIComponent(
        hash.slice(prefix.length)
      );

      window.requestAnimationFrame(() => {
        const target =
          document.querySelector<HTMLElement>(
            `[data-blog-id="${CSS.escape(postId)}"]`
          );

        target?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }

    scrollToBlogPost();

    window.addEventListener(
      "hashchange",
      scrollToBlogPost
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        scrollToBlogPost
      );
    };
  }, []);

  const t = text[language];

  const featuredMain =
    blogPosts.find(
      (post) => post.featured === "main"
    ) ?? blogPosts[0];

  const featuredSide =
    blogPosts
      .filter(
        (post) =>
          post.featured === "side"
      )
      .slice(0, 2);

  const filteredPosts =
    category === "all"
      ? blogPosts
      : blogPosts.filter(
        (post) =>
          post.category === category
      );

  const latestPosts =
    filteredPosts
      .filter(
        (post) => !post.quickRead
      )
      .slice(0, 6);

  const quickPosts =
    blogPosts
      .filter(
        (post) => post.quickRead
      )
      .slice(0, 4);

  const editorPosts =
    blogPosts
      .filter(
        (post) => post.editorPick
      )
      .slice(0, 4);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(nextTheme);

    document.documentElement.dataset.theme =
      nextTheme;

    window.localStorage.setItem(
      "forumfenomen-theme",
      nextTheme
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className="ff-feed-header">
          <Link
            href="/akis"
            className="ff-feed-logo-wrap"
            aria-label="ForumFenomen"
          >
            <Image
              className="ff-feed-logo"
              src="/forumfenomen-logo-transparent.png"
              alt="ForumFenomen"
              width={460}
              height={140}
              priority
            />
          </Link>

          <div className="ff-feed-header-actions">
            <button
              type="button"
              className="ff-round-action"
              onClick={toggleTheme}
              aria-label={t.theme}
            >
              {theme === "dark" ? (
                <MoonIcon />
              ) : (
                <SunIcon />
              )}
            </button>

            <NotificationBell />

            <SiteSearch language={language} />

          </div>
        </header>


        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              {t.eyebrow}
            </span>

            <h1>{t.title}</h1>

            <p>{t.description}</p>
          </div>

          <div
            className={styles.heroArtwork}
            aria-hidden="true"
          >
            <span className={styles.paperOne} />
            <span className={styles.paperTwo} />
            <span className={styles.paperThree} />
            <span className={styles.heroSparkOne} />
            <span className={styles.heroSparkTwo} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>{t.featured}</h2>
          </div>

          <div className={styles.featuredGrid}>
            <article
              data-blog-id={featuredMain.id}
              className={styles.featuredMain}
            >
              <Cover
                post={featuredMain}
                large
              />

              <div className={styles.featuredOverlay}>
                <span
                  className={styles.categoryBadge}
                  style={
                    {
                      "--accent":
                        featuredMain.accent,
                    } as CSSProperties
                  }
                >
                  {
                    t.categoryNames[
                    featuredMain.category
                    ]
                  }
                </span>

                <h2>
                  {
                    featuredMain.title[
                    language
                    ]
                  }
                </h2>

                <p>
                  {
                    featuredMain.excerpt[
                    language
                    ]
                  }
                </p>

                <ArticleMeta
                  post={featuredMain}
                  language={language}
                />

                <button
                  type="button"
                  className={styles.featuredButton}
                >
                  {t.read}
                  <ArrowIcon />
                </button>
              </div>
            </article>

            <div className={styles.featuredSide}>
              {featuredSide.map((post) => (
                <article
                  key={post.id}
                  data-blog-id={post.id}
                  className={styles.sideCard}
                >
                  <Cover post={post} />

                  <div>
                    <span
                      className={styles.categoryBadge}
                      style={
                        {
                          "--accent":
                            post.accent,
                        } as CSSProperties
                      }
                    >
                      {
                        t.categoryNames[
                        post.category
                        ]
                      }
                    </span>

                    <h3>
                      {post.title[language]}
                    </h3>

                    <ArticleMeta
                      post={post}
                      language={language}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.categoryScroller}>
          {categoryOrder.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item
                  ? styles.categoryActive
                  : ""
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {t.categoryNames[item]}
            </button>
          ))}
        </div>

        <aside className={styles.adBanner}>
          <div>
            <span>{t.adLabel}</span>
            <h2>{t.adTitle}</h2>
            <p>{t.adDescription}</p>
          </div>

          <button type="button">
            {t.advertise}
          </button>
        </aside>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>{t.latest}</h2>
          </div>

          {latestPosts.length > 0 ? (
            <div className={styles.articleGrid}>
              {latestPosts.map((post) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <SearchIcon />
              <p>{t.noResults}</p>
            </div>
          )}
        </section>

        <section className={styles.quickSection}>
          <div className={styles.sectionHeading}>
            <h2>{t.quick}</h2>
          </div>

          <div className={styles.quickGrid}>
            {quickPosts.map(
              (post, index) => (
                <article
                  key={post.id}
                  data-blog-id={post.id}
                  className={styles.quickCard}
                  style={
                    {
                      "--accent":
                        post.accent,
                    } as CSSProperties
                  }
                >
                  <span className={styles.quickNumber}>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <div>
                    <span>
                      {
                        t.categoryNames[
                        post.category
                        ]
                      }
                    </span>

                    <h3>
                      {post.title[language]}
                    </h3>

                    <small>
                      {post.readMinutes}{" "}
                      {t.minutes}
                    </small>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        <section className={styles.editorSection}>
          <div className={styles.editorHeading}>
            <span className={styles.editorLogo}>
              <Image
                src="/forumfenomen-icon-master.png"
                alt=""
                fill
                sizes="46px"
              />
            </span>

            <div>
              <small>FORUMFENOMEN</small>
              <h2>{t.editor}</h2>
            </div>
          </div>

          <div className={styles.editorGrid}>
            {editorPosts.map((post) => (
              <article
                key={post.id}
                data-blog-id={post.id}
                style={
                  {
                    "--accent":
                      post.accent,
                  } as CSSProperties
                }
              >
                <span>
                  {
                    t.categoryNames[
                    post.category
                    ]
                  }
                </span>

                <h3>
                  {post.title[language]}
                </h3>

                <ArticleMeta
                  post={post}
                  language={language}
                />
              </article>
            ))}
          </div>
        </section>
      </div>

      <ForumFooter />


      <nav
        className="ff-bottom-nav"
        aria-label="ForumFenomen"
      >
        <Link href="/akis">
          <HomeIcon />
          <span>{t.home}</span>
        </Link>

        <Link href="/kategoriler">
          <GridIcon />
          <span>{t.categories}</span>
        </Link>

        <Link
          href="/konu-ac"
          className="ff-center-nav-button"
          aria-label={t.createTopic}
        >
          <span className="ff-center-nav-glow" />

          <span className="ff-center-nav-image">
            <Image
              src="/forumfenomen-icon-master.png"
              alt=""
              fill
              sizes="70px"
              priority
            />
          </span>
        </Link>

        <Link
          href="/blog"
          className="active"
          aria-current="page"
        >
          <BlogIcon />
          <span>{t.blog}</span>
        </Link>

        <Link href="/profil">
          <UserIcon />
          <span>{t.profile}</span>
        </Link>
      </nav>
    </main>
  );
}





