import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminAccess } from "@/lib/admin/require-admin-access";
import { createAdminClient } from "@/lib/supabase/admin";

import styles from "../../admin.module.css";
import pageStyles from "../yeni/page.module.css";

type ContentProfile = {
    id: string;
    display_name: string | null;
    username: string | null;
};

type StaffProfile = {
    id: string;
    display_name: string | null;
    username: string | null;
    role: "admin" | "moderator";
};

type CategoryGroup = {
    id: number;
    name: string;
    sort_order: number;
};

type Category = {
    id: number;
    group_id: number;
    name: string;
    sort_order: number;
};

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
    category_id: number | null;
    content_profile_id: string | null;
    author_id: string | null;
    tags: string[] | null;
    status: "draft" | "published" | "archived";
    seo_title: string | null;
    seo_description: string | null;
    published_at: string | null;
};

type Placement = {
    placement_type:
    | "featured_main"
    | "featured_side"
    | "quick_learn"
    | "editor_pick";
    sort_order: number;
    is_active: boolean;
};

type PageProps = {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        error?: string;
        saved?: string;
    }>;
};

function getText(formData: FormData, key: string) {
    const value = formData.get(key);

    return typeof value === "string"
        ? value.trim()
        : "";
}

function slugifyTurkish(value: string) {
    return value
        .toLocaleLowerCase("tr-TR")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
}

function contentToBlocks(content: string) {
    const sections = content
        .split(/\n{2,}/)
        .map((section) => section.trim())
        .filter(Boolean);

    return sections.map((section) => {
        if (section.startsWith("## ")) {
            return {
                type: "heading",
                level: 2,
                text: section.slice(3).trim(),
            };
        }

        if (section.startsWith("### ")) {
            return {
                type: "heading",
                level: 3,
                text: section.slice(4).trim(),
            };
        }

        if (section.startsWith("> ")) {
            return {
                type: "info",
                title: "Önemli bilgi",
                text: section
                    .split("\n")
                    .map((line) =>
                        line.replace(/^>\s?/, "")
                    )
                    .join("\n")
                    .trim(),
            };
        }

        return {
            type: "paragraph",
            text: section,
        };
    });
}

function blocksToContent(
    value: BlogPost["content"]
) {
    if (typeof value === "string") {
        return value;
    }

    if (!Array.isArray(value)) {
        return "";
    }

    return value
        .map((block) => {
            const text = block.text?.trim() ?? "";

            if (!text) {
                return "";
            }

            if (
                block.type === "heading" &&
                block.level === 2
            ) {
                return `## ${text}`;
            }

            if (
                block.type === "heading" &&
                block.level === 3
            ) {
                return `### ${text}`;
            }

            if (block.type === "info") {
                return text
                    .split("\n")
                    .map((line) => `> ${line}`)
                    .join("\n");
            }

            return text;
        })
        .filter(Boolean)
        .join("\n\n");
}

function getProfileLabel(
    profile: ContentProfile
) {
    const username = profile.username
        ?.replace(/^@/, "")
        .trim();

    const displayName =
        profile.display_name?.trim() ||
        username ||
        "İsimsiz profil";

    return username
        ? `${displayName} · @${username}`
        : displayName;
}

function getStaffLabel(
    profile: StaffProfile
) {
    const username = profile.username
        ?.replace(/^@/, "")
        .trim();

    const displayName =
        profile.display_name?.trim() ||
        username ||
        "İsimsiz yönetici";

    const roleLabel =
        profile.role === "admin"
            ? "ADMIN"
            : "MODERATÖR";

    return username
        ? `${displayName} · @${username} · ${roleLabel}`
        : `${displayName} · ${roleLabel}`;
}

function getPlacement(
    placements: Placement[],
    type: Placement["placement_type"]
) {
    return placements.find(
        (placement) =>
            placement.placement_type === type &&
            placement.is_active
    );
}

