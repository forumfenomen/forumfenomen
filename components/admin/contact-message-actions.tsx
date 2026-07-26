"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type ContactStatus =
  | "new"
  | "read"
  | "replied"
  | "closed";

type Props = {
  messageId: string;
  currentStatus: ContactStatus;
  currentNote: string | null;
  email: string;
  fullName: string;
  subjectLabel: string;
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

export default function ContactMessageActions({
  messageId,
  currentStatus,
  currentNote,
  email,
  fullName,
  subjectLabel,
}: Props) {
  const router = useRouter();

  const [status, setStatus] =
    useState<ContactStatus>(currentStatus);

  const [note, setNote] =
    useState(currentNote ?? "");

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [savedMessage, setSavedMessage] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSavedMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "admin_update_contact_message",
        {
          p_message_id: messageId,
          p_status: status,
          p_admin_note:
            note.trim() || null,
        }
      );

      if (error) {
        throw error;
      }

      setSavedMessage(
  "Mesaj durumu güncellendi."
);

window.dispatchEvent(
  new Event(
    "admin-notifications-refresh"
  )
);

router.refresh();

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Mesaj güncellenemedi.";

      const translatedMessage =
        message.includes("ADMIN_REQUIRED")
          ? "Bu işlemi yalnızca yönetici yapabilir."
          : message.includes(
            "INVALID_STATUS"
          )
            ? "Geçersiz mesaj durumu."
            : message.includes(
              "MESSAGE_NOT_FOUND"
            )
              ? "Mesaj bulunamadı."
              : message;

      setErrorMessage(translatedMessage);
    } finally {
      setIsSaving(false);
    }
  }

  const mailSubject =
    `ForumFenomen: ${subjectLabel}`;

  const mailBody =
    `Merhaba ${fullName},\n\n` +
    `ForumFenomen üzerinden gönderdiğiniz mesajla ilgili olarak:\n\n`;

  const mailHref =
    `mailto:${encodeURIComponent(email)}` +
    `?subject=${encodeURIComponent(mailSubject)}` +
    `&body=${encodeURIComponent(mailBody)}`;

  return (
    <form
      className={styles.contactMessageActions}
      onSubmit={handleSubmit}
    >
      <div className={styles.contactMessageToolbar}>
        <label className={styles.contactStatusField}>
          <span>Mesaj durumu</span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as ContactStatus
              )
            }
            disabled={isSaving}
          >
            {(
              Object.keys(
                statusLabels
              ) as ContactStatus[]
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

        <div className={styles.contactMessageButtons}>
          <a
            href={mailHref}
            className={styles.contactReplyButton}
          >
            E-posta ile yanıtla
          </a>

          <button
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Kaydediliyor..."
              : "Durumu kaydet"}
          </button>
        </div>
      </div>

      <label className={styles.contactAdminNoteField}>
        <span>Yönetici notu</span>

        <textarea
          value={note}
          maxLength={1000}
          placeholder="Mesajla ilgili yalnızca yöneticilerin göreceği bir not yaz..."
          onChange={(event) =>
            setNote(event.target.value)
          }
          disabled={isSaving}
        />

        <small>
          {note.length}/1000
        </small>
      </label>

      {errorMessage ? (
        <div className={styles.contactMessageError}>
          {errorMessage}
        </div>
      ) : null}

      {savedMessage ? (
        <div className={styles.contactMessageSuccess}>
          {savedMessage}
        </div>
      ) : null}
    </form>
  );
}