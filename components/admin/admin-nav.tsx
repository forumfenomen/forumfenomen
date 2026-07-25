"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/app/admin/admin.module.css";

const activeItems = [
  {
    href: "/admin",
    label: "Genel Bakış",
  },
  {
    href: "/admin/sikayetler",
    label: "Şikâyetler",
  },
  {
    href: "/admin/kullanicilar",
    label: "Kullanıcılar",
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.nav}>
      {activeItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ${
            isActive(item.href)
              ? styles.navActive
              : ""
          }`}
        >
          <span>{item.label}</span>
        </Link>
      ))}

      <span className={styles.navDisabled}>
        <span>Yorumlar</span>
        <small>YAKINDA</small>
      </span>

      <span className={styles.navDisabled}>
        <span>İşlem Kayıtları</span>
        <small>YAKINDA</small>
      </span>
    </nav>
  );
}