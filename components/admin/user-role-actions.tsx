"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "@/app/admin/admin.module.css";

type ManagedRole =
  | "user"
  | "moderator";

type UserRoleActionsProps = {
  userId: string;
  displayName: string;
  currentRole: string;
  isProtected: boolean;
};

const roleActionTitles: Record<
  ManagedRole,
  string
> = {
  user: "Moderatör rolünü kaldır",
  moderator: "Kullanıcıyı moderatör yap",
};

const roleActionDescriptions: Record<
  ManagedRole,
  string
> = {
  user:
    "Kullanıcının moderasyon yetkileri kaldırılacak ve normal kullanıcı rolüne dönecek.",
  moderator:
    "Kullanıcı yorum, konu ve şikâyet moderasyonu yapabilecek.",
};

export default function UserRoleActions({
  userId,
  displayName,
  currentRole,
  isProtected,
}: UserRoleActionsProps) {
  const router = useRouter();

  const [selectedRole, setSelectedRole] =
    useState<ManagedRole | null>(null);

  const [note, setNote] = useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const nextRole: ManagedRole =
    currentRole === "moderator"
      ? "user"
      : "moderator";

  function openModal() {
    setSelectedRole(nextRole);
    setNote("");
    setErrorMessage(null);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setSelectedRole(null);
    setErrorMessage(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedRole) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "admin_update_user_role",
        {
          p_user_id: userId,
          p_role: selectedRole,
          p_note: note.trim() || null,
        }
      );

      if (error) {
        throw error;
      }

      setSelectedRole(null);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Rol güncellenemedi.";

      const translatedMessage =
        message.includes("ADMIN_REQUIRED")
          ? "Bu işlemi yalnızca yönetici yapabilir."
          : message.includes(
                "SELF_ROLE_CHANGE_NOT_ALLOWED"
              )
            ? "Kendi rolünü değiştiremezsin."
            : message.includes(
                  "ADMIN_ACCOUNT_PROTECTED"
                )
              ? "Yönetici hesabı korunuyor."
              : message.includes(
                    "INVALID_ROLE"
                  )
                ? "Geçersiz rol seçildi."
                : message.includes(
                      "ROLE_ALREADY_SET"
                    )
                  ? "Kullanıcı zaten bu role sahip."
                  : message.includes(
                        "USER_NOT_FOUND"
                      )
                    ? "Kullanıcı bulunamadı."
                    : message;

      setErrorMessage(translatedMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (isProtected) {
    return null;
  }

  return (
    <>
      <div
        className={
          styles.userRoleActions
        }
      >
        <button
          type="button"
          className={
            currentRole === "moderator"
              ? styles.userRemoveModeratorButton
              : styles.userMakeModeratorButton
          }
          onClick={openModal}
        >
          {currentRole === "moderator"
            ? "Rolü kaldır"
            : "Moderatör yap"}
        </button>
      </div>

      {selectedRole ? (
        <div
          className={
            styles.userRoleModalBackdrop
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
              styles.userRoleModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-role-title"
          >
            <header
              className={
                styles.userRoleModalHeader
              }
            >
              <div>
                <span>ROL YÖNETİMİ</span>

                <h3 id="user-role-title">
                  {
                    roleActionTitles[
                      selectedRole
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
                styles.userRoleForm
              }
              onSubmit={handleSubmit}
            >
              <p>
                <strong>
                  {displayName}
                </strong>
                {" — "}
                {
                  roleActionDescriptions[
                    selectedRole
                  ]
                }
              </p>

              <label>
                <span>İşlem notu</span>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                  placeholder={
                    selectedRole ===
                    "moderator"
                      ? "Örneğin: Topluluk moderasyon ekibine eklendi."
                      : "Örneğin: Moderasyon görevi sona erdi."
                  }
                  maxLength={500}
                  disabled={isSaving}
                />

                <small>
                  {note.length}/500
                </small>
              </label>

              {errorMessage ? (
                <div
                  className={
                    styles.userRoleError
                  }
                >
                  {errorMessage}
                </div>
              ) : null}

              <div
                className={
                  styles.userRoleModalButtons
                }
              >
                <button
                  type="button"
                  className={
                    styles.userRoleCancelButton
                  }
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className={
                    selectedRole ===
                    "moderator"
                      ? styles.userRoleConfirmButton
                      : styles.userRoleWarningButton
                  }
                  disabled={isSaving}
                >
                  {isSaving
                    ? "İşleniyor..."
                    : roleActionTitles[
                        selectedRole
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