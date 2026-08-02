import Link from "next/link";

import {
    redirect,
} from "next/navigation";

import {
    revalidatePath,
} from "next/cache";

import {
    requireAdminAccess,
} from "@/lib/admin/require-admin-access";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

import styles from "../../admin.module.css";
import pageStyles from "../../konular/yeni/page.module.css";

type ContentProfile = {
    id: string;
    display_name: string;
    username: string;
    specialty: string;
    profile_type:
        | "community"
        | "editor"
        | "expert";
};

type Topic = {
    id: string;
    title: string;
    status: string;

    categories: {
        name: string;
    } | null;
};

type PageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

const profileTypeNames: Record<
    ContentProfile["profile_type"],
    string
> = {
    community: "Topluluk",
    editor: "Editör",
    expert: "Expert",
};

function getRequiredText(
    formData: FormData,
    fieldName: string
) {
    const value = formData.get(fieldName);

    return typeof value === "string"
        ? value.trim()
        : "";
}

export default async function NewAdminCommentPage({
    searchParams,
}: PageProps) {
    const params = await searchParams;

    const { supabase } =
        await requireAdminAccess();

    const [
        profilesResult,
        topicsResult,
    ] = await Promise.all([
        supabase
            .from("content_profiles")
            .select(`
                id,
                display_name,
                username,
                specialty,
                profile_type
            `)
            .eq("is_active", true)
            .eq("is_archived", false)
            .order("created_at", {
                ascending: true,
            }),

        supabase
            .from("topics")
            .select(`
                id,
                title,
                status,
                categories (
                    name
                )
            `)
            .eq("status", "published")
            .order("created_at", {
                ascending: false,
            })
            .limit(200),
    ]);

    if (profilesResult.error) {
        console.error(
            "İçerik profilleri alınamadı:",
            profilesResult.error.message
        );
    }

    if (topicsResult.error) {
        console.error(
            "Konular alınamadı:",
            topicsResult.error.message
        );
    }

    const profiles =
        (profilesResult.data ??
            []) as ContentProfile[];

    const topics =
        (topicsResult.data ??
            []) as unknown as Topic[];

    async function createAdminComment(
        formData: FormData
    ) {
        "use server";

        const { supabase } =
            await requireAdminAccess();

        const contentProfileId =
            getRequiredText(
                formData,
                "content_profile_id"
            );

        const topicId =
            getRequiredText(
                formData,
                "topic_id"
            );

        const content =
            getRequiredText(
                formData,
                "content"
            );

        if (
            !contentProfileId ||
            !topicId ||
            content.length < 2 ||
            content.length > 2000
        ) {
            redirect(
                "/admin/yorumlar/yeni?error=invalid"
            );
        }

        const [
            profileCheck,
            topicCheck,
        ] = await Promise.all([
            supabase
                .from("content_profiles")
                .select("id, username")
                .eq("id", contentProfileId)
                .eq("is_active", true)
                .eq("is_archived", false)
                .maybeSingle(),

            supabase
                .from("topics")
                .select("id")
                .eq("id", topicId)
                .eq("status", "published")
                .maybeSingle(),
        ]);

        if (
            profileCheck.error ||
            topicCheck.error ||
            !profileCheck.data ||
            !topicCheck.data
        ) {
            redirect(
                "/admin/yorumlar/yeni?error=invalid"
            );
        }

        const adminSupabase =
            createAdminClient();

        const { error } =
            await adminSupabase
                .from("topic_comments")
                .insert({
                    topic_id: topicId,
                    author_id: null,
                    content_profile_id:
                        contentProfileId,
                    parent_comment_id: null,
                    content,
                    status: "published",
                });

        if (error) {
            console.error(
                "Admin yorum oluşturma hatası:",
                error.message
            );

            redirect(
                "/admin/yorumlar/yeni?error=insert"
            );
        }

        const cleanUsername =
            profileCheck.data.username
                ?.replace(/^@/, "")
                .trim();

        revalidatePath("/admin/yorumlar");
        revalidatePath(`/konu/${topicId}`);

        if (cleanUsername) {
            revalidatePath(
                `/icerik-profili/${cleanUsername}`
            );
        }

        redirect("/admin/yorumlar");
    }

    const hasLoadError =
        Boolean(profilesResult.error) ||
        Boolean(topicsResult.error);

    return (
        <>
            <header
                className={styles.pageHeader}
            >
                <div>
                    <span>
                        YORUM YÖNETİMİ
                    </span>

                    <h1>
                        Yeni Yorum Oluştur
                    </h1>

                    <p>
                        İçerik profilini ve konuyu
                        seçerek yönetilen profil adına
                        yeni bir yorum yayınla.
                    </p>
                </div>

                <Link
                    href="/admin/yorumlar"
                    className={
                        pageStyles.backButton
                    }
                >
                    Yorumlara dön
                </Link>
            </header>

            <section className={styles.panel}>
                <div
                    className={
                        styles.panelHeader
                    }
                >
                    <div>
                        <span>
                            YENİ YAYIN
                        </span>

                        <h2>
                            Yorum Bilgileri
                        </h2>
                    </div>

                    <div
                        className={
                            pageStyles.adminPublishBadge
                        }
                    >
                        ADMIN YAYINI
                    </div>
                </div>

                {params.error === "invalid" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        İçerik profili, konu veya
                        yorum bilgisi geçersiz.
                        Yorum 2–2000 karakter arasında
                        olmalıdır.
                    </div>
                ) : null}

                {params.error === "insert" ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        Yorum yayınlanırken bir hata
                        oluştu. Lütfen tekrar dene.
                    </div>
                ) : null}

                {hasLoadError ? (
                    <div
                        className={
                            pageStyles.errorMessage
                        }
                    >
                        İçerik profilleri veya konular
                        yüklenemedi. Sayfayı yenileyip
                        tekrar dene.
                    </div>
                ) : null}

                <form
                    action={createAdminComment}
                    className={pageStyles.form}
                >
                    <label
                        className={
                            pageStyles.field
                        }
                    >
                        <span>
                            Yorum Sahibi
                        </span>

                        <select
                            name="content_profile_id"
                            required
                            defaultValue=""
                        >
                            <option
                                value=""
                                disabled
                            >
                                İçerik profili seç
                            </option>

                            {profiles.map(
                                (profile) => {
                                    const username =
                                        profile.username
                                            .replace(
                                                /^@/,
                                                ""
                                            );

                                    return (
                                        <option
                                            key={
                                                profile.id
                                            }
                                            value={
                                                profile.id
                                            }
                                        >
                                            {
                                                profile.display_name
                                            }
                                            {" · "}@
                                            {username}
                                            {" · "}
                                            {
                                                profileTypeNames[
                                                    profile
                                                        .profile_type
                                                ]
                                            }
                                            {" · "}
                                            {
                                                profile.specialty
                                            }
                                        </option>
                                    );
                                }
                            )}
                        </select>

                        <small>
                            Yorum forumda seçilen içerik
                            profilinin adı ve avatarıyla
                            gösterilir.
                        </small>
                    </label>

                    <label
                        className={
                            pageStyles.field
                        }
                    >
                        <span>
                            Yorum Yapılacak Konu
                        </span>

                        <select
                            name="topic_id"
                            required
                            defaultValue=""
                        >
                            <option
                                value=""
                                disabled
                            >
                                Konu seç
                            </option>

                            {topics.map(
                                (topic) => (
                                    <option
                                        key={
                                            topic.id
                                        }
                                        value={
                                            topic.id
                                        }
                                    >
                                        {topic.title}
                                        {" · "}
                                        {topic.categories
                                            ?.name ??
                                            "Genel"}
                                    </option>
                                )
                            )}
                        </select>

                        <small>
                            Yalnızca yayındaki son 200
                            konu listelenir.
                        </small>
                    </label>

                    <label
                        className={
                            pageStyles.field
                        }
                    >
                        <span>
                            Yorum İçeriği
                        </span>

                        <textarea
                            name="content"
                            required
                            minLength={2}
                            maxLength={2000}
                            placeholder="İçerik profili adına yayınlanacak yorumu yaz..."
                        />

                        <small>
                            En fazla 2000 karakter
                            kullanılabilir.
                        </small>
                    </label>

                    <div
                        className={
                            pageStyles.formFooter
                        }
                    >
                        <p>
                            Yorum doğrudan yayında
                            durumuyla yayınlanacaktır.
                        </p>

                        <button
                            type="submit"
                            disabled={
                                hasLoadError ||
                                profiles.length === 0 ||
                                topics.length === 0
                            }
                        >
                            Yorumu Yayınla
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}