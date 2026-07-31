"use client";

import Link from "next/link";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    type ForumLanguage,
} from "@/lib/forumfenomen-language";
import { createClient } from "@/lib/supabase/client";

type SiteSearchProps = {
    language: ForumLanguage;
};

type TopicRow = {
    id: string;
    title: string;
    created_at: string;

    categories: {
        slug: string;
        name: string;

        category_groups: {
            slug: string;
            name: string;
        } | null;
    } | null;

    profiles: {
        display_name: string | null;
        username: string | null;
    } | null;
};

type ProfileRow = {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
};

type SearchResult = {
    id: string;
    type: "topic" | "blog" | "profile";
    title: string;
    subtitle: string;
    href: string;
    icon: string;
    iconClass: string;
    searchText: string;
};

const categoryNames = {
    tr: {
        platforms: "Platformlar",
        content: "İçerik Üretimi",
        growth: "Büyüme",
        money: "Para Kazanma",
        education: "Eğitim",
        legal: "Yasal Mevzuat",
    },

    en: {
        platforms: "Platforms",
        content: "Content Creation",
        growth: "Growth",
        money: "Monetization",
        education: "Education",
        legal: "Legal Regulations",
    },
} as const;

const categoryVisuals: Record<
    string,
    {
        icon: string;
        iconClass: string;
    }
> = {
    platformlar: {
        icon: "◎",
        iconClass: "social",
    },

    "icerik-uretimi": {
        icon: "AI",
        iconClass: "ai",
    },

    buyume: {
        icon: "↗",
        iconClass: "growth",
    },

    "para-kazanma": {
        icon: "₺",
        iconClass: "business",
    },

    egitim: {
        icon: "▶",
        iconClass: "video",
    },

    yasal: {
        icon: "§",
        iconClass: "legal",
    },
};

function normalizeSearchText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .toLowerCase()
        .trim();
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
        </svg>
    );
}

