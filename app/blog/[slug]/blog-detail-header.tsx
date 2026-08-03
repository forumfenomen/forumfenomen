"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";

type Theme = "dark" | "light";

function MoonIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
    );
}

export default function BlogDetailHeader() {
    const [theme, setTheme] =
        useState<Theme>("dark");

    useEffect(() => {
        const stored =
            window.localStorage.getItem(
                "forumfenomen-theme"
            );

        const resolved: Theme =
            stored === "light"
                ? "light"
                : "dark";

        setTheme(resolved);

        document.documentElement.dataset.theme =
            resolved;
    }, []);

    function toggleTheme() {
        const nextTheme: Theme =
            theme === "dark"
                ? "light"
                : "dark";

        setTheme(nextTheme);

        document.documentElement.dataset.theme =
            nextTheme;

        window.localStorage.setItem(
            "forumfenomen-theme",
            nextTheme
        );
    }

    return (
        <header className="ff-feed-header ff-blog-detail-header">
            <Link
                href="/akis"
                className="ff-feed-logo-wrap"
                aria-label="ForumFenomen"
            >
                <Image
                    className="ff-feed-logo"
                    src="/forumfenomen-logo-transparent.png"
                    alt="ForumFenomen"
                    width={460}
                    height={140}
                    priority
                />
            </Link>

            <div className="ff-feed-header-actions">
                <button
                    type="button"
                    className="ff-round-action"
                    onClick={toggleTheme}
                    aria-label="Temayı değiştir"
                >
                    {theme === "dark" ? (
                        <MoonIcon />
                    ) : (
                        <SunIcon />
                    )}
                </button>

                <NotificationBell />

                <SiteSearch language="tr" />
            </div>
        </header>
    );
}