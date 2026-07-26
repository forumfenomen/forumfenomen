"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type CommentModerationActionsProps = {
  commentId: string;
  status: string;
};

type NextStatus =
  | "published"
  | "hidden";

export default function CommentModerationActions({
  commentId,
  status,
}: CommentModerationActionsProps) {
  const router = useRouter();

  const [supabase] = useState(() =>
    createClient()
  );

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [confirmStatus, setConfirmStatus] =
    useState<NextStatus | null>(null);

  const nextStatus: NextStatus =
    status === "published"
      ? "hidden"
      : "published";

  const openConfirmModal = () => {
    if (loading) {
      return;
    }

    setErrorMessage(null);
    setConfirmStatus(nextStatus);
  };

  const closeConfirmModal = () => {
    if (loading) {
      return;
    }

    setConfirmStatus(null);
    setErrorMessage(null);
  };

  const handleStatusChange = async () => {
    if (!confirmStatus || loading) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.rpc(
      "admin_set_comment_status",
      {
        p_comment_id: commentId,
        p_status: confirmStatus,
      }
    );

    if (error) {
      console.error(
        "Yorum işlemi başarısız:",
        error.message
      );

      setErrorMessage(
        "İşlem gerçekleştirilemedi. Tekrar dene."
      );

      setLoading(false);

      return;
    }

    setLoading(false);
    setConfirmStatus(null);

    router.refresh();
  };

  return (
    <>
      <div className={styles.reportActions}>
        <button
          type="button"
          className={
            status === "published"
              ? styles.dismissReportButton
              : styles.resolveReportButton
          }
          disabled={loading}
          onClick={openConfirmModal}
        >
          {loading
            ? "İşleniyor..."
            : status === "published"
              ? "Yorumu gizle"
              : "Yeniden yayınla"}
        </button>
      </div>

      {confirmStatus ? (
        <div
          className={styles.adminModalOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeConfirmModal();
            }
          }}
        >
          <div
            className={styles.adminModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="comment-action-title"
          >
            <span
              className={
                styles.adminModalEyebrow
              }
            >
              YORUM İŞLEMİ
            </span>

            <h2 id="comment-action-title">
              {confirmStatus === "hidden"
                ? "Yorumu gizle"
                : "Yorumu yeniden yayınla"}
            </h2>

            <p>
              {confirmStatus === "hidden"
                ? "Bu yorum topluluk görünümünden kaldırılacak. İşleme devam etmek istiyor musun?"
                : "Bu yorum tekrar toplulukta görünür hale gelecek. İşleme devam etmek istiyor musun?"}
            </p>

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
                disabled={loading}
                onClick={closeConfirmModal}
              >
                İptal
              </button>

              <button
                type="button"
                className={
                  confirmStatus === "hidden"
                    ? styles.adminModalDismiss
                    : styles.adminModalConfirm
                }
                disabled={loading}
                onClick={() => {
                  void handleStatusChange();
                }}
              >
                {loading
                  ? "İşleniyor..."
                  : confirmStatus === "hidden"
                    ? "Yorumu Gizle"
                    : "Yeniden Yayınla"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}