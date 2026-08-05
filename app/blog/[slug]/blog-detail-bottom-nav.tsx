"use client";

import Image from "next/image";
import Link from "next/link";
import {
    type MouseEvent,
    useEffect,
    useState,
} from "react";
import { createPortal } from "react-dom";

function HomeIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 11 9-8 9 8" />
            <path d="M5.5 10v10h13V10" />
            <path d="M9.5 20v-6h5v6" />
        </svg>
    );
}

function GridIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1.5"
            />
            <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1.5"
            />
            <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1.5"
            />
            <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1.5"
            />
        </svg>
    );
}

function BlogIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 3h8l4 4v14H6V3Z" />
            <path d="M14 3v5h5" />
            <path d="M9 12h6M9 16h6" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="7" r="4" />
            <path d="M4.5 21c.7-5 3.2-7 7.5-7s6.8 2 7.5 7" />
        </svg>
    );
}

export default function BlogDetailBottomNav() {
    const [mounted, setMounted] =
        useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    function handleNavigation(
        event: MouseEvent<HTMLAnchorElement>,
        href: string
    ) {
        if (
            window.location.pathname === href
        ) {
            event.preventDefault();

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
            });
        }
    }

    if (!mounted) {
        return null;
    }

    return createPortal(
        <nav
            className="ff-bottom-nav"
            aria-label="ForumFenomen"
        >
            <Link
                href="/akis"
                onClick={(event) =>
                    handleNavigation(
                        event,
                        "/akis"
                    )
                }
            >
                <HomeIcon />
                <span>Ana Sayfa</span>
            </Link>

            <Link
                href="/kategoriler"
                onClick={(event) =>
                    handleNavigation(
                        event,
                        "/kategoriler"
                    )
                }
            >
                <GridIcon />
                <span>Kategoriler</span>
            </Link>

            <Link
                href="/konu-ac"
                className="ff-center-nav-button"
                aria-label="Konu Oluştur"
            >
                <span className="ff-center-nav-glow" />

                <span className="ff-center-nav-image">
                    <Image
                        src="/forumfenomen-icon-master.png"
                        alt=""
                        fill
                        sizes="70px"
                        priority
                    />
                </span>
            </Link>

            <Link
                href="/blog"
                className="active"
                aria-current="page"
                onClick={(event) =>
                    handleNavigation(
                        event,
                        "/blog"
                    )
                }
            >
                <BlogIcon />
                <span>Blog</span>
            </Link>

            <Link
                href="/profil"
                onClick={(event) =>
                    handleNavigation(
                        event,
                        "/profil"
                    )
                }
            >
                <UserIcon />
                <span>Profil</span>
            </Link>
         </nav>,
    document.body
);
}