import { createClient } from "@/lib/supabase/server";

import UserAccountActions from "@/components/admin/user-account-actions";

import styles from "../admin.module.css";

type AdminUser = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_seen_at: string | null;
  topic_count: number | string;
  comment_count: number | string;

  profile_visibility: string;
  followers_visibility: string;
  following_visibility: string;
  comments_visibility: string;
  likes_visibility: string;

  email_notifications: boolean;
  push_notifications: boolean;

  account_status: string;
  suspended_until: string | null;
  moderation_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
};

const ONLINE_LIMIT_MS = 2 * 60 * 1000;

const roleNames: Record<string, string> = {
  admin: "Yönetici",
  moderator: "Moderatör",
  user: "Kullanıcı",
};

const accountStatusNames: Record<string, string> = {
  active: "Aktif",
  suspended: "Askıda",
  banned: "Yasaklı",
};

const visibilityNames: Record<string, string> = {
  public: "Herkese açık",
  followers: "Takipçiler",
  following: "Takip edilenler",
};

function getVisibilityName(value: string) {
  return visibilityNames[value] ?? value;
}

function getDisplayName(user: AdminUser) {
  return (
    user.display_name?.trim() ||
    user.username?.replace(/^@/, "").trim() ||
    "ForumFenomen Üyesi"
  );
}

function getInitials(user: AdminUser) {
  const name = getDisplayName(user);

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.slice(0, 1).toLocaleUpperCase("tr-TR")
    )
    .join("");
}

