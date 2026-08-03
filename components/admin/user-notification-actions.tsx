"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type UserNotificationActionsProps = {
  userId: string;
  displayName: string;
};

export default function UserNotificationActions({
  userId,
  displayName,
}: UserNotificationActionsProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  function openModal() {
    setTitle("");
    setMessage("");
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedMessage = message.trim();

    if (normalizedTitle.length < 3) {
      setErrorMessage(
        "Başlık en az 3 karakter olmalı."
      );

      return;
    }

    if (!normalizedMessage) {
      setErrorMessage(
        "Bildirim mesajı zorunludur."
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "admin_send_user_notification",
        {
          p_user_id: userId,
          p_title: normalizedTitle,
          p_message: normalizedMessage,
        }
      );

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Bildirim kullanıcıya gönderildi."
      );

      setTitle("");
      setMessage("");

      router.refresh();
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Bildirim gönderilemedi.";

      const translatedMessage =
        rawMessage.includes("ADMIN_REQUIRED")
          ? "Bu işlemi yalnızca yönetici yapabilir."
          : rawMessage.includes("UNAUTHENTICATED")
            ? "Oturum doğrulanamadı."
            : rawMessage.includes("USER_NOT_FOUND")
              ? "Kullanıcı bulunamadı."
              : rawMessage.includes("TITLE_TOO_SHORT")
                ? "Başlık en az 3 karakter olmalı."
                : rawMessage.includes("TITLE_TOO_LONG")
                  ? "Başlık en fazla 100 karakter olabilir."
                  : rawMessage.includes("MESSAGE_REQUIRED")
                    ? "Bildirim mesajı zorunludur."
                    : rawMessage.includes("MESSAGE_TOO_LONG")
                      ? "Mesaj en fazla 1000 karakter olabilir."
                      : rawMessage;

      setErrorMessage(translatedMessage);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={
          styles.userNotificationButton
        }
        onClick={openModal}
      >
        <span
          className={
            styles.userNotificationButtonIcon
          }
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
            <path d="M10 21h4" />
          </svg>
        </span>

        Bildirim gönder
      </button>

      {isModalOpen ? (
        <div
          className={
            styles.userNotificationModalBackdrop
          }
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <section
            className={
              styles.userNotificationModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-notification-title"
          >
            <header
              className={
                styles.userNotificationModalHeader
              }
            >
              <div
                className={
                  styles.userNotificationModalIcon
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
                  <path d="M10 21h4" />
                </svg>
              </div>

              <div>
                <span>
                  TEK YÖNLÜ SİSTEM BİLDİRİMİ
                </span>

                <h3 id="user-notification-title">
                  Bildirim gönder
                </h3>
              </div>

              <button
                type="button"
                className={
                  styles.userNotificationModalClose
                }
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Pencereyi kapat"
              >
                ×
              </button>
            </header>

            <form
              className={
                styles.userNotificationForm
              }
              onSubmit={handleSubmit}
            >
              <p
                className={
                  styles.userNotificationIntro
                }
              >
                <strong>{displayName}</strong>
                {" kullanıcısı bu mesajı bildirimlerinde görecek. Mesaja cevap veremez."}
              </p>

              <label>
                <span>Bildirim başlığı</span>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Örn. ForumFenomen bilgilendirmesi"
                  maxLength={100}
                  disabled={isSaving}
                  required
                />

                <small>
                  {title.length}/100
                </small>
              </label>

              <label>
                <span>Bildirim mesajı</span>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Kullanıcıya iletilecek mesajı yaz."
                  maxLength={1000}
                  disabled={isSaving}
                  required
                />

                <small>
                  {message.length}/1000
                </small>
              </label>

              {errorMessage ? (
                <div
                  className={
                    styles.userNotificationError
                  }
                >
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div
                  className={
                    styles.userNotificationSuccess
                  }
                >
                  {successMessage}
                </div>
              ) : null}

              <div
                className={
                  styles.userNotificationModalButtons
                }
              >
                <button
                  type="button"
                  className={
                    styles.userNotificationCancelButton
                  }
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className={
                    styles.userNotificationSendButton
                  }
                  disabled={
                    isSaving ||
                    title.trim().length < 3 ||
                    !message.trim()
                  }
                >
                  {isSaving
                    ? "Gönderiliyor..."
                    : "Bildirimi gönder"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}