import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminAccess } from "@/lib/admin/require-admin-access";
import { createAdminClient } from "@/lib/supabase/admin";

import styles from "../../admin.module.css";
import pageStyles from "./page.module.css";

type ContentProfile = {
  id: string;
  display_name: string;
  username: string;
  specialty: string;
  profile_type: "community" | "editor" | "expert";
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

type EditableTopic = {
  id: string;
  author_id: string | null;
  content_profile_id: string | null;
  category_id: number;
  title: string;
  content: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

const profileTypeNames: Record<ContentProfile["profile_type"], string> = {
  community: "Topluluk",
  editor: "Editör",
  expert: "Uzman",
};

function getRequiredText(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textToSafeHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => {
      const safeParagraph = escapeHtml(paragraph.trim()).replaceAll("\n", "<br>");
      return safeParagraph ? `<p>${safeParagraph}</p>` : "";
    })
    .filter(Boolean)
    .join("");
}

function htmlToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .trim();
}

export default async function EditAdminTopicPage({ params, searchParams }: PageProps) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const topicId = routeParams.id;

  const { supabase } =
  await requireAdminAccess();

  const [topicResult, profilesResult, groupsResult, categoriesResult] = await Promise.all([
    supabase
      .from("topics")
      .select(`
        id,
        author_id,
        content_profile_id,
        category_id,
        title,
        content
      `)
      .eq("id", topicId)
      .maybeSingle(),

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
      .order("created_at", { ascending: true }),

    supabase
      .from("category_groups")
      .select(`id, name, sort_order`)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("categories")
      .select(`id, group_id, name, sort_order`)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (topicResult.error) {
    console.error("Düzenlenecek konu alınamadı:", topicResult.error.message);
  }

  if (topicResult.error || !topicResult.data) {
    notFound();
  }

  if (profilesResult.error) {
    console.error("İçerik profilleri alınamadı:", profilesResult.error.message);
  }

  if (groupsResult.error) {
    console.error("Kategori grupları alınamadı:", groupsResult.error.message);
  }

  if (categoriesResult.error) {
    console.error("Kategoriler alınamadı:", categoriesResult.error.message);
  }

  const topic = topicResult.data as EditableTopic;
  const profiles = (profilesResult.data ?? []) as ContentProfile[];
  const categoryGroups = (groupsResult.data ?? []) as CategoryGroup[];
  const categories = (categoriesResult.data ?? []) as Category[];
  const isContentProfileTopic = Boolean(topic.content_profile_id);

  async function updateAdminTopic(formData: FormData) {
    "use server";

    await requireAdminAccess();
    const adminSupabase = createAdminClient();

    const currentTopicResult = await adminSupabase
      .from("topics")
      .select(`id, author_id, content_profile_id`)
      .eq("id", topicId)
      .maybeSingle();

    if (currentTopicResult.error || !currentTopicResult.data) {
      redirect(`/admin/konular/${topicId}?error=not_found`);
    }

    const currentTopic = currentTopicResult.data;
    const categoryIdText = getRequiredText(formData, "category_id");
    const title = getRequiredText(formData, "title");
    const content = getRequiredText(formData, "content");
    const categoryId = Number(categoryIdText);
    const contentProfileId = currentTopic.content_profile_id
      ? getRequiredText(formData, "content_profile_id")
      : "";

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      title.length < 10 ||
      title.length > 120 ||
      content.length < 40 ||
      (currentTopic.content_profile_id && !contentProfileId)
    ) {
      redirect(`/admin/konular/${topicId}?error=invalid`);
    }

    const categoryCheck = await adminSupabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("is_active", true)
      .maybeSingle();

    if (categoryCheck.error || !categoryCheck.data) {
      redirect(`/admin/konular/${topicId}?error=invalid`);
    }

    if (currentTopic.content_profile_id) {
      const profileCheck = await adminSupabase
        .from("content_profiles")
        .select("id")
        .eq("id", contentProfileId)
        .eq("is_active", true)
        .eq("is_archived", false)
        .maybeSingle();

      if (profileCheck.error || !profileCheck.data) {
        redirect(`/admin/konular/${topicId}?error=invalid`);
      }
    }

    const updatePayload: {
      category_id: number;
      title: string;
      content: string;
      content_profile_id?: string;
    } = {
      category_id: categoryId,
      title,
      content: textToSafeHtml(content),
    };

    if (currentTopic.content_profile_id) {
      updatePayload.content_profile_id = contentProfileId;
    }

    const { error } = await adminSupabase
      .from("topics")
      .update(updatePayload)
      .eq("id", topicId);

    if (error) {
      console.error("Admin konu düzenleme hatası:", error.message);
      redirect(`/admin/konular/${topicId}?error=update`);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/konular");
    revalidatePath(`/admin/konular/${topicId}`);
    revalidatePath(`/konu/${topicId}`);
    revalidatePath("/akis");
    revalidatePath("/kategoriler");

    redirect("/admin/konular");
  }

  const hasLoadError =
    Boolean(profilesResult.error) ||
    Boolean(groupsResult.error) ||
    Boolean(categoriesResult.error);

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>KONU YÖNETİMİ</span>
          <h1>Konuyu Düzenle</h1>
          <p>Başlığı, içeriği, kategoriyi ve uygun olduğunda içerik profilini güncelle.</p>
        </div>

        <Link href="/admin/konular" className={pageStyles.backButton}>
          Konulara dön
        </Link>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>DÜZENLEME</span>
            <h2>Konu Bilgileri</h2>
          </div>

          <div className={pageStyles.adminPublishBadge}>
            {isContentProfileTopic ? "İÇERİK PROFİLİ" : "KULLANICI KONUSU"}
          </div>
        </div>

        {queryParams.error === "invalid" ? (
          <div className={pageStyles.errorMessage}>
            Profil, kategori, başlık veya içerik bilgileri geçersiz.
          </div>
        ) : null}

        {queryParams.error === "update" ? (
          <div className={pageStyles.errorMessage}>
            Konu güncellenemedi. Sunucu kayıtlarını kontrol et.
          </div>
        ) : null}

        {queryParams.error === "not_found" ? (
          <div className={pageStyles.errorMessage}>
            Düzenlenecek konu bulunamadı.
          </div>
        ) : null}

        {hasLoadError ? (
          <div className={styles.emptyState}>Profil veya kategori bilgileri alınamadı.</div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>Aktif kategori bulunmuyor.</div>
        ) : (
          <form action={updateAdminTopic} className={pageStyles.form}>
            {isContentProfileTopic ? (
              <label className={pageStyles.field}>
                <span>İçerik Profili</span>
                <select
                  name="content_profile_id"
                  required
                  defaultValue={topic.content_profile_id ?? ""}
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.display_name} · @{profile.username} · {profileTypeNames[profile.profile_type]}
                    </option>
                  ))}
                </select>
                <small>Konunun herkese görünen yayıncı profilini seç.</small>
              </label>
            ) : (
              <div className={pageStyles.errorMessage}>
                Bu konu normal bir kullanıcı tarafından açılmıştır. Admin başlık, içerik ve kategoriyi düzenleyebilir; konu sahibini değiştiremez.
              </div>
            )}

            <label className={pageStyles.field}>
              <span>Kategori</span>
              <select name="category_id" required defaultValue={String(topic.category_id)}>
                {categoryGroups.map((group) => {
                  const groupCategories = categories.filter(
                    (category) => category.group_id === group.id
                  );

                  if (groupCategories.length === 0) {
                    return null;
                  }

                  return (
                    <optgroup key={group.id} label={group.name}>
                      {groupCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </label>

            <label className={pageStyles.field}>
              <span>Konu Başlığı</span>
              <input
                type="text"
                name="title"
                required
                minLength={10}
                maxLength={120}
                defaultValue={topic.title}
              />
            </label>

            <label className={pageStyles.field}>
              <span>Konu İçeriği</span>
              <textarea
                name="content"
                required
                minLength={40}
                rows={12}
                defaultValue={htmlToPlainText(topic.content)}
              />
              <small>
                Paragraflar arasındaki boşluklar korunarak güvenli HTML olarak yeniden kaydedilir.
              </small>
            </label>

            <div className={pageStyles.formFooter}>
              <p>Değişiklikler konu sayfasına ve akışa uygulanır.</p>
              <button type="submit">Değişiklikleri Kaydet</button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}