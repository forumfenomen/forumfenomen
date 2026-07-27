import ContactMessageActions from "@/components/admin/contact-message-actions";

import { requireAdminAccess } from "@/lib/admin/require-admin-access";

import Link from "next/link";

import styles from "../admin.module.css";

type ContactStatus =
    | "new"
    | "read"
    | "replied"
    | "closed";

type ContactFilter =
    | "all"
    | ContactStatus;

type ContactMessage = {
    id: string;
    user_id: string | null;
    full_name: string;
    email: string;
    subject: string;
    message: string;
    language: string;
    status: ContactStatus;
    admin_note: string | null;
    created_at: string;
    read_at: string | null;
    replied_at: string | null;
    closed_at: string | null;
    updated_at: string;
};

type ContactCounts = {
    total_count: number;
    new_count: number;
    read_count: number;
    replied_count: number;
    closed_count: number;
};

const subjectLabels: Record<
    string,
    string
> = {
    general: "Genel iletişim",
    advertising:
        "Reklam ve marka iş birliği",
    social: "Sosyal platformlar",
};

const statusLabels: Record<
    ContactStatus,
    string
> = {
    new: "Yeni",
    read: "Okundu",
    replied: "Yanıtlandı",
    closed: "Kapatıldı",
};

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "tr-TR",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(date);
}

export default async function AdminContactPage({
    searchParams,
}: {
    searchParams: Promise<{
        durum?: string;
    }>;
}) {
    const { supabase } =
        await requireAdminAccess();

    const resolvedSearchParams =
        await searchParams;

    const requestedFilter =
        resolvedSearchParams.durum;

    const activeFilter: ContactFilter =
        requestedFilter === "new" ||
            requestedFilter === "read" ||
            requestedFilter === "replied" ||
            requestedFilter === "closed"
            ? requestedFilter
            : "all";

    

    const [
        messagesResult,
        countsResult,
    ] = await Promise.all([
        supabase.rpc(
            "admin_list_contact_messages",
            {
                p_status:
                    activeFilter === "all"
                        ? null
                        : activeFilter,
                p_limit: 300,
            }
        ),

        supabase
            .rpc(
                "admin_contact_message_counts"
            )
            .single(),
    ]);

    if (messagesResult.error) {
        console.error(
            "İletişim mesajları alınamadı:",
            messagesResult.error.message
        );
    }

    if (countsResult.error) {
        console.error(
            "İletişim sayaçları alınamadı:",
            countsResult.error.message
        );
    }

    const messages =
        (messagesResult.data ??
            []) as ContactMessage[];

    const counts =
        (countsResult.data ??
        {
            total_count: 0,
            new_count: 0,
            read_count: 0,
            replied_count: 0,
            closed_count: 0,
        }) as ContactCounts;

    const filters: Array<{
        value: ContactFilter;
        label: string;
        count: number;
        href: string;
    }> = [
            {
                value: "all",
                label: "Tümü",
                count: Number(counts.total_count),
                href: "/admin/iletisim",
            },
            {
                value: "new",
                label: "Yeni",
                count: Number(counts.new_count),
                href: "/admin/iletisim?durum=new",
            },
            {
                value: "read",
                label: "Okundu",
                count: Number(counts.read_count),
                href: "/admin/iletisim?durum=read",
            },
            {
                value: "replied",
                label: "Yanıtlandı",
                count: Number(counts.replied_count),
                href: "/admin/iletisim?durum=replied",
            },
            {
                value: "closed",
                label: "Kapatıldı",
                count: Number(counts.closed_count),
                href: "/admin/iletisim?durum=closed",
            },
        ];

    return (
        <div
            className={
                styles.adminPageContent
            }
        >
            <header className={styles.pageHeader}>
                <div>
                    <span>DESTEK MERKEZİ</span>

                    <h1>İletişim Mesajları</h1>

                    <p>
                        İletişim formundan gönderilen mesajları incele,
                        yanıtla ve durumlarını yönet.
                    </p>
                </div>
            </header>

            <section
                className={
                    styles.contactStatsGrid
                }
            >
                <article>
                    <span>Toplam</span>
                    <strong>
                        {counts.total_count}
                    </strong>
                </article>

                <article>
                    <span>Yeni</span>
                    <strong>
                        {counts.new_count}
                    </strong>
                </article>

                <article>
                    <span>Okundu</span>
                    <strong>
                        {counts.read_count}
                    </strong>
                </article>

                <article>
                    <span>Yanıtlandı</span>
                    <strong>
                        {counts.replied_count}
                    </strong>
                </article>

                <article>
                    <span>Kapatıldı</span>
                    <strong>
                        {counts.closed_count}
                    </strong>
                </article>
            </section>

            <nav
                className={styles.contactFilterBar}
                aria-label="İletişim mesajı filtreleri"
            >
                {filters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={filter.href}
                        className={[
                            styles.contactFilterButton,
                            activeFilter === filter.value
                                ? styles.contactFilterButtonActive
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        <span>{filter.label}</span>

                        <strong>{filter.count}</strong>
                    </Link>
                ))}
            </nav>

            {messages.length === 0 ? (
                <section
                    className={
                        styles.contactEmptyState
                    }
                >
                    <h2>
                        {activeFilter === "all"
                            ? "Henüz mesaj yok"
                            : "Bu durumda mesaj yok"}
                    </h2>

                    <p>
                        {activeFilter === "all"
                            ? "İletişim formundan gönderilen mesajlar burada görünecek."
                            : `${statusLabels[activeFilter]} durumunda iletişim mesajı bulunmuyor.`}
                    </p>
                </section>
            ) : (
                <section
                    className={
                        styles.contactMessageList
                    }
                >
                    {messages.map((message) => {
                        const subjectLabel =
                            subjectLabels[
                            message.subject
                            ] ?? message.subject;

                        return (
                            <article
                                key={message.id}
                                className={[
                                    styles.contactMessageCard,
                                    message.status === "new"
                                        ? styles.contactMessageNew
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                            >
                                <header
                                    className={
                                        styles.contactMessageHeader
                                    }
                                >
                                    <div>
                                        <div
                                            className={
                                                styles.contactMessageIdentity
                                            }
                                        >
                                            <strong>
                                                {message.full_name}
                                            </strong>

                                            <span
                                                className={
                                                    styles[
                                                    `contactStatus_${message.status}`
                                                    ]
                                                }
                                            >
                                                {
                                                    statusLabels[
                                                    message.status
                                                    ]
                                                }
                                            </span>
                                        </div>

                                        <a
                                            href={`mailto:${message.email}`}
                                        >
                                            {message.email}
                                        </a>
                                    </div>

                                    <time>
                                        {formatDate(
                                            message.created_at
                                        )}
                                    </time>
                                </header>

                                <div
                                    className={
                                        styles.contactMessageSubject
                                    }
                                >
                                    <span>İletişim konusu</span>

                                    <strong>
                                        {subjectLabel}
                                    </strong>
                                </div>

                                <div className={styles.contactMessageContentGrid}>
                                    <div
                                        className={
                                            styles.contactMessageBody
                                        }
                                    >
                                        {message.message}
                                    </div>

                                    <ContactMessageActions
                                        messageId={message.id}
                                        currentStatus={message.status}
                                        currentNote={message.admin_note}
                                        email={message.email}
                                        fullName={message.full_name}
                                        subjectLabel={subjectLabel}
                                    />
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </div>
    );
}