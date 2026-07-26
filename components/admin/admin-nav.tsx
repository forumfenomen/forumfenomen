"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type AdminNavItem = {
  href: string;
  label: string;
  showPendingReports?: boolean;
  showProfileReports?: boolean;
  showNewContacts?: boolean;
};

const activeItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Genel Bakış",
  },
  {
    href: "/admin/sikayetler",
    label: "Şikâyetler",
    showPendingReports: true,
  },
  {
    href: "/admin/kullanicilar",
    label: "Kullanıcılar",
    showProfileReports: true,
  },
  {
    href: "/admin/konular",
    label: "Konular",
  },
  {
    href: "/admin/yorumlar",
    label: "Yorumlar",
  },
  {
    href: "/admin/islem-kayitlari",
    label: "İşlem Kayıtları",
  },
  {
    href: "/admin/forum-etkinlikleri",
    label: "Forum Etkinlikleri",
  },
  {
    href: "/admin/iletisim",
    label: "İletişim",
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

export default function AdminNav() {
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
        profileReportsResult,
        contactCountsResult,
      ] = await Promise.all([
        supabase
          .from("comment_reports")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "pending"),

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

      if (commentReportsResult.error) {
        console.error(
          "Bekleyen yorum şikâyetleri alınamadı:",
          commentReportsResult.error.message
        );
      }

      if (profileReportsResult.error) {
        console.error(
          "Açık profil şikâyetleri alınamadı:",
          profileReportsResult.error.message
        );
      }

      if (contactCountsResult.error) {
        console.error(
          "Yeni iletişim mesajı sayısı alınamadı:",
          contactCountsResult.error.message
        );
      }

      const commentReportCount =
        commentReportsResult.error
          ? 0
          : commentReportsResult.count ?? 0;

      const profileReports =
        (profileReportsResult.data ??
          []) as ProfileReportSummary[];

      const openProfileReportCount =
        profileReports.filter(
          (report) =>
            report.status === "open" ||
            report.status === "reviewing"
        ).length;

      const contactCounts =
        contactCountsResult.data as
        | ContactCounts
        | null;

      setPendingReportCount(
        commentReportCount
      );

      setProfileReportCount(
        profileReportsResult.error
          ? 0
          : openProfileReportCount
      );

      setNewContactCount(
        contactCountsResult.error
          ? 0
          : normalizeCount(
            contactCounts?.new_count
          )
      );
    }

    void loadAdminNotifications();

    const channel = supabase
      .channel("admin-sidebar-notifications")
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
      )
      .subscribe((status) => {
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

    const refreshInterval = window.setInterval(
      () => {
        void loadAdminNotifications();
      },
      5000
    );

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

      window.clearInterval(refreshInterval);

      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <nav className={styles.nav}>
      {activeItems.map((item) => {
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
                aria-label={notificationLabel}
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