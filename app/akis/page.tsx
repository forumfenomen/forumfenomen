"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import TemporaryUsernameReminder from "@/components/temporary-username-reminder";
import { createClient } from "@/lib/supabase/client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  getForumLanguage,
  setForumLanguage,
} from "@/lib/forumfenomen-language";

import { formatRelativeTime } from "./feed-utils";
import {
  BlogIcon,
  BookmarkIcon,
  CommunityGraphic,
  EyeIcon,
  FeedSubcategoryIcon,
  GridIcon,
  HomeIcon,
  InstagramIcon,
  MessageIcon,
  MoonIcon,
  ProfileIcon,
  ShareIcon,
  SunIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "./feed-icons";

import {
  categoryVisualMap,
  subcategoryEnglishMap,
} from "./feed-constants";

import type {
  FeedFilter,
  FeedTopicMetricRow,
  Language,
  Post,
  Theme,
  TopicRow,
} from "./feed-types";

import { feedCopy } from "./feed-copy";


export default function FeedPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<Language>("tr");
  const [theme, setTheme] = useState<Theme>("dark");
  const [shared, setShared] = useState(false);

  const [topicPosts, setTopicPosts] =
    useState<Post[]>([]);

  const [activeFeedFilter, setActiveFeedFilter] =
    useState<FeedFilter>("latest");

  const [showAllTopics, setShowAllTopics] =
    useState(false);

  const [followingUserIds, setFollowingUserIds] =
    useState<string[]>([]);

  const [topicsLoading, setTopicsLoading] =
    useState(true);

  const topicsLoadedOnceRef =
    useRef(false);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const currentUserIdRef =
    useRef<string | null>(null);

  const [authResolved, setAuthResolved] =
    useState(false);

  const [savedTopicIds, setSavedTopicIds] =
    useState<Record<string, boolean>>({});

  const [savingTopicId, setSavingTopicId] =
    useState<string | null>(null);

  useEffect(() => {
    setShowAllTopics(false);
  }, [activeFeedFilter]);

  useEffect(() => {
    const savedLanguage = getForumLanguage();

    const savedTheme = window.localStorage.getItem(
      "forumfenomen-theme"
    );

    if (savedLanguage === "tr" || savedLanguage === "en") {
      setLanguage(savedLanguage);
      setForumLanguage(savedLanguage);
    }

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } else {
      setTheme("dark");
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    let isActive = true;

    async function loadUserFeedData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      setAuthResolved(true);

      const user =
        session?.user ?? null;

      if (!user) {
        currentUserIdRef.current = null;

        setCurrentUserId(null);
        setSavedTopicIds({});
        setFollowingUserIds([]);

        return;
      }

      currentUserIdRef.current = user.id;
      setCurrentUserId(user.id);

      const [
        savedTopicsResult,
        followingUsersResult,
      ] = await Promise.all([
        supabase
          .from("saved_topics")
          .select("topic_id")
          .eq("user_id", user.id),

        supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", user.id),
      ]);

      if (!isActive) {
        return;
      }

      if (savedTopicsResult.error) {
        console.error(
          "Kaydedilen konular alınamadı:",
          savedTopicsResult.error.message
        );

        setSavedTopicIds({});
      } else {
        const nextSavedTopicIds: Record<
          string,
          boolean
        > = {};

        for (
          const item of
          savedTopicsResult.data ?? []
        ) {
          nextSavedTopicIds[
            item.topic_id
          ] = true;
        }

        setSavedTopicIds(
          nextSavedTopicIds
        );
      }

      if (followingUsersResult.error) {
        console.error(
          "Takip edilen kullanıcılar alınamadı:",
          followingUsersResult.error.message
        );

        setFollowingUserIds([]);
      } else {
        setFollowingUserIds(
          (
            followingUsersResult.data ?? []
          ).map(
            (item) =>
              item.following_id
          )
        );
      }
    }

    void loadUserFeedData();

    const { data: authListener } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (
            !isActive ||
            event === "INITIAL_SESSION"
          ) {
            return;
          }

          const nextUserId =
            session?.user.id ?? null;

          if (event === "SIGNED_OUT") {
            currentUserIdRef.current = null;

            setCurrentUserId(null);
            setSavedTopicIds({});
            setFollowingUserIds([]);

            return;
          }

          if (
            event !== "SIGNED_IN" ||
            !nextUserId ||
            currentUserIdRef.current === nextUserId
          ) {
            return;
          }

          window.setTimeout(() => {
            void loadUserFeedData();
          }, 0);
        }
      );

    return () => {
      isActive = false;

      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    let isActive = true;

    async function loadTopics() {
      if (!topicsLoadedOnceRef.current) {
        setTopicsLoading(true);
      }

      const supabase = createClient();

      const [
        topicsResult,
        metricsResult,
      ] = await Promise.all([
        supabase
          .from("topics")
          .select(`
          id,
          author_id,
          content_profile_id,
          title,
          created_at,
          comment_count,
          view_count,
          categories (
            id,
            slug,
            name,
            category_groups (
              slug,
              name
            )
          )
        `)
          .eq("status", "published")
          .order("created_at", {
            ascending: false,
          })
          .limit(100),

        supabase.rpc(
          "get_feed_topic_metrics"
        ),
      ]);

      if (!isActive) {
        return;
      }

      const {
        data,
        error,
      } = topicsResult;

      if (error) {
        console.error(
          "Akış konuları alınamadı:",
          error.message
        );

        topicsLoadedOnceRef.current = true;
        setTopicsLoading(false);
        return;
      }

      const topicRows =
        (data ?? []) as unknown as Omit<
          TopicRow,
          "profiles"
        >[];

      if (metricsResult.error) {
        console.error(
          "Akış konu metrikleri alınamadı:",
          metricsResult.error.message
        );
      }

      const metricRows =
        (metricsResult.data ?? []) as FeedTopicMetricRow[];

      const metricMap = new Map(
        metricRows.map((metric) => [
          metric.topic_id,
          metric,
        ])
      );

      type TopicAuthorProfile = {
        topic_id: string;
        id: string;
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
      };

      let authorProfileRows:
        TopicAuthorProfile[] = [];

      type ManagedContentProfile = {
        id: string;
        display_name: string | null;
        username: string | null;
      };

      let managedProfileRows:
        ManagedContentProfile[] = [];

      const contentProfileIds = Array.from(
        new Set(
          topicRows
            .map(
              (topic) =>
                topic.content_profile_id
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        )
      );

      if (contentProfileIds.length > 0) {
        const {
          data: managedProfiles,
          error: managedProfilesError,
        } = await supabase
          .from("content_profiles")
          .select(`
      id,
      display_name,
      username
    `)
          .in("id", contentProfileIds)
          .eq("is_active", true)
          .eq("is_archived", false);

        if (!isActive) {
          return;
        }

        if (managedProfilesError) {
          console.error(
            "Akış içerik profilleri alınamadı:",
            managedProfilesError.message
          );
        } else {
          managedProfileRows =
            (managedProfiles ??
              []) as ManagedContentProfile[];
        }
      }

      /*
       * Oturum açmış kullanıcılar konu sahiplerini
       * güvenli RPC üzerinden görür.
       *
       * Oturum kapalı ziyaretçide profil listesi
       * boş kalır ve ForumFenomen Üyesi gösterilir.
       */
      if (
        currentUserId &&
        topicRows.length > 0
      ) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase.rpc(
          "get_topic_author_profiles",
          {
            p_topic_ids: topicRows.map(
              (topic) => topic.id
            ),
          }
        );

        if (!isActive) {
          return;
        }

        if (profileError) {
          console.error(
            "Akış konu sahipleri alınamadı:",
            profileError.message
          );
        } else {
          authorProfileRows =
            (profileData ??
              []) as TopicAuthorProfile[];
        }
      }

      const authorProfileMap = new Map(
        authorProfileRows.map((profile) => [
          profile.topic_id,
          profile,
        ])
      );

      const managedProfileMap = new Map(
        managedProfileRows.map((profile) => [
          profile.id,
          profile,
        ])
      );

      const nextPosts = topicRows.map(
        (topic) => {
          const groupSlug =
            topic.categories?.category_groups
              ?.slug ?? "";

          const visual =
            categoryVisualMap[groupSlug] ?? {
              icon: "#",
              iconClass: "social",
              toneClass: "platforms",
            };

          const categorySlug =
            topic.categories?.slug ?? "";

          const categoryName =
            topic.categories?.name ??
            (language === "tr"
              ? "Genel"
              : "General");

          const managedProfile =
            topic.content_profile_id
              ? managedProfileMap.get(
                topic.content_profile_id
              )
              : null;

          const authorProfile =
            authorProfileMap.get(topic.id);

          const authorName =
            managedProfile
              ?.display_name
              ?.trim() ||
            managedProfile
              ?.username
              ?.replace(/^@/, "")
              .trim() ||
            authorProfile
              ?.display_name
              ?.trim() ||
            authorProfile
              ?.username
              ?.replace(/^@/, "")
              .trim() ||
            (language === "tr"
              ? "ForumFenomen Üyesi"
              : "ForumFenomen Member");

          return {
            id: topic.id,
            authorId: topic.author_id ?? undefined,
            createdAt: topic.created_at,
            commentCountValue:
              topic.comment_count ?? 0,
            viewCountValue:
              topic.view_count ?? 0,
            likeCountValue:
              metricMap.get(topic.id)
                ?.like_count ?? 0,
            saveCountValue:
              metricMap.get(topic.id)
                ?.save_count ?? 0,
            icon:
              categorySlug === "yapay-zeka"
                ? visual.icon
                : categorySlug ||
                visual.icon,
            iconClass: visual.iconClass,
            toneClass: visual.toneClass,
            titleTr: topic.title,
            titleEn: topic.title,
            categoryTr: categoryName,
            categoryEn:
              subcategoryEnglishMap[
              categorySlug
              ] ?? categoryName,
            author: authorName,
            timeTr: formatRelativeTime(
              topic.created_at,
              "tr"
            ),
            timeEn: formatRelativeTime(
              topic.created_at,
              "en"
            ),
            comments: String(
              topic.comment_count ?? 0
            ),
            views: String(
              topic.view_count ?? 0
            ),
          };
        }
      );

      setTopicPosts(nextPosts);

      topicsLoadedOnceRef.current = true;
      setTopicsLoading(false);
    }

    void loadTopics();

    return () => {
      isActive = false;
    };
  }, [
    language,
    currentUserId,
    authResolved,
  ]);

  const toggleSavedTopic = async (
    topicId?: string
  ) => {
    if (
      !topicId ||
      savingTopicId === topicId
    ) {
      return;
    }

    if (!currentUserId) {
      router.push("/giris");
      return;
    }

    const wasSaved =
      Boolean(savedTopicIds[topicId]);

    setSavingTopicId(topicId);

    setSavedTopicIds((current) => ({
      ...current,
      [topicId]: !wasSaved,
    }));

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.rpc(
          "toggle_saved_topic",
          {
            p_topic_id: topicId,
          }
        );

      if (error) {
        console.error(
          "Konu kaydedilemedi:",
          error.message
        );

        setSavedTopicIds((current) => {
          const next = { ...current };

          if (wasSaved) {
            next[topicId] = true;
          } else {
            delete next[topicId];
          }

          return next;
        });

        window.alert(
          language === "tr"
            ? "Kaydetme işlemi gerçekleştirilemedi."
            : "The save action could not be completed."
        );

        return;
      }

      const isSaved = data === true;

      setSavedTopicIds((current) => {
        const next = { ...current };

        if (isSaved) {
          next[topicId] = true;
        } else {
          delete next[topicId];
        }

        return next;
      });
    } catch (error) {
      console.error(
        "Beklenmeyen kaydetme hatası:",
        error
      );

      setSavedTopicIds((current) => {
        const next = { ...current };

        if (wasSaved) {
          next[topicId] = true;
        } else {
          delete next[topicId];
        }

        return next;
      });
    } finally {
      setSavingTopicId(null);
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;

    window.localStorage.setItem(
      "forumfenomen-theme",
      nextTheme
    );
  };

  const shareApp = async () => {
    const shareData = {
      title: "ForumFenomen",
      text:
        language === "tr"
          ? "Keşfet, paylaş, konuş!"
          : "Discover, share, connect!",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.origin
        );

        setShared(true);

        window.setTimeout(() => {
          setShared(false);
        }, 1600);
      }
    } catch {
      // Kullanıcı paylaşma penceresini kapatırsa işlem yapılmaz.
    }
  };
  const t = feedCopy[language];

  const seventyTwoHoursAgo =
    Date.now() - 72 * 60 * 60 * 1000;

  const sevenDaysAgo =
    Date.now() - 7 * 24 * 60 * 60 * 1000;

  const trendPosts = [...topicPosts]
    .filter((post) => {
      if (!post.createdAt) {
        return false;
      }

      return (
        new Date(post.createdAt).getTime() >=
        sevenDaysAgo
      );
    })
    .sort((firstPost, secondPost) => {
      const firstScore =
        (firstPost.commentCountValue ?? 0) * 3 +
        (firstPost.likeCountValue ?? 0) * 2 +
        (firstPost.saveCountValue ?? 0) * 4;

      const secondScore =
        (secondPost.commentCountValue ?? 0) * 3 +
        (secondPost.likeCountValue ?? 0) * 2 +
        (secondPost.saveCountValue ?? 0) * 4;

      return secondScore - firstScore;
    });

  const communityPosts = [...topicPosts].sort(
    (firstPost, secondPost) => {
      const saveDifference =
        (secondPost.saveCountValue ?? 0) -
        (firstPost.saveCountValue ?? 0);

      if (saveDifference !== 0) {
        return saveDifference;
      }

      const firstDate = firstPost.createdAt
        ? new Date(firstPost.createdAt).getTime()
        : 0;

      const secondDate = secondPost.createdAt
        ? new Date(secondPost.createdAt).getTime()
        : 0;

      return secondDate - firstDate;
    }
  );

  const followingPosts = topicPosts
    .filter(
      (post) =>
        post.authorId &&
        followingUserIds.includes(post.authorId)
    )
    .sort((firstPost, secondPost) => {
      const firstDate = firstPost.createdAt
        ? new Date(firstPost.createdAt).getTime()
        : 0;

      const secondDate = secondPost.createdAt
        ? new Date(secondPost.createdAt).getTime()
        : 0;

      return secondDate - firstDate;
    });

  const latestPosts = [...topicPosts].sort(
    (firstPost, secondPost) => {
      const firstDate = firstPost.createdAt
        ? new Date(firstPost.createdAt).getTime()
        : 0;

      const secondDate = secondPost.createdAt
        ? new Date(secondPost.createdAt).getTime()
        : 0;

      return secondDate - firstDate;
    }
  );

  const latestSeventyTwoHourCount =
    topicPosts.filter((post) => {
      if (!post.createdAt) {
        return false;
      }

      return (
        new Date(post.createdAt).getTime() >=
        seventyTwoHoursAgo
      );
    }).length;

  const filteredPosts: Record<FeedFilter, Post[]> = {
    latest: latestPosts,
    trends: trendPosts,
    community: communityPosts,
    following: followingPosts,
  };

  const activePosts =
    filteredPosts[activeFeedFilter];


  const displayPosts = showAllTopics
    ? activePosts
    : activePosts.slice(0, 7);

  const activeFeedTitle: Record<FeedFilter, string> = {
    latest:
      language === "tr"
        ? "Son Eklenen Konular"
        : "Latest Topics",
    trends: t.trends,
    community: t.community,
    following: t.following,
  };

  function handleTopicExpansionToggle() {
    const shouldScrollUp = showAllTopics;

    setShowAllTopics((current) => !current);

    if (!shouldScrollUp) {
      return;
    }

    const scrollToTopicSection = () => {
      document
        .getElementById("feed-topic-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(
        scrollToTopicSection
      );
    });

    window.setTimeout(
      scrollToTopicSection,
      180
    );
  }

  function handleBottomNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (window.location.pathname !== href) {
      return;
    }

    event.preventDefault();

    if (href === "/akis") {
      setActiveFeedFilter("latest");
    }

    const resetScroll = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();

    window.requestAnimationFrame(() => {
      resetScroll();

      window.requestAnimationFrame(() => {
        resetScroll();
      });
    });

    window.setTimeout(resetScroll, 100);
    window.setTimeout(resetScroll, 300);
  }

  return (
    <main className="ff-feed-page">
      <TemporaryUsernameReminder />
      <div className="ff-feed-app">
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
              className="ff-round-action ff-theme-icon-button"
              aria-label={
                theme === "dark"
                  ? "Açık temaya geç"
                  : "Koyu temaya geç"
              }
              title={
                theme === "dark"
                  ? "Açık tema"
                  : "Koyu tema"
              }
              onClick={toggleTheme}
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

        <section className="ff-feed-hero">
          <div className="ff-feed-hero-copy">
            <h1>
              {t.heroStart}{" "}
              <span>{t.heroAccent}</span>
            </h1>

            <div className="ff-hero-socials">
              <a
                href="https://www.instagram.com/forumfenomen/"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button instagram"
                aria-label="ForumFenomen Instagram"
                title="Instagram"
              >
                <InstagramIcon />
              </a>

              <a
                href="https://x.com/forumfenomen"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button x"
                aria-label="ForumFenomen X"
                title="X"
              >
                <XIcon />
              </a>

              <a
                href="https://www.youtube.com/@forumfenomen"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button youtube"
                aria-label="ForumFenomen YouTube"
                title="YouTube"
              >
                <YouTubeIcon />
              </a>
              <a
                href="https://www.tiktok.com/@forumfenomen"
                target="_blank"
                rel="noreferrer"
                className="ff-hero-social-button tiktok"
                aria-label="ForumFenomen TikTok"
                title="TikTok"
              >
                <TikTokIcon />
              </a>

              <button
                type="button"
                className={
                  shared
                    ? "ff-hero-social-button share shared"
                    : "ff-hero-social-button share"
                }
                aria-label={
                  language === "tr"
                    ? "ForumFenomen'i paylaş"
                    : "Share ForumFenomen"
                }
                title={
                  shared
                    ? "Bağlantı kopyalandı"
                    : "ForumFenomen'i paylaş"
                }
                onClick={shareApp}
              >
                <ShareIcon />
              </button>
            </div>

            <Link href="/konu-ac" className="ff-new-topic-button">
              <span aria-hidden="true">＋</span>
              {t.newTopic}
            </Link>
          </div>

          <div className="ff-feed-hero-art">
            <div className="ff-hero-orbit" />
            <CommunityGraphic />
          </div>
        </section>

        <section className="ff-insight-grid">



          <button

            type="button"

            className={

              activeFeedFilter === "latest"

                ? "active"

                : ""

            }

            onClick={() => {

              setActiveFeedFilter("latest");




            }}

          >

            <strong>

              🕘 {language === "tr"

                ? "Son Eklenen"

                : "Latest"}

            </strong>



            <span>
              {language === "tr"
                ? `Son 72 saat · ${latestSeventyTwoHourCount} konu`
                : `Last 72 hours · ${latestSeventyTwoHourCount} topics`}
            </span>

          </button>



          <button

            type="button"

            className={

              activeFeedFilter === "trends"

                ? "active"

                : ""

            }

            onClick={() => {

              setActiveFeedFilter("trends");




            }}

          >

            <strong>🔥 {t.trends}</strong>



            <span>

              {trendPosts.length}{" "}

              {language === "tr" ? "konu" : "topics"}

            </span>

          </button>


          <button

            type="button"

            className={

              activeFeedFilter === "community"

                ? "active"

                : ""

            }

            onClick={() => {

              setActiveFeedFilter("community");

            }}

          >

            <strong>👥 {t.community}</strong>

            <span>

              {communityPosts.length}{" "}

              {language === "tr" ? "konu" : "topics"}

            </span>

          </button>

          <button

            type="button"

            className={

              activeFeedFilter === "following"

                ? "active"

                : ""

            }

            onClick={() => {

              if (!currentUserId) {

                router.push("/giris");

                return;

              }



              setActiveFeedFilter("following");





            }}

          >

            <strong>☆ {t.following}</strong>



            <span>

              {followingPosts.length}{" "}

              {language === "tr" ? "konu" : "topics"}

            </span>

          </button>

        </section>

        <section
          id="feed-topic-section"
          className="ff-featured-section"
        >
          <div className="ff-section-heading">
            <h2>{activeFeedTitle[activeFeedFilter]}</h2>
          </div>

          <div
            className="ff-topic-list"
            aria-busy={topicsLoading}
          >
            {topicsLoading ? (
              <div
                className="ff-topics-loading"
                style={{
                  paddingLeft: 13,
                }}
              >
                Güncel konular yükleniyor...
              </div>
            ) : displayPosts.length === 0 ? (
              <div
                className="ff-topics-loading"
                style={{
                  paddingLeft: 13,
                }}
              >
                Henüz yayınlanmış konu bulunmuyor.
              </div>
            ) : (
              displayPosts.map((post, index) => (
                <article

                  id={`topic-${post.id ??
                    encodeURIComponent(post.titleTr)
                    }`}
                  className="ff-topic-card"
                  key={post.id ?? post.titleTr}
                >
                  <div
                    className={`ff-topic-icon ${post.iconClass} ${post.toneClass ?? ""
                      }`}
                  >
                    <FeedSubcategoryIcon icon={post.icon} />
                  </div>

                  <div className="ff-topic-main">
                    <h3>
                      {post.id ? (
                        <Link
                          href={`/konu/${post.id}`}
                          prefetch={index < 2}
                          scroll={true}
                          onClick={() => {
                            window.scrollTo(0, 0);
                            document.documentElement.scrollTop = 0;
                            document.body.scrollTop = 0;
                          }}
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                          }}
                        >
                          {language === "tr"
                            ? post.titleTr
                            : post.titleEn}
                        </Link>
                      ) : (
                        language === "tr"
                          ? post.titleTr
                          : post.titleEn
                      )}
                    </h3>

                    <div className="ff-topic-meta">
                      <span
                        className={`ff-category ${post.iconClass} ${post.toneClass ?? ""
                          }`}
                      >
                        {language === "tr"
                          ? post.categoryTr
                          : post.categoryEn}
                      </span>

                      <span>{post.author}</span>
                      <i>•</i>

                      <span>
                        {language === "tr"
                          ? post.timeTr
                          : post.timeEn}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={
                      post.id &&
                        savedTopicIds[post.id]
                        ? "ff-bookmark-button saved"
                        : "ff-bookmark-button"
                    }
                    disabled={
                      !post.id ||
                      savingTopicId === post.id
                    }
                    aria-pressed={
                      post.id
                        ? Boolean(savedTopicIds[post.id])
                        : false
                    }
                    aria-label={
                      post.id &&
                        savedTopicIds[post.id]
                        ? language === "tr"
                          ? "Kaydı kaldır"
                          : "Remove bookmark"
                        : language === "tr"
                          ? "Konuyu kaydet"
                          : "Save topic"
                    }
                    title={
                      post.id &&
                        savedTopicIds[post.id]
                        ? language === "tr"
                          ? "Kaydedildi"
                          : "Saved"
                        : language === "tr"
                          ? "Kaydet"
                          : "Save"
                    }
                    onClick={() => {
                      void toggleSavedTopic(post.id);
                    }}
                  >
                    <BookmarkIcon />
                  </button>

                  <div
                    className={`ff-topic-stats ${post.toneClass ?? ""
                      }`}
                  >
                    <span>
                      <MessageIcon />
                      {post.comments}
                    </span>

                    <span>
                      <EyeIcon />
                      {post.views}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>

          {activePosts.length > 7 && (
            <div className="ff-feed-more-wrap">
              <button
                type="button"
                className="ff-feed-more-button"
                onClick={handleTopicExpansionToggle}
                aria-expanded={showAllTopics}
              >
                <span
                  className={`ff-feed-more-arrow ${showAllTopics ? "up" : "down"
                    }`}
                  aria-hidden="true"
                />

                <span className="ff-feed-more-text">
                  {showAllTopics
                    ? language === "tr"
                      ? "Daha Az Konu"
                      : "Show Fewer Topics"
                    : language === "tr"
                      ? "Daha Fazla Konu"
                      : "Show More Topics"}
                </span>

                <span
                  className={`ff-feed-more-arrow ${showAllTopics ? "up" : "down"
                    }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </section>



        <section className="ff-ad-banner">
          <span className="ff-ad-badge">{t.ad}</span>

          <div>
            <strong>{t.adTitle}</strong>
            <p>{t.adText}</p>
          </div>

          <Link
            href="/iletisim"
            className="ff-advertise-button"
          >
            {t.advertise}
          </Link>
        </section>
      </div>

      <ForumFooter />


      <nav className="ff-bottom-nav" aria-label="Ana menü">
        <Link
          href="/akis"
          className="active"
          onClick={(event) =>
            handleBottomNavigation(event, "/akis")
          }
        >
          <HomeIcon />
          <span>{t.home}</span>
        </Link>

        <Link
          href="/kategoriler"
          onClick={(event) =>
            handleBottomNavigation(event, "/kategoriler")
          }
        >
          <GridIcon />
          <span>{t.categories}</span>
        </Link>

        <Link
          href="/konu-ac"
          className="ff-center-nav-button"
          aria-label={t.openTopic}
        >
          <span className="ff-center-nav-glow" />

          <span className="ff-center-nav-image">
            <Image
              src="/forumfenomen-icon-256.png"
              alt=""
              width={1254}
              height={1254}
              unoptimized
            />
          </span>
        </Link>

        <Link
          href="/blog"
          onClick={(event) =>
            handleBottomNavigation(event, "/blog")
          }
        >
          <BlogIcon />
          <span>{t.blog}</span>
        </Link>

        <Link
          href="/profil"
          onClick={(event) =>
            handleBottomNavigation(event, "/profil")
          }
        >
          <ProfileIcon />
          <span>{t.profile}</span>
        </Link>
      </nav>
    </main>

  );
}








