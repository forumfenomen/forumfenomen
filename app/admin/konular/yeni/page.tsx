import Link from "next/link";
import {
  redirect,
} from "next/navigation";
import {
  revalidatePath,
} from "next/cache";

import { requireAdminAccess } from "@/lib/admin/require-admin-access";

import styles from "../../admin.module.css";
import pageStyles from "./page.module.css";

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

const profileTypeNames: Record<
  ContentProfile["profile_type"],
  string
> = {
  community: "Topluluk",
  editor: "Editör",
  expert: "Uzman",
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
      const safeParagraph = escapeHtml(
        paragraph.trim()
      ).replaceAll("\n", "<br>");

      return safeParagraph
        ? `<p>${safeParagraph}</p>`
        : "";
    })
    .filter(Boolean)
    .join("");
}

export default async function NewAdminTopicPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const { supabase } =
    await requireAdminAccess();

  const [
    profilesResult,
    groupsResult,
    categoriesResult,
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

  if (profilesResult.error) {
    console.error(
      "İçerik profilleri alınamadı:",
      profilesResult.error.message
    );
  }

  if (groupsResult.error) {
    console.error(
      "Kategori grupları alınamadı:",
      groupsResult.error.message
    );
  }

  if (categoriesResult.error) {
    console.error(
      "Kategoriler alınamadı:",
      categoriesResult.error.message
    );
  }

  const profiles =
    (profilesResult.data ??
      []) as ContentProfile[];

  const categoryGroups =
    (groupsResult.data ??
      []) as CategoryGroup[];

  const categories =
    (categoriesResult.data ??
      []) as Category[];

  async function createAdminTopic(
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

    const categoryIdText =
      getRequiredText(
        formData,
        "category_id"
      );

    const title =
      getRequiredText(formData, "title");

    const content =
      getRequiredText(formData, "content");

    const categoryId =
      Number(categoryIdText);

    if (
      !contentProfileId ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      title.length < 10 ||
      title.length > 120 ||
      content.length < 40
    ) {
      redirect(
        "/admin/konular/yeni?error=invalid"
      );
    }

    const [
      profileCheck,
      categoryCheck,
    ] = await Promise.all([
      supabase
        .from("content_profiles")
        .select("id")
        .eq("id", contentProfileId)
        .eq("is_active", true)
        .eq("is_archived", false)
        .maybeSingle(),

      supabase
        .from("categories")
        .select("id")
        .eq("id", categoryId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

    if (
      profileCheck.error ||
      categoryCheck.error ||
      !profileCheck.data ||
      !categoryCheck.data
    ) {
      redirect(
        "/admin/konular/yeni?error=invalid"
      );
    }

    const safeContent =
      textToSafeHtml(content);

    const { error } = await supabase
      .from("topics")
      .insert({
        author_id: null,
        content_profile_id:
          contentProfileId,
        category_id: categoryId,
        title,
        content: safeContent,
        status: "published",
      });

    if (error) {
      console.error(
        "Admin konu oluşturma hatası:",
        error.message
      );

      redirect(
        "/admin/konular/yeni?error=insert"
      );
    }

    revalidatePath("/admin/konular");
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

          <h1>Yeni Konu Oluştur</h1>

          <p>
            İçerik profilini ve kategoriyi
            seçerek admin adına yeni bir konu
            yayınla.
          </p>
        </div>

        <Link
          href="/admin/konular"
          className={
            pageStyles.backButton
          }
        >
          Konulara dön
        </Link>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>YENİ YAYIN</span>

            <h2>Konu Bilgileri</h2>
          </div>

          <div className={styles.panelBadge}>
            ADMIN YAYINI
          </div>
        </div>

        {params.error === "invalid" ? (
          <div
            className={
              pageStyles.errorMessage
            }
          >
            Profil, kategori, başlık veya
            içerik bilgileri geçersiz.
          </div>
        ) : null}

        {params.error === "insert" ? (
          <div
            className={
              pageStyles.errorMessage
            }
          >
            Konu kaydedilemedi. Sunucu
            kayıtlarını kontrol et.
          </div>
        ) : null}

        {hasLoadError ? (
          <div className={styles.emptyState}>
            Profil veya kategori bilgileri
            alınamadı.
          </div>
        ) : profiles.length === 0 ? (
          <div className={styles.emptyState}>
            Konu yayınlayabilecek aktif içerik
            profili bulunmuyor.
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>
            Aktif kategori bulunmuyor.
          </div>
        ) : (
          <form
            action={createAdminTopic}
            className={pageStyles.form}
          >
            <label
              className={
                pageStyles.field
              }
            >
              <span>İçerik Profili</span>

              <select
                name="content_profile_id"
                required
                defaultValue=""
              >
                <option
                  value=""
                  disabled
                >
                  Profil seç
                </option>

                {profiles.map(
                  (profile) => (
                    <option
                      key={profile.id}
                      value={profile.id}
                    >
                      {profile.display_name}
                      {" · "}@
                      {profile.username}
                      {" · "}
                      {
                        profileTypeNames[
                          profile
                            .profile_type
                        ]
                      }
                    </option>
                  )
                )}
              </select>

              <small>
                Konunun herkese görünen
                yayıncı profilini seç.
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
                Ana kategori gruplarına göre
                listelenen alt kategorilerden
                birini seç.
              </small>
            </label>

            <label
              className={
                pageStyles.field
              }
            >
              <span>Konu Başlığı</span>

              <input
                type="text"
                name="title"
                required
                minLength={10}
                maxLength={120}
                placeholder="En az 10, en fazla 120 karakter"
              />
            </label>

            <label
              className={
                pageStyles.field
              }
            >
              <span>Konu İçeriği</span>

              <textarea
                name="content"
                required
                minLength={40}
                rows={12}
                placeholder="Konunun içeriğini en az 40 karakter olacak şekilde yaz..."
              />

              <small>
                Paragraflar arasındaki boşluklar
                korunarak güvenli HTML olarak
                kaydedilir.
              </small>
            </label>

            <div
              className={
                pageStyles.formFooter
              }
            >
              <p>
                Yayınlanan konu doğrudan akışta
                görünür.
              </p>

              <button type="submit">
                Konuyu Yayınla
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}