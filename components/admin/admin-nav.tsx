"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

const activeItems = [
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
];

export default function AdminNav() {
  const pathname = usePathname();

  const [supabase] = useState(() =>
    createClient()
  );

  const [
    pendingReportCount,
    setPendingReportCount,
  ] = useState(0);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  useEffect(() => {
    let isActiveEffect = true;

    async function loadPendingReports() {
      const { count, error } =
        await supabase
          .from("comment_reports")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "pending");

      if (
        error ||
        !isActiveEffect
      ) {
        if (error) {
          console.error(
            "Bekleyen şikâyet sayısı alınamadı:",
            error.message
          );
        }

        return;
      }

      setPendingReportCount(count ?? 0);
    }

    void loadPendingReports();

    const channel = supabase
      .channel("admin-pending-reports")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_reports",
        },
        () => {
          void loadPendingReports();
        }
      )
      .subscribe((status) => {
        console.log(
          "Admin şikâyet realtime durumu:",
          status
        );

        if (status === "SUBSCRIBED") {
          void loadPendingReports();
        }
      });

    const handleFocus = () => {
      void loadPendingReports();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      isActiveEffect = false;

      window.removeEventListener(
        "focus",
        handleFocus
      );

      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <nav className={styles.nav}>
      {activeItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ${isActive(item.href)
            ? styles.navActive
            : ""
            }`}
        >
          <span>{item.label}</span>

          {item.showPendingReports &&
            pendingReportCount > 0 ? (
            <span
              className={
                styles.adminNavNotification
              }
              aria-label={`${pendingReportCount} bekleyen şikâyet`}
            >
              {pendingReportCount > 99
                ? "99+"
                : pendingReportCount}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}