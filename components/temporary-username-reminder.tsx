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
                    "Geçici kullanıcı adı alınamadı:",
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
                "Kullanıcı adı hatırlatması ertelenemedi:",
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
                        src="/forumfenomen-icon-master.png"
                        alt=""
                        width={80}
                        height={80}
                        className="ff-username-reminder-logo"
                        unoptimized
                    />
                </div>

                <span className="ff-username-reminder-label">
                    FORUMFENOMEN’E HOŞ GELDİN
                </span>

                <h2 id="username-reminder-title">
                    Geçici kullanıcı adın hazır
                </h2>

                <div className="ff-temporary-username">
                    @{username}
                </div>

                <p>
                    Ayarlar bölümünden kullanıcı adını
                    değiştirebilir, profilini düzenleyebilir
                    ve gizlilik tercihlerini yönetebilirsin.
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
                    Kullanıcı adını değiştirmediğin sürece
                    bu hatırlatma 24 saat sonra tekrar
                    gösterilir.
                </small>
            </section>
        </div>
    );
}