import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ForumFooter from "@/components/forum-footer";
import BlogDetailHeader from "./blog-detail-header";
import BlogPostActions from "./blog-post-actions";
import BlogViewTracker from "./blog-view-tracker";
import BlogDetailBottomNav from "./blog-detail-bottom-nav";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

import styles from "./page.module.css";

type ContentBlock = {
    type?: string;
    level?: number;
    title?: string;
    text?: string;
};

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: ContentBlock[] | string | null;
    cover_image_url: string | null;
    cover_image_alt: string | null;
    category: string;
    category_id: number | null;
    tags: string[] | null;
    content_profile_id: string | null;
    author_id: string | null;
    reading_time: number | string | null;
    view_count: number | string | null;
    seo_title: string | null;
    seo_description: string | null;
    published_at: string | null;
    created_at: string;
};

type AuthorInfo = {
    name: string;
    username: string;
};

type RelatedPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image_url: string | null;
    cover_image_alt: string | null;
    category: string;
    tags: string[] | null;
    reading_time: number | string | null;
    published_at: string | null;
    created_at: string;
};

type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

function getNumber(
    value: number | string | null
) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat(
        "tr-TR",
        {
            dateStyle: "long",
            timeZone:
                "Europe/Istanbul",
        }
    ).format(new Date(value));
}

