"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type TemporaryProfile = {
    username: string | null;
    username_is_temporary: boolean;
    username_reminder_dismissed_at: string | null;
};

const REMINDER_DELAY =
    24 * 60 * 60 * 1000;

export default function TemporaryUsernameReminder() {
    const router = useRouter();

    const [isOpen, setIsOpen] =
        useState(false);

    const [username, setUsername] =
        useState("");

    const [isSaving, setIsSaving] =
        useState(false);

    useEffect(() => {
        const supabase = createClient();

        let isActive = true;

        async function loadTemporaryUsername() {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (
                !isActive ||
                userError ||
                !user
            ) {
                return;
            }

            const { data, error } =
                await supabase
                    .from("profiles")
                    .select(`
            username,
            username_is_temporary,
            username_reminder_dismissed_at
          `)
                    .eq("id", user.id)
                    .single();

            if (!isActive) {
                return;
            }

            if (error) {
                console.error(
                    "GeÃ§ici kullanÄ±cÄ± adÄ± alÄ±namadÄ±:",
                    error.message
                );

                return;
            }

            const profile =
                data as TemporaryProfile;

            if (!profile.username_is_temporary) {
                return;
            }

            const dismissedAt =
                profile.username_reminder_dismissed_at
                    ? new Date(
                        profile.username_reminder_dismissed_at
                    ).getTime()
                    : null;

            const reminderIsDue =
                dismissedAt === null ||
                Date.now() - dismissedAt >=
                REMINDER_DELAY;

            if (!reminderIsDue) {
                return;
            }

            setUsername(
                profile.username
                    ?.replace(/^@/, "")
                    .trim() || "fenomen"
            );

            setIsOpen(true);
        }

        void loadTemporaryUsername();

        return () => {
            isActive = false;
        };
    }, []);

    const goToSettings = () => {
        setIsOpen(false);
        router.push("/profil");
    };

    const dismissReminder = async () => {
        if (isSaving) {
            return;
        }

        setIsSaving(true);

        const supabase = createClient();

        const { error } = await supabase.rpc(
            "dismiss_username_reminder"
        );

        if (error) {
            console.error(
                "KullanÄ±cÄ± adÄ± hatÄ±rlatmasÄ± ertelenemedi:",
                error.message
            );

            setIsSaving(false);
            return;
        }

        setIsOpen(false);
        setIsSaving(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="ff-username-reminder-backdrop"
            role="presentation"
        >
            <section
                className="ff-username-reminder"
                role="dialog"
                aria-modal="true"
                aria-labelledby="username-reminder-title"
            >
                <div
                    className="ff-username-reminder-icon"
                    aria-hidden="true"
                >
                    <Image
                        src="/forumfenomen-icon-256.png"
                        alt=""
                        width={80}
                        height={80}
                        className="ff-username-reminder-logo"
                        unoptimized
                    />
                </div>

                <span className="ff-username-reminder-label">
                    FORUMFENOMENâ€™E HOÅ GELDÄ°N
                </span>

                <h2 id="username-reminder-title">
                    GeÃ§ici kullanÄ±cÄ± adÄ±n hazÄ±r
                </h2>

                <div className="ff-temporary-username">
                    @{username}
                </div>

                <p>
                    Ayarlar bÃ¶lÃ¼mÃ¼nden kullanÄ±cÄ± adÄ±nÄ±
                    deÄŸiÅŸtirebilir, profilini dÃ¼zenleyebilir
                    ve gizlilik tercihlerini yÃ¶netebilirsin.
                </p>

                <div className="ff-username-reminder-actions">
                    <button
                        type="button"
                        className="ff-username-settings-button"
                        onClick={goToSettings}
                    >
                        Ayarlara Git
                    </button>

                    <button
                        type="button"
                        className="ff-username-later-button"
                        disabled={isSaving}
                        onClick={() => {
                            void dismissReminder();
                        }}
                    >
                        {isSaving
                            ? "Kaydediliyor..."
                            : "Daha Sonra"}
                    </button>
                </div>

                <small>
                    KullanÄ±cÄ± adÄ±nÄ± deÄŸiÅŸtirmediÄŸin sÃ¼rece
                    bu hatÄ±rlatma 24 saat sonra tekrar
                    gÃ¶sterilir.
                </small>
            </section>
        </div>
    );
}