export default function SiteSearch({
    language,
}: SiteSearchProps) {
    const wrapperRef =
        useRef<HTMLDivElement | null>(null);

    const inputRef =
        useRef<HTMLInputElement | null>(null);

    const [open, setOpen] =
        useState(false);

    const [searchValue, setSearchValue] =
        useState("");

    const [topicRows, setTopicRows] =
        useState<TopicRow[]>([]);

    const [profileRows, setProfileRows] =
        useState<ProfileRow[]>([]);

    const [profilesLoading, setProfilesLoading] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        if (!open || topicRows.length > 0) {
            return;
        }

        let isActive = true;

        async function loadTopics() {
            setLoading(true);

            const supabase = createClient();

            const { data, error } = await supabase
                .from("topics")
                .select(`
          id,
          title,
          created_at,
          categories (
            slug,
            name,
            category_groups (
              slug,
              name
            )
          )
        `)
                .eq("status", "published")
                .order("is_pinned", {
                    ascending: false,
                })
                .order("created_at", {
                    ascending: false,
                })
                .limit(100);

            if (!isActive) {
                return;
            }

            if (error) {
                console.error(
                    "Genel arama konuları alınamadı:",
                    error.message
                );

                setLoading(false);
                return;
            }

            const rawTopicRows =
                (data ?? []) as unknown as Omit<
                    TopicRow,
                    "profiles"
                >[];

            type TopicAuthorProfile = {
                topic_id: string;
                id: string;
                display_name: string | null;
                username: string | null;
                avatar_url: string | null;
            };

            let authorProfileRows:
                TopicAuthorProfile[] = [];

            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (!isActive) {
                return;
            }

            if (sessionError) {
                console.error(
                    "Arama oturumu alınamadı:",
                    sessionError.message
                );
            }

            /*
             * Oturum açmış kullanıcı gerçek konu
             * sahiplerini görür. Oturum kapalıysa
             * profil alanı null kalır.
             */
            if (
                session?.user &&
                rawTopicRows.length > 0
            ) {
                const {
                    data: profileData,
                    error: profileError,
                } = await supabase.rpc(
                    "get_topic_author_profiles",
                    {
                        p_topic_ids:
                            rawTopicRows.map(
                                (topic) => topic.id
                            ),
                    }
                );

                if (!isActive) {
                    return;
                }

                if (profileError) {
                    console.error(
                        "Arama konu sahipleri alınamadı:",
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

            const nextTopicRows: TopicRow[] =
                rawTopicRows.map((topic) => {
                    const profile =
                        authorProfileMap.get(topic.id);

                    return {
                        ...topic,
                        profiles: profile
                            ? {
                                display_name:
                                    profile.display_name,
                                username:
                                    profile.username,
                            }
                            : null,
                    };
                });

            setTopicRows(nextTopicRows);
            setLoading(false);
        }

        void loadTopics();

        return () => {
            isActive = false;
        };
    }, [open, topicRows.length]);

    useEffect(() => {
        if (!open) {
            return;
        }

        window.setTimeout(() => {
            inputRef.current?.focus();
        }, 40);

        function handlePointerDown(
            event: MouseEvent
        ) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
                setSearchValue("");
            }
        }

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                setOpen(false);
                setSearchValue("");
            }
        }

        document.addEventListener(
            "mousedown",
            handlePointerDown
        );

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handlePointerDown
            );

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [open]);

    const normalizedSearch =
        normalizeSearchText(searchValue);

    useEffect(() => {
        if (!open || normalizedSearch.length < 2) {
            setProfileRows([]);
            setProfilesLoading(false);
            return;
        }

        let isActive = true;

        const timeoutId = window.setTimeout(
            async () => {
                setProfilesLoading(true);

                const supabase = createClient();

                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (!isActive) {
                    return;
                }

                /*
                 * Oturumu kapalı ziyaretçiler
                 * kullanıcı araması yapamaz.
                 */
                if (
                    sessionError ||
                    !session?.user
                ) {
                    setProfileRows([]);
                    setProfilesLoading(false);
                    return;
                }

                const { data, error } =
                    await supabase.rpc(
                        "search_public_profiles",
                        {
                            p_query:
                                searchValue.trim(),
                            p_limit: 10,
                        }
                    );

                if (!isActive) {
                    return;
                }

                if (error) {
                    console.error(
                        "Kullanıcı araması yapılamadı:",
                        error.message
                    );

                    setProfileRows([]);
                    setProfilesLoading(false);
                    return;
                }

                setProfileRows(
                    (data ?? []) as ProfileRow[]
                );

                setProfilesLoading(false);
            },
            250
        );

        return () => {
            isActive = false;
            window.clearTimeout(timeoutId);
        };
    }, [
        open,
        normalizedSearch,
        searchValue,
    ]);

    const allResults = useMemo(() => {
        const topicResults: SearchResult[] =
            topicRows.map((topic) => {
                const groupSlug =
                    topic.categories?.category_groups
                        ?.slug ?? "";

                const visual =
                    categoryVisuals[groupSlug] ?? {
                        icon: "#",
                        iconClass: "social",
                    };

                const categoryName =
                    topic.categories?.name ??
                    (language === "tr"
                        ? "Genel"
                        : "General");

                const author =
                    topic.profiles?.display_name?.trim() ||
                    topic.profiles?.username
                        ?.replace(/^@/, "")
                        .trim() ||
                    (language === "tr"
                        ? "ForumFenomen Üyesi"
                        : "ForumFenomen Member");

                const typeLabel =
                    language === "tr"
                        ? "Konu"
                        : "Topic";

                return {
                    id: `topic-${topic.id}`,
                    type: "topic",
                    title: topic.title,
                    subtitle:
                        `${typeLabel} · ${categoryName} · ${author}`,
                    href: `/konu/${topic.id}`,
                    icon: visual.icon,
                    iconClass: visual.iconClass,
                    searchText: normalizeSearchText(
                        [
                            topic.title,
                            categoryName,
                            topic.categories
                                ?.category_groups?.name ?? "",
                            author,
                        ].join(" ")
                    ),
                };
            });


        const profileResults: SearchResult[] =
            profileRows
                .filter((profile) =>
                    Boolean(profile.username?.trim())
                )
                .map((profile) => {
                    const username =
                        profile.username!
                            .replace(/^@/, "")
                            .trim();

                    const displayName =
                        profile.display_name?.trim() ||
                        username;

                    const initial =
                        displayName
                            .slice(0, 1)
                            .toLocaleUpperCase(
                                language === "tr"
                                    ? "tr-TR"
                                    : "en-US"
                            ) || "Ü";

                    return {
                        id: `profile-${profile.id}`,
                        type: "profile",
                        title: displayName,
                        subtitle:
                            language === "tr"
                                ? `Kullanıcı · @${username}`
                                : `User · @${username}`,
                        href:
                            `/profil/${encodeURIComponent(
                                username
                            )}`,
                        icon: initial,
                        iconClass: "social",
                        searchText: normalizeSearchText(
                            [
                                displayName,
                                username,
                                `@${username}`,
                            ].join(" ")
                        ),
                    };
                });

        return [
            ...profileResults,
            ...topicResults,
        ];

    }, [
        language,
        profileRows,
        topicRows,
    ]);



    const searchResults = useMemo(() => {
        if (normalizedSearch.length < 2) {
            return [];
        }

        return allResults
            .map((result) => {
                const titleText =
                    normalizeSearchText(result.title);

                let score = 0;

                if (
                    titleText === normalizedSearch
                ) {
                    score += 100;
                } else if (
                    titleText.startsWith(
                        normalizedSearch
                    )
                ) {
                    score += 70;
                } else if (
                    titleText.includes(
                        normalizedSearch
                    )
                ) {
                    score += 45;
                } else if (
                    result.searchText.includes(
                        normalizedSearch
                    )
                ) {
                    score += 20;
                }

                return {
                    ...result,
                    score,
                };
            })
            .filter((result) => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }, [
        allResults,
        normalizedSearch,
    ]);

    function toggleSearch() {
        setOpen((current) => {
            const nextValue = !current;

            if (!nextValue) {
                setSearchValue("");
            }

            return nextValue;
        });
    }

    return (
        <div
            ref={wrapperRef}
            className="ff-site-search"
        >
            <button
                type="button"
                className={
                    open
                        ? "ff-round-action active"
                        : "ff-round-action"
                }
                onClick={toggleSearch}
                aria-expanded={open}
                aria-label={
                    language === "tr"
                        ? "Site genelinde ara"
                        : "Search the entire site"
                }
                title={
                    language === "tr"
                        ? "Site genelinde ara"
                        : "Search the entire site"
                }
            >
                {open ? (
                    <CloseIcon />
                ) : (
                    <SearchIcon />
                )}
            </button>

            {open && (
                <div className="ff-site-search-popover">
                    <div className="ff-site-search-input">
                        <SearchIcon />

                        <input
                            ref={inputRef}
                            type="search"
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(
                                    event.target.value
                                )
                            }
                            placeholder={
                                language === "tr"
                                    ? "Konu, blog, kategori veya kullanıcı ara..."
                                    : "Search topics, blogs, categories or users..."
                            }
                        />
                    </div>

                    {normalizedSearch.length >= 2 ? (
                        <div
                            className="ff-site-search-results"
                            aria-live="polite"
                            aria-busy={loading || profilesLoading}
                        >
                            {loading || profilesLoading ? (
                                <div className="ff-site-search-hint">
                                    <span className="ff-site-search-loader" />

                                    <span>
                                        {language === "tr"
                                            ? "Aranıyor..."
                                            : "Searching..."}
                                    </span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                    <Link
                                        key={result.id}
                                        href={result.href}
                                        className="ff-site-search-result"
                                        onClick={() => {
                                            setOpen(false);
                                            setSearchValue("");
                                        }}
                                    >
                                        <span
                                            className={
                                                `ff-site-search-result-icon ` +
                                                result.iconClass
                                            }
                                        >
                                            {result.icon}
                                        </span>

                                        <span className="ff-site-search-result-copy">
                                            <strong>{result.title}</strong>
                                            <small>{result.subtitle}</small>
                                        </span>

                                        <span
                                            className="ff-site-search-result-arrow"
                                            aria-hidden="true"
                                        >
                                            ›
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="ff-site-search-hint">
                                    <SearchIcon />

                                    <span>
                                        {language === "tr"
                                            ? "Eşleşen konu veya kullanıcı bulunamadı."
                                            : "No matching topic or user was found."}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}