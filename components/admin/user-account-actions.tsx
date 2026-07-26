"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type AccountAction =
  | "activate"
  | "suspend"
  | "ban";

type UserAccountActionsProps = {
  userId: string;
  displayName: string;
  accountStatus: string;
  isProtected: boolean;
};

const actionTitles: Record<
  AccountAction,
  string
> = {
  activate: "Hesabı aktifleştir",
  suspend: "Kullanıcıyı askıya al",
  ban: "Kullanıcıyı yasakla",
};

const actionDescriptions: Record<
  AccountAction,
  string
> = {
  activate:
    "Kullanıcının hesabı yeniden aktif hale getirilecek.",
  suspend:
    "Kullanıcı belirlediğin tarihe kadar hesabını kullanamayacak.",
  ban:
    "Kullanıcının hesabı süresiz olarak yasaklanacak.",
};

function getDefaultSuspendDate() {
  const date = new Date();

  date.setDate(date.getDate() + 7);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function UserAccountActions({
  userId,
  displayName,
  accountStatus,
  isProtected,
}: UserAccountActionsProps) {
  const router = useRouter();

  const [selectedAction, setSelectedAction] =
    useState<AccountAction | null>(null);

  const [reason, setReason] = useState("");
  const [suspendUntil, setSuspendUntil] =
    useState(getDefaultSuspendDate());

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  function openModal(action: AccountAction) {
    setSelectedAction(action);
    setReason("");
    setSuspendUntil(
      getDefaultSuspendDate()
    );
    setErrorMessage(null);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setSelectedAction(null);
    setErrorMessage(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedAction) {
      return;
    }

    if (
      selectedAction !== "activate" &&
      !reason.trim()
    ) {
      setErrorMessage(
        "İşlem sebebi zorunludur."
      );

      return;
    }

    if (
      selectedAction === "suspend" &&
      !suspendUntil
    ) {
      setErrorMessage(
        "Askı bitiş tarihi seçmelisin."
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      let suspendUntilIso: string | null =
        null;

      if (selectedAction === "suspend") {
        const selectedDate = new Date(
          `${suspendUntil}T23:59:59`
        );

        if (
          Number.isNaN(
            selectedDate.getTime()
          ) ||
          selectedDate.getTime() <=
            Date.now()
        ) {
          throw new Error(
            "Askı bitiş tarihi gelecekte olmalıdır."
          );
        }

        suspendUntilIso =
          selectedDate.toISOString();
      }

      const { error } = await supabase.rpc(
        "admin_update_user_account",
        {
          p_user_id: userId,
          p_action: selectedAction,
          p_reason:
            selectedAction === "activate"
              ? null
              : reason.trim(),
          p_suspend_until:
            suspendUntilIso,
        }
      );

      if (error) {
        throw error;
      }

      setSelectedAction(null);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "İşlem gerçekleştirilemedi.";

      const translatedMessage =
        message.includes(
          "SELF_ACTION_NOT_ALLOWED"
        )
          ? "Kendi hesabına işlem yapamazsın."
          : message.includes(
                "ADMIN_ACCOUNT_PROTECTED"
              )
            ? "Yönetici hesabı korunuyor."
            : message.includes(
                  "USER_NOT_FOUND"
                )
              ? "Kullanıcı bulunamadı."
              : message.includes(
                    "SUSPEND_UNTIL_REQUIRED"
                  )
                ? "Askı bitiş tarihi zorunludur."
                : message.includes(
                      "INVALID_SUSPEND_UNTIL"
                    )
                  ? "Askı bitiş tarihi gelecekte olmalıdır."
                  : message;

      setErrorMessage(
        translatedMessage
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isProtected) {
    return (
      <div
        className={
          styles.userAccountProtected
        }
      >
        Yönetici hesabı korunuyor
      </div>
    );
  }

  return (
    <>
      <div
        className={
          styles.userAccountActions
        }
      >
        {accountStatus !== "active" ? (
          <button
            type="button"
            className={
              styles.userActivateButton
            }
            onClick={() =>
              openModal("activate")
            }
          >
            Aktifleştir
          </button>
        ) : null}

        {accountStatus !==
        "suspended" ? (
          <button
            type="button"
            className={
              styles.userSuspendButton
            }
            onClick={() =>
              openModal("suspend")
            }
          >
            Askıya al
          </button>
        ) : null}

        {accountStatus !== "banned" ? (
          <button
            type="button"
            className={
              styles.userBanButton
            }
            onClick={() =>
              openModal("ban")
            }
          >
            Yasakla
          </button>
        ) : null}
      </div>

      {selectedAction ? (
        <div
          className={
            styles.userActionModalBackdrop
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
          <div
            className={
              styles.userActionModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-action-title"
          >
            <div
              className={
                styles.userActionModalHeader
              }
            >
              <div>
                <span>
                  KULLANICI YÖNETİMİ
                </span>

                <h3 id="user-action-title">
                  {
                    actionTitles[
                      selectedAction
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
            </div>

            <form
              className={
                styles.userActionForm
              }
              onSubmit={handleSubmit}
            >
              <p>
                <strong>
                  {displayName}
                </strong>
                {" — "}
                {
                  actionDescriptions[
                    selectedAction
                  ]
                }
              </p>

              {selectedAction ===
              "suspend" ? (
                <label>
                  <span>
                    Askı bitiş tarihi
                  </span>

                  <input
                    type="date"
                    value={suspendUntil}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(event) =>
                      setSuspendUntil(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                    required
                  />
                </label>
              ) : null}

              {selectedAction !==
              "activate" ? (
                <label>
                  <span>
                    İşlem sebebi
                  </span>

                  <textarea
                    value={reason}
                    onChange={(event) =>
                      setReason(
                        event.target.value
                      )
                    }
                    placeholder={
                      selectedAction ===
                      "ban"
                        ? "Örneğin: Tekrarlanan ağır topluluk ihlalleri"
                        : "Örneğin: 7 günlük geçici uzaklaştırma"
                    }
                    maxLength={500}
                    disabled={isSaving}
                    required
                  />

                  <small>
                    {reason.length}/500
                  </small>
                </label>
              ) : (
                <div
                  className={
                    styles.userActivateNotice
                  }
                >
                  Askı veya yasak kaldırılacak
                  ve önceki moderasyon sebebi
                  temizlenecek.
                </div>
              )}

              {errorMessage ? (
                <div
                  className={
                    styles.userActionError
                  }
                >
                  {errorMessage}
                </div>
              ) : null}

              <div
                className={
                  styles.userActionModalButtons
                }
              >
                <button
                  type="button"
                  className={
                    styles.userActionCancelButton
                  }
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className={
                    selectedAction ===
                    "ban"
                      ? styles.userActionDangerButton
                      : selectedAction ===
                          "suspend"
                        ? styles.userActionWarningButton
                        : styles.userActionConfirmButton
                  }
                  disabled={isSaving}
                >
                  {isSaving
                    ? "İşleniyor..."
                    : actionTitles[
                        selectedAction
                      ]}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}