"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type TopicStatus =
  | "published"
  | "hidden"
  | "banned";

type TopicModerationActionsProps = {
  topicId: string;
  topicTitle: string;
  currentStatus: TopicStatus;
};

const actionTitles: Record<TopicStatus, string> = {
  published: "Konuyu yeniden yayınla",
  hidden: "Konuyu gizle",
  banned: "Konuyu yasakla",
};

const actionDescriptions: Record<
  TopicStatus,
  string
> = {
  published:
    "Konu tekrar forumda görünür ve erişilebilir hale getirilecek.",
  hidden:
    "Konu normal kullanıcılardan gizlenecek, ancak yönetim kayıtlarında korunacak.",
  banned:
    "Konu ağır ihlal nedeniyle yasaklanacak ve normal kullanıcılara gösterilmeyecek.",
};

export default function TopicModerationActions({
  topicId,
  topicTitle,
  currentStatus,
}: TopicModerationActionsProps) {
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] =
    useState<TopicStatus | null>(null);

  const [note, setNote] = useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  function openModal(status: TopicStatus) {
    setSelectedStatus(status);
    setNote("");
    setErrorMessage(null);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setSelectedStatus(null);
    setErrorMessage(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedStatus) {
      return;
    }

    if (
      selectedStatus !== "published" &&
      !note.trim()
    ) {
      setErrorMessage(
        "Gizleme veya yasaklama sebebi zorunludur."
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "admin_set_topic_status",
        {
          p_topic_id: topicId,
          p_status: selectedStatus,
          p_note:
            selectedStatus === "published"
              ? note.trim() || null
              : note.trim(),
        }
      );

      if (error) {
        throw error;
      }

      setSelectedStatus(null);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Konu durumu güncellenemedi.";

      const translatedMessage =
        message.includes("TOPIC_NOT_FOUND")
          ? "Konu bulunamadı."
          : message.includes("INVALID_STATUS")
            ? "Geçersiz konu durumu."
            : message.includes("FORBIDDEN")
              ? "Bu işlem için yetkiniz yok."
              : message.includes(
                    "UNAUTHENTICATED"
                  )
                ? "Oturum doğrulanamadı."
                : message;

      setErrorMessage(translatedMessage);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div
        className={
          styles.topicModerationActions
        }
      >
        {currentStatus !== "published" ? (
          <button
            type="button"
            className={
              styles.topicPublishButton
            }
            onClick={() =>
              openModal("published")
            }
          >
            Yayınla
          </button>
        ) : null}

        {currentStatus !== "hidden" ? (
          <button
            type="button"
            className={
              styles.topicHideButton
            }
            onClick={() =>
              openModal("hidden")
            }
          >
            Gizle
          </button>
        ) : null}

        {currentStatus !== "banned" ? (
          <button
            type="button"
            className={
              styles.topicBanButton
            }
            onClick={() =>
              openModal("banned")
            }
          >
            Yasakla
          </button>
        ) : null}
      </div>

      {selectedStatus ? (
        <div
          className={
            styles.topicActionModalBackdrop
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
              styles.topicActionModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-action-title"
          >
            <header
              className={
                styles.topicActionModalHeader
              }
            >
              <div>
                <span>KONU YÖNETİMİ</span>

                <h3 id="topic-action-title">
                  {
                    actionTitles[
                      selectedStatus
                    ]
                  }
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Pencereyi kapat"
              >
                ×
              </button>
            </header>

            <form
              className={
                styles.topicActionForm
              }
              onSubmit={handleSubmit}
            >
              <p>
                <strong>{topicTitle}</strong>
                {" — "}
                {
                  actionDescriptions[
                    selectedStatus
                  ]
                }
              </p>

              <label>
                <span>
                  {selectedStatus ===
                  "published"
                    ? "İşlem notu"
                    : "İşlem sebebi"}
                </span>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder={
                    selectedStatus ===
                    "published"
                      ? "Örneğin: İnceleme tamamlandı, konu yeniden yayına alındı."
                      : selectedStatus ===
                          "hidden"
                        ? "Örneğin: İnceleme tamamlanana kadar geçici olarak gizlendi."
                        : "Örneğin: Topluluk kurallarını ağır şekilde ihlal ediyor."
                  }
                  maxLength={500}
                  disabled={isSaving}
                  required={
                    selectedStatus !==
                    "published"
                  }
                />

                <small>
                  {note.length}/500
                </small>
              </label>

              {errorMessage ? (
                <div
                  className={
                    styles.topicActionError
                  }
                >
                  {errorMessage}
                </div>
              ) : null}

              <div
                className={
                  styles.topicActionModalButtons
                }
              >
                <button
                  type="button"
                  className={
                    styles.topicActionCancelButton
                  }
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className={
                    selectedStatus ===
                    "banned"
                      ? styles.topicActionDangerButton
                      : selectedStatus ===
                          "hidden"
                        ? styles.topicActionWarningButton
                        : styles.topicActionConfirmButton
                  }
                  disabled={isSaving}
                >
                  {isSaving
                    ? "İşleniyor..."
                    : actionTitles[
                        selectedStatus
                      ]}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}