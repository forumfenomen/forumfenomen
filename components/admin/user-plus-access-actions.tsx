"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type UserPlusAccessActionsProps = {
  userId: string;
  displayName: string;
  hasPlusAccess: boolean;
};

export default function UserPlusAccessActions({
  userId,
  displayName,
  hasPlusAccess,
}: UserPlusAccessActionsProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [currentAccess, setCurrentAccess] =
    useState(hasPlusAccess);

  useEffect(() => {
    setCurrentAccess(hasPlusAccess);
  }, [hasPlusAccess]);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const nextAccess = !currentAccess;

  function openModal() {
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setErrorMessage(null);
    setIsModalOpen(false);
  }

  async function updateAccess() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "admin_update_user_plus_access",
        {
          p_user_id: userId,
          p_enabled: nextAccess,
        }
      );

      if (error) {
        throw error;
      }

      const updatedAccess =
        Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0]?.plus_access === "boolean"
          ? data[0].plus_access
          : nextAccess;

      setCurrentAccess(updatedAccess);

      setIsModalOpen(false);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
            ? error.message
            : "Plus erişimi güncellenemedi.";

      const translatedMessage =
        message.includes("ADMIN_REQUIRED")
          ? "Bu işlemi yalnızca yönetici yapabilir."
          : message.includes("UNAUTHENTICATED")
            ? "Oturum doğrulanamadı."
            : message.includes("USER_NOT_FOUND")
              ? "Kullanıcı bulunamadı."
              : message.includes(
                "PLUS_ACCESS_ALREADY_SET"
              )
                ? "Plus erişimi zaten bu durumda."
                : message;

      setErrorMessage(translatedMessage);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className={styles.userPlusAccess}>
        <span
          className={
            currentAccess
              ? styles.userPlusStatusActive
              : styles.userPlusStatusInactive
          }
        >
          {currentAccess
            ? "PLUS AÇIK"
            : "PLUS KAPALI"}
        </span>

        <button
          type="button"
          className={
            currentAccess
              ? styles.userPlusDisableButton
              : styles.userPlusEnableButton
          }
          onClick={openModal}
        >
          {currentAccess
            ? "Plus kapat"
            : "Plus aç"}
        </button>
      </div>

      {isModalOpen ? (
        <div
          className={styles.userPlusModalBackdrop}
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
            className={styles.userPlusModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-plus-modal-title"
          >
            <header
              className={
                styles.userPlusModalHeader
              }
            >
              <div
                className={
                  nextAccess
                    ? styles.userPlusModalIconEnable
                    : styles.userPlusModalIconDisable
                }
              >
                {nextAccess ? "＋" : "−"}
              </div>

              <div>
                <span>PLUS ERİŞİM YÖNETİMİ</span>

                <h3 id="user-plus-modal-title">
                  {nextAccess
                    ? "Plus erişimini aç"
                    : "Plus erişimini kapat"}
                </h3>
              </div>

              <button
                type="button"
                className={
                  styles.userPlusModalClose
                }
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Pencereyi kapat"
              >
                ×
              </button>
            </header>

            <div className={styles.userPlusModalBody}>
              <p>
                <strong>{displayName}</strong>
                {" kullanıcısının Plus beta erişimi "}
                {nextAccess
                  ? "açılacak."
                  : "kapatılacak."}
              </p>

              <div
                className={
                  nextAccess
                    ? styles.userPlusModalNoticeEnable
                    : styles.userPlusModalNoticeDisable
                }
              >
                {nextAccess
                  ? "Kullanıcı Plus araçlarına ve İş Birliği Asistanı'na erişebilecek."
                  : "Kullanıcı Plus araçlarına erişemeyecek ve Çok Yakında ekranını görecek."}
              </div>

              {errorMessage ? (
                <div
                  className={
                    styles.userPlusModalError
                  }
                >
                  {errorMessage}
                </div>
              ) : null}
            </div>

            <footer
              className={
                styles.userPlusModalButtons
              }
            >
              <button
                type="button"
                className={
                  styles.userPlusModalCancel
                }
                onClick={closeModal}
                disabled={isSaving}
              >
                Vazgeç
              </button>

              <button
                type="button"
                className={
                  nextAccess
                    ? styles.userPlusModalConfirm
                    : styles.userPlusModalDanger
                }
                onClick={updateAccess}
                disabled={isSaving}
              >
                {isSaving
                  ? "İşleniyor..."
                  : nextAccess
                    ? "Plus erişimini aç"
                    : "Plus erişimini kapat"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}