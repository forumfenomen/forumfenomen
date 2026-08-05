"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type ReportModerationActionsProps = {
  reportId: string;
  status: string;
  reportType?: "comment" | "topic" | "blog";
};

type ClosingStatus =
  | "resolved"
  | "dismissed";

type LoadingAction =
  | "reviewing"
  | ClosingStatus
  | null;

export default function ReportModerationActions({
  reportId,
  status,
  reportType = "comment",
}: ReportModerationActionsProps) {

  const router = useRouter();

  const [supabase] = useState(() =>
    createClient()
  );

  const [modalStatus, setModalStatus] =
    useState<ClosingStatus | null>(null);

  const [resolutionNote, setResolutionNote] =
    useState("");

  const [loadingAction, setLoadingAction] =
    useState<LoadingAction>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const isClosed =
    status === "resolved" ||
    status === "dismissed";

  const submitStatus = async (
    nextStatus:
      | "reviewing"
      | ClosingStatus,
    note: string | null
  ) => {
    setLoadingAction(nextStatus);
    setErrorMessage(null);

    const moderationFunction =
  reportType === "topic"
    ? "moderate_topic_report"
    : reportType === "blog"
      ? "moderate_blog_post_report"
      : "moderate_comment_report";

    const { error } = await supabase.rpc(
      moderationFunction,
      {
        p_report_id: reportId,
        p_status: nextStatus,
        p_resolution_note: note,
      }
    );

    if (error) {
      console.error(
        "Şikâyet işlemi başarısız:",
        error.message
      );

      setErrorMessage(
        "İşlem gerçekleştirilemedi. Tekrar dene."
      );

      setLoadingAction(null);

      return;
    }

    setModalStatus(null);
    setResolutionNote("");
    setLoadingAction(null);

    window.dispatchEvent(
      new Event(
        "admin-notifications-refresh"
      )
    );

    router.refresh();
  };

  const handleReviewing = async () => {
    await submitStatus(
      "reviewing",
      null
    );
  };

  const openClosingModal = (
    nextStatus: ClosingStatus
  ) => {
    setModalStatus(nextStatus);
    setResolutionNote("");
    setErrorMessage(null);
  };

  const closeModal = () => {
    if (loadingAction) {
      return;
    }

    setModalStatus(null);
    setResolutionNote("");
    setErrorMessage(null);
  };

  const handleClosingAction = async () => {
    if (!modalStatus) {
      return;
    }

    const cleanNote =
      resolutionNote.trim();

    if (cleanNote.length < 5) {
      setErrorMessage(
        "En az 5 karakterlik bir işlem notu yaz."
      );

      return;
    }

    await submitStatus(
      modalStatus,
      cleanNote
    );
  };

  if (isClosed) {
    return (
      <span className={styles.reportClosedText}>
        İşlem tamamlandı
      </span>
    );
  }

  return (
    <>
      <div className={styles.reportActions}>
        {status === "pending" || status === "open" ? (
          <button
            type="button"
            className={styles.reviewReportButton}
            disabled={loadingAction !== null}
            onClick={() => {
              void handleReviewing();
            }}
          >
            {loadingAction === "reviewing"
              ? "İşleniyor..."
              : "İncelemeye al"}
          </button>
        ) : null}

        <button
          type="button"
          className={styles.resolveReportButton}
          disabled={loadingAction !== null}
          onClick={() =>
            openClosingModal("resolved")
          }
        >
          İhlal var
        </button>

        <button
          type="button"
          className={styles.dismissReportButton}
          disabled={loadingAction !== null}
          onClick={() =>
            openClosingModal("dismissed")
          }
        >
          Şikâyeti reddet
        </button>
      </div>

      {modalStatus ? (
        <div
          className={styles.adminModalOverlay}
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
          <div
            className={styles.adminModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-action-title"
          >
            <span
              className={
                styles.adminModalEyebrow
              }
            >
              MODERASYON İŞLEMİ
            </span>

            <h2 id="report-action-title">
              {modalStatus === "resolved"
                ? "Şikâyeti sonuçlandır"
                : "Şikâyeti reddet"}
            </h2>

            <p>
              {modalStatus === "resolved"
                ? "İçeriğin kuralları ihlal ettiğini belirten kısa bir yönetici notu yaz."
                : "Şikâyetin neden reddedildiğini açıklayan kısa bir yönetici notu yaz."}
            </p>

            <label
              className={
                styles.adminModalField
              }
            >
              <span>İşlem notu</span>

              <textarea
                value={resolutionNote}
                maxLength={500}
                placeholder={
                  modalStatus === "resolved"
                    ? "Örnek: Yorum topluluk kurallarına aykırı içerik barındırıyor."
                    : "Örnek: İnceleme sonucunda topluluk kurallarına aykırılık bulunmadı."
                }
                onChange={(event) =>
                  setResolutionNote(
                    event.target.value
                  )
                }
              />
            </label>

            <div
              className={
                styles.adminModalCounter
              }
            >
              {resolutionNote.length}/500
            </div>

            {errorMessage ? (
              <div
                className={
                  styles.adminModalError
                }
              >
                {errorMessage}
              </div>
            ) : null}

            <div
              className={
                styles.adminModalActions
              }
            >
              <button
                type="button"
                className={
                  styles.adminModalCancel
                }
                disabled={
                  loadingAction !== null
                }
                onClick={closeModal}
              >
                İptal
              </button>

              <button
                type="button"
                className={
                  modalStatus === "resolved"
                    ? styles.adminModalConfirm
                    : styles.adminModalDismiss
                }
                disabled={
                  loadingAction !== null
                }
                onClick={() => {
                  void handleClosingAction();
                }}
              >
                {loadingAction
                  ? "İşleniyor..."
                  : modalStatus ===
                    "resolved"
                    ? "Sonuçlandır"
                    : "Şikâyeti reddet"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}