function getParagraphs(text: string) {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

async function getPublishedPost(
    slug: string
) {
    const adminSupabase =
        createAdminClient();

    const { data, error } =
        await adminSupabase
            .from("blog_posts")
            .select(`
                id,
                title,
                slug,
                excerpt,
                content,
                cover_image_url,
                cover_image_alt,
                category,
                category_id,
                tags,
                content_profile_id,
                author_id,
                reading_time,
                view_count,
                seo_title,
                seo_description,
                published_at,
                created_at
            `)
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();

    if (error) {
        console.error(
            "Blog yazısı alınamadı:",
            error.message
        );

        return null;
    }

    return data as BlogPost | null;
}

async function getAuthor(
    post: BlogPost
): Promise<AuthorInfo> {
    const adminSupabase =
        createAdminClient();

    if (post.content_profile_id) {
        const { data } =
            await adminSupabase
                .from(
                    "content_profiles"
                )
                .select(`
                    display_name,
                    username
                `)
                .eq(
                    "id",
                    post.content_profile_id
                )
                .maybeSingle();

        if (data) {
            return {
                name:
                    data.display_name
                        ?.trim() ||
                    data.username
                        ?.replace(
                            /^@/,
                            ""
                        )
                        .trim() ||
                    "ForumFenomen",
                username:
                    data.username
                        ?.replace(
                            /^@/,
                            ""
                        )
                        .trim() ||
                    "",
            };
        }
    }

    async function getRelatedPosts(
        currentPost: BlogPost
    ): Promise<RelatedPost[]> {
        const adminSupabase =
            createAdminClient();

        const { data, error } =
            await adminSupabase
                .from("blog_posts")
                .select(`
                id,
                title,
                slug,
                excerpt,
                cover_image_url,
                cover_image_alt,
                category,
                tags,
                reading_time,
                published_at,
                created_at
            `)
                .eq("status", "published")
                .neq("id", currentPost.id)
                .order("published_at", {
                    ascending: false,
                    nullsFirst: false,
                })
                .limit(20);

        if (error) {
            console.error(
                "Önerilen blog yazıları alınamadı:",
                error.message
            );

            return [];
        }

        const currentTags = new Set(
            (currentPost.tags ?? []).map(
                (tag) =>
                    tag
                        .trim()
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
            )
        );

        return (
            (data ?? []) as RelatedPost[]
        )
            .map((relatedPost) => {
                const sharedTagCount =
                    (
                        relatedPost.tags ?? []
                    ).filter((tag) =>
                        currentTags.has(
                            tag
                                .trim()
                                .toLocaleLowerCase(
                                    "tr-TR"
                                )
                        )
                    ).length;

                const sameCategory =
                    relatedPost.category ===
                    currentPost.category;

                return {
                    post: relatedPost,
                    score:
                        sharedTagCount * 10 +
                        (sameCategory ? 5 : 0),
                };
            })
            .sort((left, right) => {
                if (
                    right.score !==
                    left.score
                ) {
                    return (
                        right.score -
                        left.score
                    );
                }

                const rightDate =
                    new Date(
                        right.post
                            .published_at ??
                        right.post
                            .created_at
                    ).getTime();

                const leftDate =
                    new Date(
                        left.post
                            .published_at ??
                        left.post
                            .created_at
                    ).getTime();

                return rightDate - leftDate;
            })
            .slice(0, 4)
            .map((item) => item.post);
    }

    if (post.author_id) {
        const { data } =
            await adminSupabase
                .from("profiles")
                .select(`
                    display_name,
                    username
                `)
                .eq(
                    "id",
                    post.author_id
                )
                .maybeSingle();

        if (data) {
            return {
                name:
                    data.display_name
                        ?.trim() ||
                    data.username
                        ?.replace(
                            /^@/,
                            ""
                        )
                        .trim() ||
                    "ForumFenomen",
                username:
                    data.username
                        ?.replace(
                            /^@/,
                            ""
                        )
                        .trim() ||
                    "",
            };
        }
    }

    return {
        name: "ForumFenomen",
        username: "",
    };
}

async function getRelatedPosts(
    currentPost: BlogPost
): Promise<RelatedPost[]> {
    const adminSupabase =
        createAdminClient();

    const { data, error } =
        await adminSupabase
            .from("blog_posts")
            .select(`
                id,
                title,
                slug,
                excerpt,
                cover_image_url,
                cover_image_alt,
                category,
                tags,
                reading_time,
                published_at,
                created_at
            `)
            .eq("status", "published")
            .neq("id", currentPost.id)
            .order("published_at", {
                ascending: false,
                nullsFirst: false,
            })
            .limit(20);

    if (error) {
        console.error(
            "Önerilen blog yazıları alınamadı:",
            error.message
        );

        return [];
    }

    const currentTags = new Set(
        (currentPost.tags ?? []).map(
            (tag) =>
                tag
                    .trim()
                    .toLocaleLowerCase("tr-TR")
        )
    );

    return ((data ?? []) as RelatedPost[])
        .map((relatedPost) => {
            const sharedTagCount =
                (relatedPost.tags ?? []).filter(
                    (tag) =>
                        currentTags.has(
                            tag
                                .trim()
                                .toLocaleLowerCase(
                                    "tr-TR"
                                )
                        )
                ).length;

            const sameCategory =
                relatedPost.category ===
                currentPost.category;

            return {
                post: relatedPost,
                score:
                    sharedTagCount * 10 +
                    (sameCategory ? 5 : 0),
            };
        })
        .sort((left, right) => {
            if (
                right.score !==
                left.score
            ) {
                return (
                    right.score -
                    left.score
                );
            }

            const rightDate =
                new Date(
                    right.post.published_at ??
                    right.post.created_at
                ).getTime();

            const leftDate =
                new Date(
                    left.post.published_at ??
                    left.post.created_at
                ).getTime();

            return rightDate - leftDate;
        })
        .slice(0, 4)
        .map((item) => item.post);
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;

    const post =
        await getPublishedPost(slug);

    if (!post) {
        return {
            title:
                "Blog yazısı bulunamadı",
        };
    }

    const title =
        post.seo_title?.trim() ||
        post.title;

    const description =
        post.seo_description
            ?.trim() ||
        post.excerpt;

    return {
        title,
        description,
        alternates: {
            canonical:
                `/blog/${post.slug}`,
        },
        openGraph: {
            type: "article",
            title,
            description,
            publishedTime:
                post.published_at ??
                post.created_at,
            images:
                post.cover_image_url
                    ? [
                        {
                            url:
                                post.cover_image_url,
                            alt:
                                post.cover_image_alt ??
                                post.title,
                        },
                    ]
                    : undefined,
        },
        twitter: {
            card:
                "summary_large_image",
            title,
            description,
            images:
                post.cover_image_url
                    ? [
                        post.cover_image_url,
                    ]
                    : undefined,
        },
    };
}

function renderContentBlock(
    block: ContentBlock,
    index: number
) {
    const text =
        block.text?.trim() ?? "";

    if (!text) {
        return null;
    }

    if (
        block.type === "heading" &&
        block.level === 2
    ) {
        return (
            <h2 key={index}>
                {text}
            </h2>
        );
    }

    if (
        block.type === "heading" &&
        block.level === 3
    ) {
        return (
            <h3 key={index}>
                {text}
            </h3>
        );
    }

    if (block.type === "info") {
        return (
            <aside
                key={index}
                className={
                    styles.infoBox
                }
            >
                <strong>
                    {block.title?.trim() ||
                        "Önemli bilgi"}
                </strong>

                {getParagraphs(
                    text
                ).map(
                    (
                        paragraph,
                        paragraphIndex
                    ) => (
                        <p
                            key={
                                paragraphIndex
                            }
                        >
                            {
                                paragraph
                            }
                        </p>
                    )
                )}
            </aside>
        );
    }

    return getParagraphs(text).map(
        (
            paragraph,
            paragraphIndex
        ) => (
            <p
                key={`${index}-${paragraphIndex}`}
            >
                {paragraph}
            </p>
        )
    );
}

export default async function BlogPostPage({
    params,
}: PageProps) {
    const { slug } = await params;

    const post =
        await getPublishedPost(slug);

    if (!post) {
        notFound();
    }

    const author =
        await getAuthor(post);

    const relatedPosts =
        await getRelatedPosts(post);

    const publishedDate =
        post.published_at ??
        post.created_at;

    const readingTime =
        Math.max(
            1,
            getNumber(
                post.reading_time
            )
        );

    const contentBlocks =
        Array.isArray(post.content)
            ? post.content
            : typeof post.content ===
                "string"
                ? [
                    {
                        type:
                            "paragraph",
                        text:
                            post.content,
                    },
                ]
                : [];

    return (
        <main
            className={
                styles.page
            }
        >

            <BlogDetailHeader />

            <article
                className={
                    styles.article
                }
            >
                <nav
                    className={
                        styles.breadcrumb
                    }
                    aria-label="Sayfa yolu"
                >
                    <Link href="/">
                        Ana Sayfa
                    </Link>

                    <span>/</span>

                    <Link href="/blog">
                        Blog
                    </Link>

                    <span>/</span>

                    <span>
                        {post.category}
                    </span>
                </nav>

                <header
                    className={
                        styles.hero
                    }
                >
                    <div
                        className={
                            styles.heroGlow
                        }
                    />

                    <div
                        className={
                            styles.heroContent
                        }
                    >
                        <Link
                            href={`/blog?category=${encodeURIComponent(
                                post.category
                            )}`}
                            className={
                                styles.category
                            }
                        >
                            {post.category}
                        </Link>

                        <h1>
                            {post.title}
                        </h1>

                        <p
                            className={
                                styles.excerpt
                            }
                        >
                            {post.excerpt}
                        </p>

                        <div
                            className={
                                styles.meta
                            }
                        >
                            <span>
                                {author.name}
                                {author.username
                                    ? ` · @${author.username}`
                                    : ""}
                            </span>

                            <span
                                aria-hidden="true"
                            >
                                •
                            </span>

                            <time
                                dateTime={
                                    publishedDate
                                }
                            >
                                {formatDate(
                                    publishedDate
                                )}
                            </time>

                            <span
                                aria-hidden="true"
                            >
                                •
                            </span>

                            <span>
                                {readingTime} dk
                                okuma
                            </span>
                        </div>
                    </div>
                </header>

                {post.cover_image_url ? (
                    <figure
                        className={
                            styles.cover
                        }
                    >
                        <Image
                            src={
                                post.cover_image_url
                            }
                            alt={
                                post.cover_image_alt ??
                                post.title
                            }
                            width={1600}
                            height={900}
                            priority
                            sizes="(max-width: 900px) 100vw, 1000px"
                        />
                    </figure>
                ) : null}

                <div
                    className={
                        styles.layout
                    }
                >
                    <div
                        className={
                            styles.content
                        }
                    >
                        {contentBlocks.map(
                            (
                                block,
                                index
                            ) =>
                                renderContentBlock(
                                    block,
                                    index
                                )
                        )}

                        <BlogPostActions
                            postId={post.id}
                            title={post.title}
                            slug={post.slug}
                        />

                        {post.tags &&
                            post.tags.length >
                            0 ? (
                            <footer
                                className={
                                    styles.tags
                                }
                            >
                                <span>
                                    Etiketler
                                </span>

                                <div>
                                    {post.tags.map(
                                        (
                                            tag
                                        ) => (
                                            <span
                                                key={
                                                    tag
                                                }
                                            >
                                                #
                                                {
                                                    tag
                                                }
                                            </span>
                                        )
                                    )}
                                </div>
                            </footer>
                        ) : null}
                    </div>

                    <aside
                        className={
                            styles.sidebar
                        }
                    >
                        <div
                            className={
                                styles.authorCard
                            }
                        >
                            <span>
                                YAZAR
                            </span>

                            <strong>
                                {author.name}
                            </strong>

                            {author.username ? (
                                <small>
                                    @
                                    {
                                        author.username
                                    }
                                </small>
                            ) : null}

                            <p>
                                İçerik üretimi,
                                sosyal medya ve
                                dijital büyüme
                                üzerine güvenilir
                                rehberler.
                            </p>
                        </div>

                        <div
                            className={
                                styles.shareCard
                            }
                        >
                            <span>
                                YAZI BİLGİSİ
                            </span>

                            <div className={styles.infoRow}>
                                <span>
                                    Okuma süresi
                                </span>

                                <strong>
                                    {readingTime} dk
                                </strong>
                            </div>

                            <div className={styles.infoRow}>
                                <span>
                                    Görüntülenme
                                </span>

                                <BlogViewTracker
                                    postId={post.id}
                                    initialViewCount={getNumber(
                                        post.view_count
                                    )}
                                />
                            </div>
                        </div>
                    </aside>
                </div>

                {relatedPosts.length > 0 ? (
                    <section
                        className={
                            styles.relatedSection
                        }
                    >
                        <div
                            className={
                                styles.relatedHeader
                            }
                        >
                            <div>
                                <span>
                                    İLGİNİ ÇEKEBİLİR
                                </span>

                                <h2>
                                    Önerilen Yazılar
                                </h2>

                                <p>
                                    Bu yazının etiketleri ve
                                    kategorisiyle benzer içerikler.
                                </p>
                            </div>

                            <Link href="/blog">
                                Tüm Yazılar
                                <span
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </Link>
                        </div>

                        <div
                            className={
                                styles.relatedGrid
                            }
                        >
                            {relatedPosts.map(
                                (relatedPost) => (
                                    <Link
                                        key={
                                            relatedPost.id
                                        }
                                        href={`/blog/${relatedPost.slug}`}
                                        className={
                                            styles.relatedCard
                                        }
                                    >
                                        {relatedPost.cover_image_url ? (
                                            <div
                                                className={
                                                    styles.relatedImage
                                                }
                                            >
                                                <Image
                                                    src={
                                                        relatedPost.cover_image_url
                                                    }
                                                    alt={
                                                        relatedPost.cover_image_alt ??
                                                        relatedPost.title
                                                    }
                                                    fill
                                                    sizes="(max-width: 700px) 100vw, 500px"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={
                                                    styles.relatedFallback
                                                }
                                            >
                                                BLOG
                                            </div>
                                        )}

                                        <div
                                            className={
                                                styles.relatedBody
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.relatedCategory
                                                }
                                            >
                                                {
                                                    relatedPost.category
                                                }
                                            </span>

                                            <h3>
                                                {
                                                    relatedPost.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    relatedPost.excerpt
                                                }
                                            </p>

                                            <div
                                                className={
                                                    styles.relatedMeta
                                                }
                                            >
                                                <span>
                                                    {Math.max(
                                                        1,
                                                        getNumber(
                                                            relatedPost.reading_time
                                                        )
                                                    )}{" "}
                                                    dk okuma
                                                </span>

                                                <span>
                                                    Devamını Oku →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    </section>
                ) : null}
            </article>

            <div className={styles.detailShell}>
                <ForumFooter />
            </div>

            <BlogDetailBottomNav />

        </main>
    );
}