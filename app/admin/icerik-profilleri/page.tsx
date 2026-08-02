import Link from "next/link";

import {
    requireAdminAccess,
} from "@/lib/admin/require-admin-access";

import styles from "../admin.module.css";

import profileStyles from "./page.module.css";

type ContentProfile = {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
    bio: string;
    specialty: string;
    profile_type:
        | "community"
        | "editor"
        | "expert";
    is_active: boolean;
    is_listed: boolean;
    is_archived: boolean;
    created_at: string;
};

type ContentProfilesPageProps = {
    searchParams: Promise<{
        filter?: string;
        search?: string;
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

export default async function ContentProfilesPage({
    searchParams,
}: ContentProfilesPageProps) {
    const params = await searchParams;

    const selectedFilter =
        params.filter === "active" ||
        params.filter === "listed" ||
        params.filter === "archived"
            ? params.filter
            : "all";

    const searchText =
        params.search?.trim() ?? "";

    const normalizedSearch =
        searchText.toLocaleLowerCase("tr-TR");

    const { supabase } =
        await requireAdminAccess();

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

    const filteredProfiles = profiles.filter(
        (profile) => {
            const matchesFilter =
                selectedFilter === "active"
                    ? profile.is_active &&
                      !profile.is_archived
                    : selectedFilter === "listed"
                        ? profile.is_listed &&
                          !profile.is_archived
                        : selectedFilter === "archived"
                            ? profile.is_archived
                            : true;

            if (!matchesFilter) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchableText = [
                profile.display_name,
                profile.username,
                profile.specialty,
                profileTypeNames[
                    profile.profile_type
                ],
            ]
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            return searchableText.includes(
                normalizedSearch
            );
        }
    );

    function getFilterHref(
        filter:
            | "all"
            | "active"
            | "listed"
            | "archived"
    ) {
        const query =
            new URLSearchParams();

        if (filter !== "all") {
            query.set("filter", filter);
        }

        if (searchText) {
            query.set("search", searchText);
        }

        const queryString =
            query.toString();

        return queryString
            ? `/admin/icerik-profilleri?${queryString}`
            : "/admin/icerik-profilleri";
    }

    return (
        <>
            <header
                className={styles.pageHeader}
            >
                <div>
                    <span>
                        İÇERİK YÖNETİMİ
                    </span>

                    <h1>
                        İçerik Profilleri
                    </h1>

                    <p>
                        Admin tarafından yönetilen
                        içerik profillerini görüntüle
                        ve düzenle.
                    </p>
                </div>

                <div
                    className={
                        styles.securityBadge
                    }
                >
                    ● Yalnızca admin erişimi
                </div>
            </header>

            <section
                className={
                    styles.topicSummaryGrid
                }
            >
                <Link
                    href={getFilterHref("all")}
                    className={`${styles.topicSummaryCard} ${
                        selectedFilter === "all"
                            ? styles.topicSummaryActive
                            : ""
                    }`}
                >
                    <span>
                        Toplam Profil
                    </span>

                    <strong>
                        {profiles.length}
                    </strong>
                </Link>

                <Link
                    href={getFilterHref("active")}
                    className={`${styles.topicSummaryCard} ${
                        selectedFilter === "active"
                            ? styles.topicSummaryActive
                            : ""
                    }`}
                >
                    <span>
                        Aktif Profil
                    </span>

                    <strong>
                        {activeCount}
                    </strong>
                </Link>

                <Link
                    href={getFilterHref("listed")}
                    className={`${styles.topicSummaryCard} ${
                        selectedFilter === "listed"
                            ? styles.topicSummaryActive
                            : ""
                    }`}
                >
                    <span>
                        Listede Görünen
                    </span>

                    <strong>
                        {listedCount}
                    </strong>
                </Link>

                <Link
                    href={getFilterHref("archived")}
                    className={`${styles.topicSummaryCard} ${
                        selectedFilter === "archived"
                            ? styles.topicSummaryActive
                            : ""
                    }`}
                >
                    <span>
                        Arşivlenen
                    </span>

                    <strong>
                        {archivedCount}
                    </strong>
                </Link>
            </section>

            <section
                className={styles.panel}
            >
                <div
                    className={
                        styles.panelHeader
                    }
                >
                    <div>
                        <span>
                            YÖNETİLEN PROFİLLER
                        </span>

                        <h2>
                            {selectedFilter === "active"
                                ? "Aktif Profiller"
                                : selectedFilter === "listed"
                                    ? "Listede Görünen Profiller"
                                    : selectedFilter === "archived"
                                        ? "Arşivlenen Profiller"
                                        : "Profil Listesi"}
                        </h2>
                    </div>

                    <div
                        className={
                            styles.topicCountBadge
                        }
                    >
                        {filteredProfiles.length} profil
                    </div>
                </div>

                <form
                    method="get"
                    className={
                        styles.topicAdminSearch
                    }
                >
                    {selectedFilter !== "all" ? (
                        <input
                            type="hidden"
                            name="filter"
                            value={selectedFilter}
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
                            defaultValue={
                                searchText
                            }
                            placeholder="Profil adı, kullanıcı adı veya uzmanlık ara..."
                        />
                    </div>

                    {searchText ? (
                        <Link
                            href={
                                selectedFilter === "all"
                                    ? "/admin/icerik-profilleri"
                                    : `/admin/icerik-profilleri?filter=${selectedFilter}`
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

                {error ? (
                    <div
                        className={
                            styles.emptyState
                        }
                    >
                        Profiller alınamadı:{" "}
                        {error.message}
                    </div>
                ) : filteredProfiles.length === 0 ? (
                    <div
                        className={
                            styles.emptyState
                        }
                    >
                        Filtrelere uygun içerik
                        profili bulunamadı.
                    </div>
                ) : (
                    <div
                        className={
                            profileStyles.profileList
                        }
                    >
                        {filteredProfiles.map(
                            (profile) => {
                                const profileInitial =
                                    profile.display_name
                                        .slice(0, 1)
                                        .toLocaleUpperCase(
                                            "tr-TR"
                                        );

                                const statusText =
                                    profile.is_archived
                                        ? "Arşivde"
                                        : profile.is_active
                                            ? "Aktif"
                                            : "Pasif";

                                return (
                                    <article
                                        key={
                                            profile.id
                                        }
                                        className={
                                            profileStyles.profileRow
                                        }
                                    >
                                        <div
                                            className={
                                                profileStyles.identity
                                            }
                                        >
                                            <div
                                                className={
                                                    profileStyles.avatar
                                                }
                                                style={
                                                    profile.avatar_url
                                                        ? {
                                                            backgroundImage:
                                                                `url("${profile.avatar_url}")`,
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
                                                    profileStyles.identityText
                                                }
                                            >
                                                <div
                                                    className={
                                                        profileStyles.nameLine
                                                    }
                                                >
                                                    <strong>
                                                        {
                                                            profile.display_name
                                                        }
                                                    </strong>

                                                    <span
                                                        className={
                                                            profileStyles.typeBadge
                                                        }
                                                    >
                                                        {
                                                            profileTypeNames[
                                                                profile
                                                                    .profile_type
                                                            ]
                                                        }
                                                    </span>
                                                </div>

                                                <span
                                                    className={
                                                        profileStyles.username
                                                    }
                                                >
                                                    @
                                                    {
                                                        profile.username
                                                    }
                                                </span>

                                                <span
                                                    className={`${profileStyles.status} ${
                                                        !profile.is_active ||
                                                        profile.is_archived
                                                            ? profileStyles.statusPassive
                                                            : ""
                                                    }`}
                                                >
                                                    {
                                                        statusText
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={
                                                profileStyles.flags
                                            }
                                        >
                                            <div
                                                className={
                                                    profileStyles.flag
                                                }
                                            >
                                                <strong>
                                                    {profile.is_active
                                                        ? "Evet"
                                                        : "Hayır"}
                                                </strong>

                                                <span>
                                                    Aktif
                                                </span>
                                            </div>

                                            <div
                                                className={
                                                    profileStyles.flag
                                                }
                                            >
                                                <strong>
                                                    {profile.is_listed
                                                        ? "Evet"
                                                        : "Hayır"}
                                                </strong>

                                                <span>
                                                    Listede
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={
                                                profileStyles.specialty
                                            }
                                        >
                                            <span>
                                                Uzmanlık
                                            </span>

                                            <strong>
                                                {
                                                    profile.specialty
                                                }
                                            </strong>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </>
    );
}