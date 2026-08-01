import { requireAdminAccess } from "@/lib/admin/require-admin-access";

import styles from "../admin.module.css";

type ContentProfile = {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio: string;
  specialty: string;
  profile_type: "community" | "editor" | "expert";
  is_active: boolean;
  is_listed: boolean;
  is_archived: boolean;
  created_at: string;
};

const profileTypeNames: Record<
  ContentProfile["profile_type"],
  string
> = {
  community: "Topluluk",
  editor: "Editör",
  expert: "Uzman",
};

export default async function ContentProfilesPage() {
  const { supabase } = await requireAdminAccess();

  const { data, error } = await supabase
    .from("content_profiles")
    .select(`
      id,
      display_name,
      username,
      avatar_url,
      bio,
      specialty,
      profile_type,
      is_active,
      is_listed,
      is_archived,
      created_at
    `)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "İçerik profilleri alınamadı:",
      error.message
    );
  }

  const profiles =
    (data ?? []) as ContentProfile[];

  const activeCount = profiles.filter(
    (profile) =>
      profile.is_active &&
      !profile.is_archived
  ).length;

  const listedCount = profiles.filter(
    (profile) =>
      profile.is_listed &&
      !profile.is_archived
  ).length;

  const archivedCount = profiles.filter(
    (profile) => profile.is_archived
  ).length;

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>İÇERİK YÖNETİMİ</span>

          <h1>İçerik Profilleri</h1>

          <p>
            Admin tarafından yönetilen içerik
            profillerini görüntüle ve düzenle.
          </p>
        </div>

        <div className={styles.securityBadge}>
          ● Yalnızca admin erişimi
        </div>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>
            Toplam Profil
          </span>

          <strong>{profiles.length}</strong>

          <p>Kayıtlı içerik profili</p>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>
            Aktif Profil
          </span>

          <strong>{activeCount}</strong>

          <p>Yeni içerik yayınlayabilir</p>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>
            Listede Görünen
          </span>

          <strong>{listedCount}</strong>

          <p>Kullanıcı listesinde gösterilir</p>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>
            Arşivlenen
          </span>

          <strong>{archivedCount}</strong>

          <p>Yeni içerik yayınlayamaz</p>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>YÖNETİLEN PROFİLLER</span>

            <h2>Profil Listesi</h2>
          </div>

          <div className={styles.panelBadge}>
            {profiles.length} profil
          </div>
        </div>

        {error ? (
          <div className={styles.emptyState}>
            Profiller alınamadı: {error.message}
          </div>
        ) : profiles.length === 0 ? (
          <div className={styles.emptyState}>
            Henüz içerik profili bulunmuyor.
          </div>
        ) : (
          <div className={styles.userList}>
            {profiles.map((profile) => {
              const profileInitial =
                profile.display_name
                  .slice(0, 1)
                  .toLocaleUpperCase("tr-TR");

              const statusText =
                profile.is_archived
                  ? "Arşivde"
                  : profile.is_active
                    ? "Aktif"
                    : "Pasif";

              return (
                <article
                  key={profile.id}
                  className={styles.userRow}
                >
                  <div
                    className={styles.userIdentity}
                  >
                    <div
                      className={
                        styles.userAvatarLarge
                      }
                      style={
                        profile.avatar_url
                          ? {
                              backgroundImage: `url("${profile.avatar_url}")`,
                            }
                          : undefined
                      }
                    >
                      {!profile.avatar_url
                        ? profileInitial
                        : null}
                    </div>

                    <div
                      className={
                        styles.userIdentityText
                      }
                    >
                      <div
                        className={
                          styles.userNameLine
                        }
                      >
                        <strong>
                          {profile.display_name}
                        </strong>

                        <span
                          className={`${styles.roleBadge} ${
                            profile.profile_type ===
                            "expert"
                              ? styles.roleModerator
                              : profile.profile_type ===
                                  "editor"
                                ? styles.roleAdmin
                                : styles.roleUser
                          }`}
                        >
                          {
                            profileTypeNames[
                              profile.profile_type
                            ]
                          }
                        </span>
                      </div>

                      <small>
                        @{profile.username}
                      </small>

                      <p
                        className={
                          profile.is_active
                            ? styles.onlineText
                            : styles.lastSeenText
                        }
                      >
                        {statusText}
                      </p>
                    </div>
                  </div>

                  <div className={styles.userStats}>
                    <div
                      className={styles.userStatBox}
                    >
                      <strong>
                        {profile.is_active
                          ? "Evet"
                          : "Hayır"}
                      </strong>

                      <span>Aktif</span>
                    </div>

                    <div
                      className={styles.userStatBox}
                    >
                      <strong>
                        {profile.is_listed
                          ? "Evet"
                          : "Hayır"}
                      </strong>

                      <span>Listede</span>
                    </div>
                  </div>

                  <div className={styles.userJoined}>
                    <span>Uzmanlık</span>

                    <strong>
                      {profile.specialty}
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}