export default async function EditBlogPostPage({
    params,
    searchParams,
}: PageProps) {
    const { id } = await params;
    const query = await searchParams;

    await requireAdminAccess();

    const adminSupabase =
        createAdminClient();

    const [
        postResult,
        placementsResult,
        contentProfilesResult,
        staffProfilesResult,
        groupsResult,
        categoriesResult,
    ] = await Promise.all([
        adminSupabase
            .from("blog_posts")
            .select(`
                id,
                title,
                slug,
                excerpt,
                content,
                cover_image_url,
                cover_image_alt,
                category_id,
                content_profile_id,
                author_id,
                tags,
                status,
                seo_title,
                seo_description,
                published_at
            `)
            .eq("id", id)
            .maybeSingle(),

        adminSupabase
            .from("blog_post_placements")
            .select(`
                placement_type,
                sort_order,
                is_active
            `)
            .eq("blog_post_id", id),

        adminSupabase
            .from("content_profiles")
            .select(`
                id,
                display_name,
                username
            `)
            .eq("is_active", true)
            .eq("is_archived", false)
            .order("display_name", {
                ascending: true,
            }),

        adminSupabase
            .from("profiles")
            .select(`
                id,
                display_name,
                username,
                role
            `)
            .in("role", [
                "admin",
                "moderator",
            ])
            .order("display_name", {
                ascending: true,
            }),

        adminSupabase
            .from("category_groups")
            .select(`
                id,
                name,
                sort_order
            `)
            .eq("is_active", true)
            .order("sort_order", {
                ascending: true,
            }),

        adminSupabase
            .from("categories")
            .select(`
                id,
                group_id,
                name,
                sort_order
            `)
            .eq("is_active", true)
            .order("sort_order", {
                ascending: true,
            }),
    ]);

    if (
        postResult.error ||
        !postResult.data
    ) {
        notFound();
    }

    const post =
        postResult.data as BlogPost;

    const placements =
        (placementsResult.data ??
            []) as Placement[];

    const contentProfiles =
        (contentProfilesResult.data ??
            []) as ContentProfile[];

    const staffProfiles =
        (staffProfilesResult.data ??
            []) as StaffProfile[];

    const categoryGroups =
        (groupsResult.data ??
            []) as CategoryGroup[];

    const categories =
        (categoriesResult.data ??
            []) as Category[];

    const featuredMain =
        getPlacement(
            placements,
            "featured_main"
        );

    const featuredSide =
        getPlacement(
            placements,
            "featured_side"
        );

    const quickLearn =
        getPlacement(
            placements,
            "quick_learn"
        );

    const editorPick =
        getPlacement(
            placements,
            "editor_pick"
        );

    const authorValue =
        post.content_profile_id
            ? `content:${post.content_profile_id}`
            : post.author_id
                ? `staff:${post.author_id}`
                : "";

    async function updateBlogPost(
        formData: FormData
    ) {
        "use server";

        await requireAdminAccess();

        const adminSupabase =
            createAdminClient();

        const title = getText(
            formData,
            "title"
        );

        const requestedSlug = getText(
            formData,
            "slug"
        );

        const excerpt = getText(
            formData,
            "excerpt"
        );

        const content = getText(
            formData,
            "content"
        );

        const categoryIdText = getText(
            formData,
            "category_id"
        );

        const authorValue = getText(
            formData,
            "author"
        );

        const status = getText(
            formData,
            "status"
        );

        const coverImageAlt = getText(
            formData,
            "cover_image_alt"
        );

        const seoTitle = getText(
            formData,
            "seo_title"
        );

        const seoDescription = getText(
            formData,
            "seo_description"
        );

        const tagsText = getText(
            formData,
            "tags"
        );

        const featuredMainSelected =
            formData.get(
                "placement_featured_main"
            ) === "on";

        const featuredSideSelected =
            formData.get(
                "placement_featured_side"
            ) === "on";

        const quickLearnSelected =
            formData.get(
                "placement_quick_learn"
            ) === "on";

        const editorPickSelected =
            formData.get(
                "placement_editor_pick"
            ) === "on";

        const getPlacementOrder = (
            key: string
        ) => {
            const value = Number(
                getText(formData, key)
            );

            return Number.isInteger(value) &&
                value >= 1
                ? value
                : 1;
        };

        const placementRows = [
            featuredMainSelected
                ? {
                    blog_post_id: id,
                    placement_type:
                        "featured_main" as const,
                    sort_order:
                        getPlacementOrder(
                            "featured_main_order"
                        ),
                    is_active: true,
                }
                : null,

            featuredSideSelected
                ? {
                    blog_post_id: id,
                    placement_type:
                        "featured_side" as const,
                    sort_order:
                        getPlacementOrder(
                            "featured_side_order"
                        ),
                    is_active: true,
                }
                : null,

            quickLearnSelected
                ? {
                    blog_post_id: id,
                    placement_type:
                        "quick_learn" as const,
                    sort_order:
                        getPlacementOrder(
                            "quick_learn_order"
                        ),
                    is_active: true,
                }
                : null,

            editorPickSelected
                ? {
                    blog_post_id: id,
                    placement_type:
                        "editor_pick" as const,
                    sort_order:
                        getPlacementOrder(
                            "editor_pick_order"
                        ),
                    is_active: true,
                }
                : null,
        ].filter(
            (
                placement
            ): placement is NonNullable<
                typeof placement
            > => placement !== null
        );

        const slug = slugifyTurkish(
            requestedSlug || title
        );

        const categoryId =
            Number(categoryIdText);

        const [
            authorType,
            authorId,
        ] = authorValue.split(":");

        const tags = Array.from(
            new Set(
                tagsText
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
            )
        ).slice(0, 12);

        const blocks =
            contentToBlocks(content);

        if (
            title.length < 10 ||
            title.length > 180 ||
            slug.length < 3 ||
            excerpt.length < 30 ||
            excerpt.length > 320 ||
            content.length < 80 ||
            blocks.length === 0 ||
            !Number.isInteger(categoryId) ||
            categoryId <= 0 ||
            !authorId ||
            !["content", "staff"].includes(
                authorType
            ) ||
            ![
                "draft",
                "published",
                "archived",
            ].includes(status)
        ) {
            redirect(
                `/admin/blog/${id}?error=invalid`
            );
        }

        const [
            currentPostCheck,
            categoryCheck,
            authorCheck,
            slugCheck,
        ] = await Promise.all([
            adminSupabase
                .from("blog_posts")
                .select(`
                    id,
                    cover_image_url,
                    published_at
                `)
                .eq("id", id)
                .maybeSingle(),

            adminSupabase
                .from("categories")
                .select(`
                    id,
                    name
                `)
                .eq("id", categoryId)
                .eq("is_active", true)
                .maybeSingle(),

            authorType === "content"
                ? adminSupabase
                    .from("content_profiles")
                    .select("id")
                    .eq("id", authorId)
                    .eq("is_active", true)
                    .eq("is_archived", false)
                    .maybeSingle()
                : adminSupabase
                    .from("profiles")
                    .select("id")
                    .eq("id", authorId)
                    .in("role", [
                        "admin",
                        "moderator",
                    ])
                    .maybeSingle(),

            adminSupabase
                .from("blog_posts")
                .select("id")
                .eq("slug", slug)
                .neq("id", id)
                .maybeSingle(),
        ]);

        if (
            currentPostCheck.error ||
            !currentPostCheck.data
        ) {
            notFound();
        }

        if (
            categoryCheck.error ||
            !categoryCheck.data
        ) {
            console.error(
                "Blog kategori doğrulama hatası:",
                {
                    categoryId,
                    error:
                        categoryCheck.error
                            ?.message ??
                        "Kategori bulunamadı",
                }
            );

            redirect(
                `/admin/blog/${id}?error=category`
            );
        }

        if (
            authorCheck.error ||
            !authorCheck.data
        ) {
            redirect(
                `/admin/blog/${id}?error=profile`
            );
        }

        if (slugCheck.error) {
            console.error(
                "Blog slug kontrolü yapılamadı:",
                slugCheck.error.message
            );

            redirect(
                `/admin/blog/${id}?error=update`
            );
        }

        if (slugCheck.data) {
            redirect(
                `/admin/blog/${id}?error=slug`
            );
        }

        let coverImageUrl =
            currentPostCheck.data
                .cover_image_url;

        const coverImage =
            formData.get("cover_image");

        if (
            coverImage instanceof File &&
            coverImage.size > 0
        ) {
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/avif",
            ];

            if (
                !allowedTypes.includes(
                    coverImage.type
                ) ||
                coverImage.size >
                8 * 1024 * 1024
            ) {
                redirect(
                    `/admin/blog/${id}?error=image`
                );
            }

            const extensionByMimeType: Record<string, string> = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/webp": "webp",
                "image/avif": "avif",
            };

            const extension =
                extensionByMimeType[coverImage.type];

            if (!extension) {
                redirect(
                    "/admin/blog/yeni?error=image"
                );
            }

            const imagePath =
                `covers/${Date.now()}-${crypto.randomUUID()}.${extension}`;

            const imageBuffer =
                Buffer.from(
                    await coverImage.arrayBuffer()
                );

            const {
                error: uploadError,
            } = await adminSupabase.storage
                .from("blog-images")
                .upload(
                    imagePath,
                    imageBuffer,
                    {
                        contentType:
                            coverImage.type,
                        upsert: false,
                        cacheControl:
                            "31536000",
                    }
                );

            if (uploadError) {
                console.error(
                    "Blog kapak görseli yüklenemedi:",
                    uploadError.message
                );

                redirect(
                    `/admin/blog/${id}?error=upload`
                );
            }

            const {
                data: publicUrlData,
            } = adminSupabase.storage
                .from("blog-images")
                .getPublicUrl(imagePath);

            coverImageUrl =
                publicUrlData.publicUrl;
        }

        const readingTime = Math.max(
            1,
            Math.ceil(
                content
                    .split(/\s+/)
                    .filter(Boolean).length /
                220
            )
        );

        const wasPublished =
            Boolean(
                currentPostCheck.data
                    .published_at
            );

        const publishedAt =
            status === "published"
                ? wasPublished
                    ? currentPostCheck.data
                        .published_at
                    : new Date().toISOString()
                : null;

        const {
            error: updateError,
        } = await adminSupabase
            .from("blog_posts")
            .update({
                title,
                slug,
                excerpt,
                content: blocks,
                cover_image_url:
                    coverImageUrl,
                cover_image_alt:
                    coverImageAlt || title,
                category:
                    categoryCheck.data.name,
                category_id: categoryId,
                tags,
                content_profile_id:
                    authorType === "content"
                        ? authorId
                        : null,
                author_id:
                    authorType === "staff"
                        ? authorId
                        : null,
                status,
                is_featured:
                    featuredMainSelected ||
                    featuredSideSelected,
                reading_time: readingTime,
                seo_title:
                    seoTitle || title,
                seo_description:
                    seoDescription || excerpt,
                published_at: publishedAt,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            console.error(
                "Blog yazısı güncellenemedi:",
                updateError.message
            );

            redirect(
                `/admin/blog/${id}?error=update`
            );
        }

        if (featuredMainSelected) {
            const {
                error:
                deactivateMainError,
            } = await adminSupabase
                .from(
                    "blog_post_placements"
                )
                .update({
                    is_active: false,
                })
                .eq(
                    "placement_type",
                    "featured_main"
                )
                .neq(
                    "blog_post_id",
                    id
                )
                .eq("is_active", true);

            if (deactivateMainError) {
                console.error(
                    "Eski ana öne çıkan yazı kapatılamadı:",
                    deactivateMainError.message
                );
            }
        }

        const {
            error: deletePlacementsError,
        } = await adminSupabase
            .from("blog_post_placements")
            .delete()
            .eq("blog_post_id", id);

        if (deletePlacementsError) {
            console.error(
                "Eski blog yerleşimleri silinemedi:",
                deletePlacementsError.message
            );

            redirect(
                `/admin/blog/${id}?error=placement`
            );
        }

        if (
            placementRows.length > 0
        ) {
            const {
                error: placementsError,
            } = await adminSupabase
                .from(
                    "blog_post_placements"
                )
                .insert(placementRows);

            if (placementsError) {
                console.error(
                    "Blog yerleşimleri güncellenemedi:",
                    placementsError.message
                );

                redirect(
                    `/admin/blog/${id}?error=placement`
                );
            }
        }

        revalidatePath(
            "/admin/blog"
        );
        revalidatePath("/blog");
        revalidatePath(
            `/blog/${slug}`
        );

        redirect(
            `/admin/blog/${id}?saved=1`
        );
    }

    const contentValue =
        blocksToContent(post.content);

    return (
        <>
            <header
                className={
                    styles.pageHeader
                }
            >
                <div>
                    <span>
                        BLOG YÖNETİMİ
                    </span>

                    <h1>
                        Blog Yazısını Düzenle
                    </h1>

                    <p>
                        Yazı içeriğini,
                        yayın durumunu ve
                        görünüm alanlarını
                        güncelle.
                    </p>
                </div>

                <Link
                    href="/admin/blog"
                    className={
                        pageStyles.backButton
                    }
                >
                    Blog yazılarına dön
                </Link>
            </header>

            <section
                className={
                    styles.panel
                }
            >
                <div
                    className={
                        styles.panelHeader
                    }
                >
                    <div>
                        <span>
                            İÇERİK DÜZENLE
                        </span>

                        <h2>
                            Blog Yazısı Bilgileri
                        </h2>
                    </div>

                    <div
                        className={
                            pageStyles.adminPublishBadge
                        }
                    >
                        BLOG EDİTÖRÜ
                    </div>
                </div>

                {query.saved === "1" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                        style={{
                            borderColor:
                                "rgba(34, 197, 94, 0.45)",
                            background:
                                "rgba(34, 197, 94, 0.10)",
                        }}
                    >
                        Blog yazısı başarıyla güncellendi.
                    </div>
                ) : null}

                {query.error === "invalid" ? (
                    <div className={pageStyles.errorMessage}>
                        Başlık, özet, içerik, kategori, yazar veya yayın durumu geçersiz.
                    </div>
                ) : null}

                {query.error === "profile" ? (
                    <div className={pageStyles.errorMessage}>
                        Seçilen yazar aktif değil veya bulunamadı.
                    </div>
                ) : null}

                {query.error === "category" ? (
                    <div className={pageStyles.errorMessage}>
                        Seçilen kategori aktif değil veya bulunamadı.
                    </div>
                ) : null}

                {query.error === "slug" ? (
                    <div className={pageStyles.errorMessage}>
                        Bu bağlantı adı başka bir yazıda kullanılıyor.
                    </div>
                ) : null}

                {query.error === "image" ? (
                    <div className={pageStyles.errorMessage}>
                        Kapak görseli JPG, PNG, WEBP veya AVIF olmalı ve 8 MB’ı geçmemeli.
                    </div>
                ) : null}

                {query.error === "upload" ? (
                    <div className={pageStyles.errorMessage}>
                        Yeni kapak görseli yüklenemedi.
                    </div>
                ) : null}

                {query.error === "update" ? (
                    <div className={pageStyles.errorMessage}>
                        Blog yazısı güncellenemedi. Sunucu kayıtlarını kontrol et.
                    </div>
                ) : null}

                {query.error === "placement" ? (
                    <div className={pageStyles.errorMessage}>
                        Blog yerleşim alanları güncellenemedi.
                    </div>
                ) : null}

                <form
                    action={updateBlogPost}
                    className={
                        pageStyles.form
                    }
                >
                    <div
                        className={
                            pageStyles.formGrid
                        }
                    >
                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>
                                Yazı Başlığı
                            </span>

                            <input
                                type="text"
                                name="title"
                                minLength={10}
                                maxLength={180}
                                required
                                defaultValue={
                                    post.title
                                }
                            />
                        </label>

                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>
                                Bağlantı Adı
                                (Slug)
                            </span>

                            <input
                                type="text"
                                name="slug"
                                maxLength={120}
                                defaultValue={
                                    post.slug
                                }
                            />
                        </label>

                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>
                                Yazar Profili
                            </span>

                            <select
                                name="author"
                                required
                                defaultValue={
                                    authorValue
                                }
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Yazar seç
                                </option>

                                {contentProfiles.length >
                                    0 ? (
                                    <optgroup label="İçerik Profilleri">
                                        {contentProfiles.map(
                                            (
                                                profile
                                            ) => (
                                                <option
                                                    key={`content-${profile.id}`}
                                                    value={`content:${profile.id}`}
                                                >
                                                    {getProfileLabel(
                                                        profile
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </optgroup>
                                ) : null}

                                {staffProfiles.length >
                                    0 ? (
                                    <optgroup label="Yönetim Ekibi">
                                        {staffProfiles.map(
                                            (
                                                profile
                                            ) => (
                                                <option
                                                    key={`staff-${profile.id}`}
                                                    value={`staff:${profile.id}`}
                                                >
                                                    {getStaffLabel(
                                                        profile
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </optgroup>
                                ) : null}
                            </select>
                        </label>

                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>
                                Kategori
                            </span>

                            <select
                                name="category_id"
                                required
                                defaultValue={
                                    post.category_id ??
                                    ""
                                }
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Kategori seç
                                </option>

                                {categoryGroups.map(
                                    (group) => {
                                        const groupCategories =
                                            categories.filter(
                                                (
                                                    category
                                                ) =>
                                                    category.group_id ===
                                                    group.id
                                            );

                                        if (
                                            groupCategories.length ===
                                            0
                                        ) {
                                            return null;
                                        }

                                        return (
                                            <optgroup
                                                key={
                                                    group.id
                                                }
                                                label={
                                                    group.name
                                                }
                                            >
                                                {groupCategories.map(
                                                    (
                                                        category
                                                    ) => (
                                                        <option
                                                            key={
                                                                category.id
                                                            }
                                                            value={
                                                                category.id
                                                            }
                                                        >
                                                            {
                                                                category.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </optgroup>
                                        );
                                    }
                                )}
                            </select>
                        </label>
                    </div>

                    <label
                        className={
                            pageStyles.field
                        }
                    >
                        <span>
                            Kısa Özet
                        </span>

                        <textarea
                            name="excerpt"
                            minLength={30}
                            maxLength={320}
                            required
                            rows={3}
                            defaultValue={
                                post.excerpt
                            }
                        />
                    </label>

                    <div
                        className={`${pageStyles.formGrid} ${pageStyles.equalFieldGrid}`}
                    >
                        <label
                            className={`${pageStyles.field} ${pageStyles.coverUploadField}`}
                        >
                            <span>
                                Yeni Kapak Görseli
                            </span>

                            <input
                                type="file"
                                name="cover_image"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                            />

                            <small>
                                Boş bırakırsan mevcut görsel korunur.
                            </small>
                        </label>

                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>
                                Görsel Alt Metni
                            </span>

                            <input
                                type="text"
                                name="cover_image_alt"
                                maxLength={180}
                                defaultValue={
                                    post.cover_image_alt ??
                                    ""
                                }
                            />

                            <small className={pageStyles.coverHelperText}>
                                Erişilebilirlik ve görsel SEO için kullanılır.
                            </small>
                        </label>
                    </div>

                    {post.cover_image_url ? (
                        <div
                            style={{
                                borderRadius: 18,
                                overflow: "hidden",
                                border:
                                    "1px solid rgba(255,255,255,0.10)",
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={
                                    post.cover_image_url
                                }
                                alt={
                                    post.cover_image_alt ??
                                    post.title
                                }
                                style={{
                                    display:
                                        "block",
                                    width: "100%",
                                    maxHeight:
                                        360,
                                    objectFit:
                                        "cover",
                                }}
                            />
                        </div>
                    ) : null}

                    <label
                        className={`${pageStyles.field} ${pageStyles.contentField}`}
                    >
                        <span>
                            Yazı İçeriği
                        </span>

                        <textarea
                            name="content"
                            minLength={80}
                            required
                            rows={18}
                            defaultValue={
                                contentValue
                            }
                        />

                        <small>
                            Paragrafları boş satırla ayır. “##” ana başlık, “###” alt başlık, “&gt;” bilgi kutusu oluşturur.
                        </small>
                    </label>

                    <div
                        className={`${pageStyles.formGrid} ${pageStyles.equalFieldGrid}`}
                    >
                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>
                                Etiketler
                            </span>

                            <input
                                type="text"
                                name="tags"
                                maxLength={240}
                                defaultValue={
                                    (
                                        post.tags ??
                                        []
                                    ).join(
                                        ", "
                                    )
                                }
                            />
                        </label>

                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>
                                Yayın Durumu
                            </span>

                            <select
                                name="status"
                                defaultValue={
                                    post.status
                                }
                                required
                            >
                                <option value="draft">
                                    Taslak
                                </option>

                                <option value="published">
                                    Yayında
                                </option>

                                <option value="archived">
                                    Arşivlendi
                                </option>
                            </select>
                        </label>
                    </div>

                    <section
                        className={
                            pageStyles.placementSection
                        }
                    >
                        <div
                            className={
                                pageStyles.placementHeader
                            }
                        >
                            <span>
                                BLOG YERLEŞİMİ
                            </span>

                            <h3>
                                Yazının Görüneceği Alanlar
                            </h3>

                            <p>
                                Seçimleri değiştirip yazıyı yeniden konumlandırabilirsin.
                            </p>
                        </div>

                        <div
                            className={
                                pageStyles.placementGrid
                            }
                        >
                            <label className={pageStyles.placementCard}>
                                <span className={pageStyles.placementCheck}>
                                    <input
                                        type="checkbox"
                                        name="placement_featured_main"
                                        defaultChecked={Boolean(
                                            featuredMain
                                        )}
                                    />

                                    <span>
                                        <strong>
                                            Ana Öne Çıkan
                                        </strong>

                                        <small>
                                            Sayfanın büyük ana kartı.
                                        </small>
                                    </span>
                                </span>

                                <span className={pageStyles.orderField}>
                                    <span>Sıra</span>

                                    <input
                                        type="number"
                                        name="featured_main_order"
                                        min={1}
                                        defaultValue={
                                            featuredMain
                                                ?.sort_order ??
                                            1
                                        }
                                    />
                                </span>
                            </label>

                            <label className={pageStyles.placementCard}>
                                <span className={pageStyles.placementCheck}>
                                    <input
                                        type="checkbox"
                                        name="placement_featured_side"
                                        defaultChecked={Boolean(
                                            featuredSide
                                        )}
                                    />

                                    <span>
                                        <strong>
                                            Yan Öne Çıkan
                                        </strong>

                                        <small>
                                            Ana kartın yanındaki küçük kart.
                                        </small>
                                    </span>
                                </span>

                                <span className={pageStyles.orderField}>
                                    <span>Sıra</span>

                                    <input
                                        type="number"
                                        name="featured_side_order"
                                        min={1}
                                        defaultValue={
                                            featuredSide
                                                ?.sort_order ??
                                            1
                                        }
                                    />
                                </span>
                            </label>

                            <label className={pageStyles.placementCard}>
                                <span className={pageStyles.placementCheck}>
                                    <input
                                        type="checkbox"
                                        name="placement_quick_learn"
                                        defaultChecked={Boolean(
                                            quickLearn
                                        )}
                                    />

                                    <span>
                                        <strong>
                                            5 Dakikada Öğren
                                        </strong>

                                        <small>
                                            Kısa öğrenme içerikleri alanı.
                                        </small>
                                    </span>
                                </span>

                                <span className={pageStyles.orderField}>
                                    <span>Sıra</span>

                                    <input
                                        type="number"
                                        name="quick_learn_order"
                                        min={1}
                                        defaultValue={
                                            quickLearn
                                                ?.sort_order ??
                                            1
                                        }
                                    />
                                </span>
                            </label>

                            <label className={pageStyles.placementCard}>
                                <span className={pageStyles.placementCheck}>
                                    <input
                                        type="checkbox"
                                        name="placement_editor_pick"
                                        defaultChecked={Boolean(
                                            editorPick
                                        )}
                                    />

                                    <span>
                                        <strong>
                                            ForumFenomen Seçkisi
                                        </strong>

                                        <small>
                                            Editör seçkisi alanı.
                                        </small>
                                    </span>
                                </span>

                                <span className={pageStyles.orderField}>
                                    <span>Sıra</span>

                                    <input
                                        type="number"
                                        name="editor_pick_order"
                                        min={1}
                                        defaultValue={
                                            editorPick
                                                ?.sort_order ??
                                            1
                                        }
                                    />
                                </span>
                            </label>
                        </div>
                    </section>

                    <div
                        className={
                            pageStyles.seoSection
                        }
                    >
                        <div>
                            <span>
                                SEO AYARLARI
                            </span>

                            <h3>
                                Arama Motoru Bilgileri
                            </h3>
                        </div>

                        <div
                            className={`${pageStyles.formGrid} ${pageStyles.seoGrid}`}
                        >
                            <label
                                className={
                                    pageStyles.field
                                }
                            >
                                <span>
                                    SEO Başlığı
                                </span>

                                <textarea
                                    name="seo_title"
                                    maxLength={70}
                                    rows={3}
                                    defaultValue={
                                        post.seo_title ??
                                        ""
                                    }
                                />
                            </label>

                            <label
                                className={
                                    pageStyles.field
                                }
                            >
                                <span>
                                    Meta Açıklaması
                                </span>

                                <textarea
                                    name="seo_description"
                                    maxLength={180}
                                    rows={3}
                                    defaultValue={
                                        post.seo_description ??
                                        ""
                                    }
                                />
                            </label>
                        </div>
                    </div>

                    <div
                        className={
                            pageStyles.actions
                        }
                    >
                        <Link
                            href="/admin/blog"
                            className={
                                pageStyles.cancelButton
                            }
                        >
                            Vazgeç
                        </Link>

                        <button
                            type="submit"
                            className={
                                pageStyles.submitButton
                            }
                        >
                            Değişiklikleri Kaydet
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}