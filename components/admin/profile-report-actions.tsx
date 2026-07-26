"use client";

import {
    useState,
    type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type ReportStatus =
    | "open"
    | "reviewing"
    | "resolved"
    | "dismissed";

export type ProfileReport = {
    id: string;
    profile_id: string;
    reporter_id: string;

    reason: string;
    details: string | null;
    status: ReportStatus;

    created_at: string;
    updated_at: string;

    reviewed_by: string | null;
    reviewed_at: string | null;
    resolution_note: string | null;

    reporter_display_name: string | null;
    reporter_username: string | null;
};

type Props = {
    reports: ProfileReport[];
};

const statusLabels: Record<
    ReportStatus,
    string
> = {
    open: "Açık",
    reviewing: "İnceleniyor",
    resolved: "Çözüldü",
    dismissed: "Reddedildi",
};

const reasonLabels: Record<string, string> = {
    spam: "Spam veya yanıltıcı profil",
    harassment: "Taciz veya zorbalık",
    impersonation: "Başkasını taklit etme",
    illegal_content:
        "Yasa dışı veya zararlı içerik",
    other: "Diğer",
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat(
        "tr-TR",
        {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Istanbul",
        }
    ).format(new Date(value));
}

export default function ProfileReportActions({
    reports,
}: Props) {
    const router = useRouter();

    const [isOpen, setIsOpen] =
        useState(false);

    const openReports = reports.filter(
        (report) =>
            report.status === "open" ||
            report.status === "reviewing"
    );

    if (openReports.length === 0) {
        return null;
    }

    return (
        <div
            className={
                styles.profileReportAdminWrapper
            }
        >
            <button
                type="button"
                className={
                    styles.profileReportAdminButton
                }
                onClick={() => {
                    setIsOpen((current) => !current);
                }}
                aria-expanded={isOpen}
            >
                {openReports.length} Şikâyet
            </button>

            {isOpen ? (
                <div
                    className={
                        styles.profileReportAdminPanel
                    }
                >
                    <header>
                        <div>
                            <span>PROFİL ŞİKÂYETLERİ</span>

                            <h3>
                                Gönderilen şikâyetler
                            </h3>
                        </div>

                        <button
                            type="button"
                            aria-label="Şikâyet panelini kapat"
                            onClick={() => {
                                setIsOpen(false);
                            }}
                        >
                            ×
                        </button>
                    </header>

                    <div
                        className={
                            styles.profileReportAdminList
                        }
                    >
                        {openReports.map((report) => (
                            <ReportItem
                                key={report.id}
                                report={report}
                                onUpdated={() => {
                                    router.refresh();
                                }}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function ReportItem({
    report,
    onUpdated,
}: {
    report: ProfileReport;
    onUpdated: () => void;
}) {
    const [status, setStatus] =
        useState<ReportStatus>(
            report.status
        );

    const [note, setNote] =
        useState(
            report.resolution_note ?? ""
        );

    const [saving, setSaving] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (saving) {
            return;
        }

        setSaving(true);
        setErrorMessage(null);

        try {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "admin_update_profile_report",
                {
                    p_report_id: report.id,
                    p_status: status,
                    p_resolution_note:
                        note.trim() || null,
                }
            );

            if (error) {
                throw error;
            }

            window.dispatchEvent(
                new Event(
                    "admin-notifications-refresh"
                )
            );

            onUpdated();
        } catch (error) {
            console.error(
                "Profil şikâyeti güncellenemedi:",
                error
            );

            setErrorMessage(
                "Şikâyet işlemi kaydedilemedi."
            );
        } finally {
            setSaving(false);
        }
    }

    const reporterName =
        report.reporter_display_name?.trim() ||
        report.reporter_username
            ?.replace(/^@/, "")
            .trim() ||
        "ForumFenomen Üyesi";

    return (
        <form
            className={
                styles.profileReportAdminItem
            }
            onSubmit={handleSubmit}
        >
            <div
                className={
                    styles.profileReportAdminMeta
                }
            >
                <div>
                    <span>Şikâyet eden</span>

                    <strong>
                        {reporterName}
                    </strong>

                    {report.reporter_username ? (
                        <small>
                            @
                            {report.reporter_username.replace(
                                /^@/,
                                ""
                            )}
                        </small>
                    ) : null}
                </div>

                <time>
                    {formatDate(
                        report.created_at
                    )}
                </time>
            </div>

            <div
                className={
                    styles.profileReportAdminReason
                }
            >
                <span>Şikâyet nedeni</span>

                <strong>
                    {reasonLabels[report.reason] ??
                        report.reason}
                </strong>
            </div>

            <div
                className={
                    styles.profileReportAdminDetails
                }
            >
                {report.details?.trim() ||
                    "Açıklama eklenmemiş."}
            </div>

            <div
                className={
                    styles.profileReportAdminFields
                }
            >
                <label>
                    <span>Durum</span>

                    <select
                        value={status}
                        disabled={saving}
                        onChange={(event) => {
                            setStatus(
                                event.target
                                    .value as ReportStatus
                            );
                        }}
                    >
                        {(
                            Object.keys(
                                statusLabels
                            ) as ReportStatus[]
                        ).map((value) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {statusLabels[value]}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Yönetici notu</span>

                    <textarea
                        value={note}
                        maxLength={2000}
                        disabled={saving}
                        placeholder="İnceleme sonucunu yaz..."
                        onChange={(event) => {
                            setNote(
                                event.target.value
                            );
                        }}
                    />

                    <small>
                        {note.length}/2000
                    </small>
                </label>
            </div>

            {errorMessage ? (
                <div
                    className={
                        styles.profileReportAdminError
                    }
                >
                    {errorMessage}
                </div>
            ) : null}

            <div
                className={
                    styles.profileReportAdminSave
                }
            >
                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Kaydediliyor..."
                        : "Şikâyeti Güncelle"}
                </button>
            </div>
        </form>
    );
}