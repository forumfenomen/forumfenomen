import { requireAdminAccess } from "@/lib/admin/require-admin-access";
import Link from "next/link";
import UserAccountActions from "@/components/admin/user-account-actions";
import UserRoleActions from "@/components/admin/user-role-actions";
import UserPlusAccessActions from "@/components/admin/user-plus-access-actions";

import ProfileReportActions, {
  type ProfileReport,
} from "@/components/admin/profile-report-actions";

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
  profile_report_count: number | string;
  open_profile_report_count: number | string;

  profile_visibility: string;
  followers_visibility: string;
  following_visibility: string;
  comments_visibility: string;
  likes_visibility: string;

  email_notifications: boolean;
  push_notifications: boolean;


  plus_access: boolean;
  plus_access_granted_at: string | null;
  plus_access_granted_by: string | null;
  account_status: string;
  suspended_until: string | null;
  moderation_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
};

type UserFilter =
  | "all"
  | "online"
  | "reported"
  | "suspended";

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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    filtre?: string;
    search?: string;
  }>;
}) {
  const { supabase } =
    await requireAdminAccess();

  const resolvedSearchParams =
    await searchParams;

  const requestedFilter =
    resolvedSearchParams.filtre;

  const searchText =
    resolvedSearchParams.search?.trim() ?? "";

  const normalizedSearch =
    searchText.toLocaleLowerCase("tr-TR");

  const activeFilter: UserFilter =
    requestedFilter === "online" ||
      requestedFilter === "reported" ||
      requestedFilter === "suspended"
      ? requestedFilter
      : "all";

  
  const [
    usersResult,
    reportsResult,
  ] = await Promise.all([
    supabase.rpc(
      "admin_list_users"
    ),

    supabase.rpc(
      "admin_list_profile_reports",
      {
        p_profile_id: null,
        p_status: null,
      }
    ),
  ]);

  if (usersResult.error) {
    console.error(
      "Kullanıcılar alınamadı:",
      usersResult.error.message
    );
  }

  if (reportsResult.error) {
    console.error(
      "Profil şikâyetleri alınamadı:",
      reportsResult.error.message
    );
  }

  const users =
    (usersResult.data ??
      []) as unknown as AdminUser[];

  const profileReports =
    (reportsResult.data ??
      []) as unknown as ProfileReport[];

  const reportsByProfileId =
    profileReports.reduce<
      Record<string, ProfileReport[]>
    >((accumulator, report) => {
      const currentReports =
        accumulator[report.profile_id] ?? [];

      currentReports.push(report);

      accumulator[report.profile_id] =
        currentReports;

      return accumulator;
    }, {});

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

  const reportedUserCount = users.filter(
    (user) =>
      getCount(user.open_profile_report_count) > 0
  ).length;

  const suspendedUserCount = users.filter(
    (user) =>
      user.account_status === "suspended"
  ).length;

  const filteredUsers = users.filter((user) => {
    const matchesFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "reported"
          ? getCount(
            user.open_profile_report_count
          ) > 0
          : activeFilter === "suspended"
            ? user.account_status === "suspended"
            : (() => {
              if (!user.last_seen_at) {
                return false;
              }

              const lastSeenTime =
                new Date(
                  user.last_seen_at
                ).getTime();

              return (
                now - lastSeenTime >= 0 &&
                now - lastSeenTime <=
                ONLINE_LIMIT_MS
              );
            })();

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableText = [
      user.display_name ?? "",
      user.username ?? "",
      roleNames[user.role] ?? user.role,
      accountStatusNames[
        user.account_status
      ] ?? user.account_status,
    ]
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return searchableText.includes(
      normalizedSearch
    );
  });

  const userFilters = [
    {
      value: "all",
      label: "Toplam kullanıcı",
      count: users.length,
      href: "/admin/kullanicilar",
    },
    {
      value: "online",
      label: "Şu anda çevrimiçi",
      count: onlineUserCount,
      href: "/admin/kullanicilar?filtre=online",
    },
    {
      value: "reported",
      label: "Şikâyet edilen",
      count: reportedUserCount,
      href: "/admin/kullanicilar?filtre=reported",
    },
    {
      value: "suspended",
      label: "Askıya alınan",
      count: suspendedUserCount,
      href: "/admin/kullanicilar?filtre=suspended",
    },
  ] as const;

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

      <nav
        className={styles.topicSummaryGrid}
        aria-label="Kullanıcı filtreleri"
      >
        {userFilters.map((filter) => {
          const query =
            new URLSearchParams();

          if (filter.value !== "all") {
            query.set(
              "filtre",
              filter.value
            );
          }

          if (searchText) {
            query.set(
              "search",
              searchText
            );
          }

          const queryString =
            query.toString();

          const href = queryString
            ? `/admin/kullanicilar?${queryString}`
            : "/admin/kullanicilar";

          return (
            <Link
              key={filter.value}
              href={href}
              className={`${styles.topicSummaryCard} ${
                activeFilter === filter.value
                  ? styles.topicSummaryActive
                  : ""
              }`}
            >
              <span>{filter.label}</span>

              <strong>{filter.count}</strong>
            </Link>
          );
        })}
      </nav>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>
              {activeFilter === "reported"
                ? "ŞİKÂYET YÖNETİMİ"
                : activeFilter === "suspended"
                  ? "HESAP DENETİMİ"
                  : activeFilter === "online"
                    ? "AKTİF KULLANICILAR"
                    : "KULLANICI LİSTESİ"}
            </span>

            <h2>
              {activeFilter === "online"
                ? "Çevrimiçi Üyeler"
                : activeFilter === "reported"
                  ? "Şikâyet Edilen Üyeler"
                  : activeFilter === "suspended"
                    ? "Askıya Alınan Üyeler"
                    : "Tüm Üyeler"}
            </h2>
          </div>

          <div className={styles.topicCountBadge}>
            {filteredUsers.length} kullanıcı
          </div>
        </div>

        <form
          method="get"
          className={styles.topicAdminSearch}
        >
          {activeFilter !== "all" ? (
            <input
              type="hidden"
              name="filtre"
              value={activeFilter}
            />
          ) : null}

          <div
            className={
              styles.topicAdminSearchField
            }
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="search"
              name="search"
              defaultValue={searchText}
              placeholder="İsim, kullanıcı adı, rol veya hesap durumu ara..."
            />
          </div>

          {searchText ? (
            <Link
              href={
                activeFilter === "all"
                  ? "/admin/kullanicilar"
                  : `/admin/kullanicilar?filtre=${activeFilter}`
              }
              className={
                styles.topicAdminSearchClear
              }
            >
              Temizle
            </Link>
          ) : null}

          <button
            type="submit"
            className={
              styles.topicSearchButton
            }
          >
            Ara
          </button>
        </form>

        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            Kullanıcı bulunamadı.
          </div>
        ) : (
          <div className={styles.userList}>
            {filteredUsers.map((user) => {
              const displayName =
                getDisplayName(user);

              const profileHref = user.username
                ? `/profil/${encodeURIComponent(
                  user.username.replace(/^@/, "")
                )}`
                : null;

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

              const openReportCount =
                getCount(
                  user.open_profile_report_count
                );

              const totalReportCount =
                getCount(
                  user.profile_report_count
                );

              const userProfileReports =
                reportsByProfileId[user.id] ?? [];

              const roleClass =
                user.role === "admin"
                  ? styles.roleAdmin
                  : user.role === "moderator"
                    ? styles.roleModerator
                    : styles.roleUser;

              return (
                <article
                  key={user.id}
                  className={[
                    styles.userRow,
                    openReportCount > 0
                      ? styles.userRowReported
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
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
                        {profileHref ? (
                          <Link
                            href={profileHref}
                            className={styles.adminUserProfileLink}
                          >
                            {displayName}
                          </Link>
                        ) : (
                          <strong>{displayName}</strong>
                        )}

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

                      {totalReportCount > 0 ? (
                        <p className={styles.userReportHistory}>
                          Toplam şikâyet geçmişi: {totalReportCount}
                        </p>
                      ) : null}

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

                  <div className={styles.userManagementBar}>
                    <div className={styles.userManagementLeft}>
                      <UserPlusAccessActions
                        userId={user.id}
                        displayName={displayName}
                        hasPlusAccess={user.plus_access}
                      />

                      <UserRoleActions
                        userId={user.id}
                        displayName={displayName}
                        currentRole={user.role}
                        isProtected={user.role === "admin"}
                      />

                      <ProfileReportActions
                        reports={userProfileReports}
                      />
                    </div>

                    <UserAccountActions
                      userId={user.id}
                      displayName={displayName}
                      accountStatus={user.account_status}
                      isProtected={user.role === "admin"}
                    />
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