import Link from "next/link";
import {
    redirect,
} from "next/navigation";
import {
    revalidatePath,
} from "next/cache";

import { requireAdminAccess } from "@/lib/admin/require-admin-access";
import { createAdminClient } from "@/lib/supabase/admin";

import styles from "../../admin.module.css";
import pageStyles from "./page.module.css";

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

type PageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

function getText(
    formData: FormData,
    key: string
) {
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

export default async function NewBlogPostPage({
    searchParams,
}: PageProps) {
    const params = await searchParams;

    const { supabase } =
        await requireAdminAccess();

    const [
        contentProfilesResult,
        staffProfilesResult,
        groupsResult,
        categoriesResult,
    ] = await Promise.all([
        supabase
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

        supabase
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

        supabase
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

        supabase
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

    if (contentProfilesResult.error) {
        console.error(
            "Blog içerik profilleri alınamadı:",
            contentProfilesResult.error.message
        );
    }

    if (staffProfilesResult.error) {
        console.error(
            "Blog yönetim ekibi alınamadı:",
            staffProfilesResult.error.message
        );
    }

    if (groupsResult.error) {
        console.error(
            "Blog kategori grupları alınamadı:",
            groupsResult.error.message
        );
    }

    if (categoriesResult.error) {
        console.error(
            "Blog kategorileri alınamadı:",
            categoriesResult.error.message
        );
    }

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

    async function createBlogPost(
        formData: FormData
    ) {
        "use server";

        await requireAdminAccess();

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

        const isFeatured =
            formData.get("is_featured") === "on";

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

        const blocks = contentToBlocks(content);

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
            !["draft", "published"].includes(status)
        ) {
            redirect(
                "/admin/blog/yeni?error=invalid"
            );
        }

        const adminSupabase =
            createAdminClient();

        const [
            categoryCheck,
            authorCheck,
            slugCheck,
        ] = await Promise.all([
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
                .maybeSingle(),
        ]);

        if (
            categoryCheck.error ||
            !categoryCheck.data
        ) {
            redirect(
                "/admin/blog/yeni?error=category"
            );
        }

        if (
            authorCheck.error ||
            !authorCheck.data
        ) {
            redirect(
                "/admin/blog/yeni?error=profile"
            );
        }

        if (slugCheck.error) {
            console.error(
                "Blog slug kontrolü yapılamadı:",
                slugCheck.error.message
            );

            redirect(
                "/admin/blog/yeni?error=insert"
            );
        }

        if (slugCheck.data) {
            redirect(
                "/admin/blog/yeni?error=slug"
            );
        }

        let coverImageUrl: string | null =
            null;

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
                coverImage.size > 8 * 1024 * 1024
            ) {
                redirect(
                    "/admin/blog/yeni?error=image"
                );
            }

            const extension =
                coverImage.name
                    .split(".")
                    .pop()
                    ?.toLocaleLowerCase("tr-TR")
                    .replace(/[^a-z0-9]/g, "") ||
                "webp";

            const imagePath =
                `covers/${Date.now()}-${crypto.randomUUID()}.${extension}`;

            const imageBuffer =
                Buffer.from(
                    await coverImage.arrayBuffer()
                );

            const { error: uploadError } =
                await adminSupabase.storage
                    .from("blog-images")
                    .upload(
                        imagePath,
                        imageBuffer,
                        {
                            contentType:
                                coverImage.type,
                            upsert: false,
                            cacheControl: "31536000",
                        }
                    );

            if (uploadError) {
                console.error(
                    "Blog kapak görseli yüklenemedi:",
                    uploadError.message
                );

                redirect(
                    "/admin/blog/yeni?error=upload"
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
                    .filter(Boolean).length / 220
            )
        );

        const publishedAt =
            status === "published"
                ? new Date().toISOString()
                : null;

        const {
            data: insertedPost,
            error: insertError,
        } = await adminSupabase
            .from("blog_posts")
            .insert({
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
                is_featured: isFeatured,
                reading_time: readingTime,
                seo_title:
                    seoTitle || title,
                seo_description:
                    seoDescription || excerpt,
                published_at: publishedAt,
            })
            .select("id")
            .single();

        if (insertError || !insertedPost) {
            console.error(
                "Blog yazısı oluşturulamadı:",
                insertError?.message
            );

            redirect(
                "/admin/blog/yeni?error=insert"
            );
        }

        revalidatePath("/admin/blog");
        revalidatePath("/blog");

        if (status === "published") {
            revalidatePath(`/blog/${slug}`);
        }

        redirect("/admin/blog");
    }

    const hasLoadError =
        Boolean(contentProfilesResult.error) ||
        Boolean(staffProfilesResult.error) ||
        Boolean(groupsResult.error) ||
        Boolean(categoriesResult.error);

    const hasAuthors =
        contentProfiles.length > 0 ||
        staffProfiles.length > 0;

    return (
        <>
            <header className={styles.pageHeader}>
                <div>
                    <span>BLOG YÖNETİMİ</span>

                    <h1>Yeni Blog Yazısı</h1>

                    <p>
                        Görselli, okunabilir ve SEO uyumlu
                        yeni bir blog içeriği oluştur.
                    </p>
                </div>

                <Link
                    href="/admin/blog"
                    className={pageStyles.backButton}
                >
                    Blog yazılarına dön
                </Link>
            </header>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span>YENİ İÇERİK</span>

                        <h2>Blog Yazısı Bilgileri</h2>
                    </div>

                    <div
                        className={
                            pageStyles.adminPublishBadge
                        }
                    >
                        BLOG EDİTÖRÜ
                    </div>
                </div>

                {params.error === "invalid" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Başlık, özet, içerik, kategori,
                        yazar veya yayın durumu geçersiz.
                    </div>
                ) : null}

                {params.error === "profile" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Seçilen yazar aktif değil veya
                        bulunamadı.
                    </div>
                ) : null}

                {params.error === "category" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Seçilen kategori aktif değil veya
                        bulunamadı.
                    </div>
                ) : null}

                {params.error === "slug" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Bu bağlantı adı daha önce
                        kullanılmış. Farklı bir slug yaz.
                    </div>
                ) : null}

                {params.error === "image" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Kapak görseli JPG, PNG, WEBP veya
                        AVIF olmalı ve 8 MB’ı geçmemeli.
                    </div>
                ) : null}

                {params.error === "upload" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Kapak görseli yüklenemedi.
                        Storage ayarlarını kontrol et.
                    </div>
                ) : null}

                {params.error === "insert" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Blog yazısı kaydedilemedi. Sunucu
                        kayıtlarını kontrol et.
                    </div>
                ) : null}

                {hasLoadError ? (
                    <div className={styles.emptyState}>
                        Yazar veya kategori bilgileri
                        alınamadı.
                    </div>
                ) : !hasAuthors ? (
                    <div className={styles.emptyState}>
                        Blog yazarı olarak kullanılabilecek
                        profil bulunmuyor.
                    </div>
                ) : categories.length === 0 ? (
                    <div className={styles.emptyState}>
                        Aktif kategori bulunmuyor.
                    </div>
                ) : (
                    <form
                        action={createBlogPost}
                        className={pageStyles.form}
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
                                <span>Yazı Başlığı</span>

                                <input
                                    type="text"
                                    name="title"
                                    minLength={10}
                                    maxLength={180}
                                    required
                                    placeholder="Örnek: Instagram’da büyümek için 10 etkili yöntem"
                                />

                                <small>
                                    10–180 karakter arasında,
                                    güçlü ve açıklayıcı bir başlık.
                                </small>
                            </label>

                            <label
                                className={
                                    pageStyles.field
                                }
                            >
                                <span>Bağlantı Adı (Slug)</span>

                                <input
                                    type="text"
                                    name="slug"
                                    maxLength={120}
                                    placeholder="Boş bırakırsan başlıktan oluşturulur"
                                />

                                <small>
                                    Örnek:
                                    instagramda-buyumek-icin-10-yontem
                                </small>
                            </label>

                            <label
                                className={
                                    pageStyles.field
                                }
                            >
                                <span>Yazar Profili</span>

                                <select
                                    name="author"
                                    required
                                    defaultValue=""
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
                                                (profile) => (
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

                                    {staffProfiles.length > 0 ? (
                                        <optgroup label="Yönetim Ekibi">
                                            {staffProfiles.map(
                                                (profile) => (
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

                                <small>
                                    İçerik profili, admin veya moderatör seç.
                                </small>

                            </label>

                            <label
                                className={
                                    pageStyles.field
                                }
                            >
                                <span>Kategori</span>

                                <select
                                    name="category_id"
                                    required
                                    defaultValue=""
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
                                                    (category) =>
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
                                                    key={group.id}
                                                    label={group.name}
                                                >
                                                    {groupCategories.map(
                                                        (category) => (
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

                                <small>
                                    Ana kategori grupları ve tüm
                                    aktif alt kategoriler listelenir.
                                </small>
                            </label>
                        </div>

                        <label
                            className={
                                pageStyles.field
                            }
                        >
                            <span>Kısa Özet</span>

                            <textarea
                                name="excerpt"
                                minLength={30}
                                maxLength={320}
                                required
                                rows={3}
                                placeholder="Kartlarda ve arama sonuçlarında görünecek kısa, merak uyandıran özet..."
                            />

                            <small>
                                30–320 karakter. Yazının neden
                                okunması gerektiğini anlat.
                            </small>
                        </label>

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
                                <span>Kapak Görseli</span>

                                <input
                                    type="file"
                                    name="cover_image"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                />

                                <small>
                                    JPG, PNG, WEBP veya AVIF.
                                    En fazla 8 MB.
                                </small>
                            </label>

                            <label
                                className={
                                    pageStyles.field
                                }
                            >
                                <span>Görsel Alt Metni</span>

                                <input
                                    type="text"
                                    name="cover_image_alt"
                                    maxLength={180}
                                    placeholder="Görselde ne olduğunu açıkla"
                                />

                                <small>
                                    Erişilebilirlik ve görsel SEO
                                    için kullanılır.
                                </small>
                            </label>
                        </div>

                        <label
                            className={`${pageStyles.field} ${pageStyles.contentField}`}
                        >
                            <span>Yazı İçeriği</span>

                            <textarea
                                name="content"
                                minLength={80}
                                required
                                rows={18}
                                placeholder={`Giriş paragrafını yaz...

## Ana başlık

Kısa ve okunabilir paragraflar kullan.

> Önemli bilgileri bu biçimde bilgi kutusuna dönüştürebilirsin.

### Alt başlık

Devam eden içerik...`}
                            />

                            <small>
                                Paragrafları boş satırla ayır.
                                “##” ana başlık, “###” alt başlık,
                                “&gt;” bilgi kutusu oluşturur.
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
                                <span>Etiketler</span>

                                <input
                                    type="text"
                                    name="tags"
                                    maxLength={240}
                                    placeholder="instagram, algoritma, büyüme"
                                />

                                <small>
                                    Virgülle ayır. En fazla 12
                                    etiket kaydedilir.
                                </small>
                            </label>

                            <label
                                className={
                                    pageStyles.field
                                }
                            >
                                <span>Yayın Durumu</span>

                                <select
                                    name="status"
                                    defaultValue="draft"
                                    required
                                >
                                    <option value="draft">
                                        Taslak olarak kaydet
                                    </option>

                                    <option value="published">
                                        Hemen yayınla
                                    </option>
                                </select>

                                <small>
                                    Yazıyı taslak olarak sakla veya
                                    doğrudan yayınla.
                                </small>
                            </label>
                        </div>

                        <label
                            className={
                                pageStyles.checkboxField
                            }
                        >
                            <input
                                type="checkbox"
                                name="is_featured"
                            />

                            <span>
                                <strong>
                                    Öne çıkan yazı
                                </strong>

                                <small>
                                    Blog ana sayfasındaki büyük
                                    içerik alanında gösterilmeye
                                    uygun olarak işaretle.
                                </small>
                            </span>
                        </label>

                        <div
                            className={
                                pageStyles.seoSection
                            }
                        >
                            <div>
                                <span>SEO AYARLARI</span>

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
                                    <span>SEO Başlığı</span>

                                    <textarea
                                        name="seo_title"
                                        maxLength={70}
                                        rows={3}
                                        placeholder="Boş bırakırsan yazı başlığı kullanılır"
                                    />
                                </label>

                                <label
                                    className={
                                        pageStyles.field
                                    }
                                >
                                    <span>Meta Açıklaması</span>

                                    <textarea
                                        name="seo_description"
                                        maxLength={180}
                                        rows={3}
                                        placeholder="Boş bırakırsan kısa özet kullanılır"
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
                                Blog Yazısını Kaydet
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </>
    );
}