"use client";

import { useState } from "react";
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

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function updateAccess() {
    const nextAccess = !hasPlusAccess;

    const confirmed = window.confirm(
      nextAccess
        ? `${displayName} kullanıcısına Plus beta erişimi açılsın mı?`
        : `${displayName} kullanıcısının Plus beta erişimi kapatılsın mı?`
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "admin_update_user_plus_access",
        {
          p_user_id: userId,
          p_enabled: nextAccess,
        }
      );

      if (error) {
        throw error;
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
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
    <div className={styles.userPlusAccess}>
      <span
        className={
          hasPlusAccess
            ? styles.userPlusStatusActive
            : styles.userPlusStatusInactive
        }
      >
        {hasPlusAccess
          ? "PLUS AÇIK"
          : "PLUS KAPALI"}
      </span>

      <button
        type="button"
        className={
          hasPlusAccess
            ? styles.userPlusDisableButton
            : styles.userPlusEnableButton
        }
        onClick={updateAccess}
        disabled={isSaving}
      >
        {isSaving
          ? "İşleniyor..."
          : hasPlusAccess
            ? "Plus kapat"
            : "Plus aç"}
      </button>

      {errorMessage ? (
        <small className={styles.userPlusError}>
          {errorMessage}
        </small>
      ) : null}
    </div>
  );
}