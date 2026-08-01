"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type AdminRole = "admin" | "moderator";

type AdminNavProps = {
  role: AdminRole;
};

type AdminNavItem = {
  href: string;
  label: string;
  roles: AdminRole[];
  showPendingReports?: boolean;
  showProfileReports?: boolean;
  showNewContacts?: boolean;
};

const activeItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Genel Bakış",
    roles: ["admin"],
  },
  {
    href: "/admin/sikayetler",
    label: "Şikâyetler",
    roles: ["admin", "moderator"],
    showPendingReports: true,
  },
  {
    href: "/admin/kullanicilar",
    label: "Kullanıcılar",
    roles: ["admin"],
    showProfileReports: true,
  },
  {
    href: "/admin/icerik-profilleri",
    label: "İçerik Profilleri",
    roles: ["admin"],
  },
  {
    href: "/admin/konular",
    label: "Konular",
    roles: ["admin", "moderator"],
  },
  {
    href: "/admin/yorumlar",
    label: "Yorumlar",
    roles: ["admin", "moderator"],
  },
  {
    href: "/admin/islem-kayitlari",
    label: "İşlem Kayıtları",
    roles: ["admin"],
  },
  {
    href: "/admin/forum-etkinlikleri",
    label: "Forum Etkinlikleri",
    roles: ["admin", "moderator"],
  },
  {
    href: "/admin/iletisim",
    label: "İletişim",
    roles: ["admin"],
    showNewContacts: true,
  },
];

type ContactCounts = {
  total_count: number | string;
  new_count: number | string;
  read_count: number | string;
  replied_count: number | string;
  closed_count: number | string;
};

type ProfileReportSummary = {
  id: string;
  status: string;
};

function normalizeCount(
  value: number | string | null | undefined
) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

export default function AdminNav({
  role,
}: AdminNavProps) {
  const pathname = usePathname();

  const [supabase] = useState(() =>
    createClient()
  );

  const [
    pendingReportCount,
    setPendingReportCount,
  ] = useState(0);

  const [
    profileReportCount,
    setProfileReportCount,
  ] = useState(0);

  const [
    newContactCount,
    setNewContactCount,
  ] = useState(0);

  const visibleItems = useMemo(
    () =>
      activeItems.filter((item) =>
        item.roles.includes(role)
      ),
    [role]
  );

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  useEffect(() => {
    let isActiveEffect = true;

    async function loadAdminNotifications() {
      const [
        commentReportsResult,
        topicReportsResult,
      ] = await Promise.all([
        supabase
          .from("comment_reports")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "pending"),

        supabase
          .from("topic_reports")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "open"),
      ]);

      if (!isActiveEffect) {
        return;
      }

      if (
        commentReportsResult.error ||
        topicReportsResult.error
      ) {
        if (commentReportsResult.error) {
          console.error(
            "Bekleyen yorum şikâyetleri alınamadı:",
            commentReportsResult.error.message
          );
        }

        if (topicReportsResult.error) {
          console.error(
            "Bekleyen konu şikâyetleri alınamadı:",
            topicReportsResult.error.message
          );
        }

        setPendingReportCount(0);
      } else {
        setPendingReportCount(
          (commentReportsResult.count ?? 0) +
          (topicReportsResult.count ?? 0)
        );
      }

      /*
       * Kullanıcı ve iletişim bölümleri yalnızca
       * admin rolüne açık olduğu için bu sorgular
       * moderatör hesabında çalıştırılmaz.
       */
      if (role !== "admin") {
        setProfileReportCount(0);
        setNewContactCount(0);
        return;
      }

      const [
        profileReportsResult,
        contactCountsResult,
      ] = await Promise.all([
        supabase.rpc(
          "admin_list_profile_reports",
          {
            p_profile_id: null,
            p_status: null,
          }
        ),

        supabase
          .rpc(
            "admin_contact_message_counts"
          )
          .single(),
      ]);

      if (!isActiveEffect) {
        return;
      }

      if (profileReportsResult.error) {
        console.error(
          "Açık profil şikâyetleri alınamadı:",
          profileReportsResult.error.message
        );

        setProfileReportCount(0);
      } else {
        const profileReports =
          (profileReportsResult.data ??
            []) as ProfileReportSummary[];

        const openProfileReportCount =
          profileReports.filter(
            (report) =>
              report.status === "open" ||
              report.status === "reviewing"
          ).length;

        setProfileReportCount(
          openProfileReportCount
        );
      }

      if (contactCountsResult.error) {
        console.error(
          "Yeni iletişim mesajı sayısı alınamadı:",
          contactCountsResult.error.message
        );

        setNewContactCount(0);
      } else {
        const contactCounts =
          contactCountsResult.data as
          | ContactCounts
          | null;

        setNewContactCount(
          normalizeCount(
            contactCounts?.new_count
          )
        );
      }
    }

    void loadAdminNotifications();

    let channel = supabase
      .channel(
        `admin-sidebar-notifications-${role}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_reports",
        },
        () => {
          void loadAdminNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "topic_reports",
        },
        () => {
          void loadAdminNotifications();
        }
      );

    if (role === "admin") {
      channel = channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profile_reports",
          },
          () => {
            void loadAdminNotifications();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "contact_messages",
          },
          () => {
            void loadAdminNotifications();
          }
        );
    }

    channel.subscribe((status) => {
      console.log(
        "Admin menü bildirim durumu:",
        status
      );

      if (status === "SUBSCRIBED") {
        void loadAdminNotifications();
      }
    });

    const handleRefreshNotifications = () => {
      void loadAdminNotifications();
    };

    window.addEventListener(
      "focus",
      handleRefreshNotifications
    );

    window.addEventListener(
      "admin-notifications-refresh",
      handleRefreshNotifications
    );

    const refreshInterval =
      window.setInterval(() => {
        void loadAdminNotifications();
      }, 5000);

    return () => {
      isActiveEffect = false;

      window.removeEventListener(
        "focus",
        handleRefreshNotifications
      );

      window.removeEventListener(
        "admin-notifications-refresh",
        handleRefreshNotifications
      );

      window.clearInterval(
        refreshInterval
      );

      void supabase.removeChannel(channel);
    };
  }, [role, supabase]);

  return (
    <nav className={styles.nav}>
      {visibleItems.map((item) => {
        const notificationCount =
          item.showPendingReports
            ? pendingReportCount
            : item.showProfileReports
              ? profileReportCount
              : item.showNewContacts
                ? newContactCount
                : 0;

        const notificationLabel =
          item.showPendingReports
            ? `${notificationCount} bekleyen içerik şikâyeti`
            : item.showProfileReports
              ? `${notificationCount} açık profil şikâyeti`
              : `${notificationCount} yeni iletişim mesajı`;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${isActive(item.href)
              ? styles.navActive
              : ""
              }`}
          >
            <span>{item.label}</span>

            {notificationCount > 0 ? (
              <span
                className={
                  styles.adminNavNotification
                }
                aria-label={
                  notificationLabel
                }
              >
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}