function getCount(value: number | string) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "admin_list_users"
  );

  if (error) {
    console.error(
      "Kullanıcılar alınamadı:",
      error.message
    );
  }

  const users =
    (data ?? []) as unknown as AdminUser[];

  const now = Date.now();

  const onlineUserCount = users.filter((user) => {
    if (!user.last_seen_at) {
      return false;
    }

    const lastSeenTime =
      new Date(user.last_seen_at).getTime();

    return (
      now - lastSeenTime >= 0 &&
      now - lastSeenTime <= ONLINE_LIMIT_MS
    );
  }).length;

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <span>ÜYE YÖNETİMİ</span>

          <h1>Kullanıcılar</h1>

          <p>
            Üyelerin çevrimiçi durumunu, rolünü,
            konu ve yorum sayılarını takip et.
          </p>
        </div>

        <div className={styles.onlineUsersBadge}>
          <span className={styles.onlineUsersDot} />

          {onlineUserCount} kullanıcı çevrimiçi
        </div>
      </header>

      <section className={styles.userSummaryGrid}>
        <article className={styles.userSummaryCard}>
          <span>Toplam kullanıcı</span>

          <strong>{users.length}</strong>
        </article>

        <article className={styles.userSummaryCard}>
          <span>Şu anda çevrimiçi</span>

          <strong>{onlineUserCount}</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>KULLANICI LİSTESİ</span>

            <h2>Tüm Üyeler</h2>
          </div>

          <div className={styles.panelBadge}>
            {users.length} kayıt
          </div>
        </div>

        {users.length === 0 ? (
          <div className={styles.emptyState}>
            Kullanıcı bulunamadı.
          </div>
        ) : (
          <div className={styles.userList}>
            {users.map((user) => {
              const displayName =
                getDisplayName(user);

              const lastSeenTime =
                user.last_seen_at
                  ? new Date(
                    user.last_seen_at
                  ).getTime()
                  : null;

              const isOnline =
                lastSeenTime !== null &&
                now - lastSeenTime >= 0 &&
                now - lastSeenTime <=
                ONLINE_LIMIT_MS;

              const roleClass =
                user.role === "admin"
                  ? styles.roleAdmin
                  : user.role === "moderator"
                    ? styles.roleModerator
                    : styles.roleUser;

              return (
                <article
                  key={user.id}
                  className={styles.userRow}
                >
                  <div
                    className={
                      styles.userIdentity
                    }
                  >
                    <div
                      className={
                        styles.userAvatarLarge
                      }
                      style={
                        user.avatar_url
                          ? {
                            backgroundImage: `url("${user.avatar_url}")`,
                          }
                          : undefined
                      }
                    >
                      {!user.avatar_url
                        ? getInitials(user)
                        : null}

                      <span
                        className={`${styles.presenceDot} ${isOnline
                          ? styles.presenceOnline
                          : styles.presenceOffline
                          }`}
                        aria-label={
                          isOnline
                            ? "Çevrimiçi"
                            : "Çevrimdışı"
                        }
                      />
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
                          {displayName}
                        </strong>

                        <span
                          className={`${styles.roleBadge} ${roleClass}`}
                        >
                          {roleNames[user.role] ??
                            user.role}
                        </span>

                        <span
                          className={`${styles.accountStatusBadge} ${user.account_status === "banned"
                            ? styles.accountStatusBanned
                            : user.account_status === "suspended"
                              ? styles.accountStatusSuspended
                              : styles.accountStatusActive
                            }`}
                        >
                          {accountStatusNames[user.account_status] ??
                            user.account_status}
                        </span>
                      </div>

                      <small>
                        {user.username
                          ? `@${user.username.replace(
                            /^@/,
                            ""
                          )}`
                          : "Kullanıcı adı yok"}
                      </small>

                      <p
                        className={
                          isOnline
                            ? styles.onlineText
                            : styles.lastSeenText
                        }
                      >
                        {isOnline
                          ? "● Şu anda çevrimiçi"
                          : user.last_seen_at
                            ? `Son görülme: ${formatDate(
                              user.last_seen_at
                            )}`
                            : "Henüz aktiflik bilgisi yok"}
                      </p>

                      {user.account_status === "suspended" ? (
                        <p className={styles.accountModerationInfo}>
                          Askı bitişi:{" "}
                          {user.suspended_until
                            ? formatDate(user.suspended_until)
                            : "Belirtilmedi"}
                        </p>
                      ) : null}

                      {user.account_status !== "active" &&
                        user.moderation_reason ? (
                        <p className={styles.accountModerationReason}>
                          Sebep: {user.moderation_reason}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className={styles.userPreferences}>
                    <div
                      className={
                        styles.userPreferencesHeader
                      }
                    >
                      <span>GİZLİLİK VE BİLDİRİMLER</span>
                    </div>

                    <div
                      className={
                        styles.userPreferencesGrid
                      }
                    >
                      <div
                        className={
                          styles.userPreferenceItem
                        }
                      >
                        <span>Profil</span>

                        <strong
                          className={
                            user.profile_visibility ===
                              "public"
                              ? styles.preferencePublic
                              : styles.preferenceLimited
                          }
                        >
                          {getVisibilityName(
                            user.profile_visibility
                          )}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.userPreferenceItem
                        }
                      >
                        <span>Takipçiler</span>

                        <strong
                          className={
                            user.followers_visibility ===
                              "public"
                              ? styles.preferencePublic
                              : styles.preferenceLimited
                          }
                        >
                          {getVisibilityName(
                            user.followers_visibility
                          )}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.userPreferenceItem
                        }
                      >
                        <span>Takip edilenler</span>

                        <strong
                          className={
                            user.following_visibility ===
                              "public"
                              ? styles.preferencePublic
                              : styles.preferenceLimited
                          }
                        >
                          {getVisibilityName(
                            user.following_visibility
                          )}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.userPreferenceItem
                        }
                      >
                        <span>Yorumlar</span>

                        <strong
                          className={
                            user.comments_visibility ===
                              "public"
                              ? styles.preferencePublic
                              : styles.preferenceLimited
                          }
                        >
                          {getVisibilityName(
                            user.comments_visibility
                          )}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.userPreferenceItem
                        }
                      >
                        <span>E-posta</span>

                        <strong
                          className={
                            user.email_notifications
                              ? styles.preferenceEnabled
                              : styles.preferenceDisabled
                          }
                        >
                          {user.email_notifications
                            ? "Açık"
                            : "Kapalı"}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.userPreferenceItem
                        }
                      >
                        <span>Anlık bildirim</span>

                        <strong
                          className={
                            user.push_notifications
                              ? styles.preferenceEnabled
                              : styles.preferenceDisabled
                          }
                        >
                          {user.push_notifications
                            ? "Açık"
                            : "Kapalı"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className={styles.userStats}>
                    <div
                      className={
                        styles.userStatBox
                      }
                    >
                      <strong>
                        {getCount(
                          user.topic_count
                        )}
                      </strong>

                      <span>Konu</span>
                    </div>

                    <div
                      className={
                        styles.userStatBox
                      }
                    >
                      <strong>
                        {getCount(
                          user.comment_count
                        )}
                      </strong>

                      <span>Yorum</span>
                    </div>

                    <div
                      className={
                        styles.userJoined
                      }
                    >
                      <span>Kayıt tarihi</span>

                      <strong>
                        {formatDate(
                          user.created_at
                        )}
                      </strong>
                    </div>
                  </div>

                  <UserAccountActions
                    userId={user.id}
                    displayName={displayName}
                    accountStatus={user.account_status}
                    isProtected={user.role === "admin"}
                  />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}