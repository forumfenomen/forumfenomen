"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

const TARGET_USER_ID =
  "75b39279-0dca-4daf-bb9e-092eb5438bd7";

export default function AccountSecurityTestPage() {
  const [result, setResult] = useState(
    "Henüz test edilmedi."
  );

  const [isLoading, setIsLoading] =
    useState(false);

  async function runTest() {
    setIsLoading(true);
    setResult("Test çalışıyor...");

    try {
      const supabase = createClient();

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setResult(
          `AUTH ERROR: ${
            authError?.message ??
            "Kullanıcı bulunamadı"
          }`
        );

        return;
      }

      if (authData.user.id === TARGET_USER_ID) {
        setResult(
          "TEST YAPILAMADI - Giriş yapılan hesap hedef kullanıcıyla aynı."
        );

        return;
      }

      const suspendUntil =
        new Date(
          Date.now() + 60 * 60 * 1000
        ).toISOString();

      const { data, error } =
        await supabase.rpc(
          "admin_update_user_account",
          {
            p_user_id: TARGET_USER_ID,
            p_action: "suspend",
            p_reason: "Security test",
            p_suspend_until: suspendUntil,
          }
        );

      if (error) {
        setResult(
          [
            "PASS - Normal kullanıcı hesap yönetimi yapamadı.",
            "",
            `Hedef kullanıcı: ${TARGET_USER_ID}`,
            `RPC sonucu: ${error.message}`,
          ].join("\n")
        );

        return;
      }

      setResult(
        [
          "FAIL - GÜVENLİK AÇIĞI!",
          "Normal kullanıcı başka hesabı askıya alabildi.",
          "",
          `Hedef kullanıcı: ${TARGET_USER_ID}`,
          "",
          JSON.stringify(data, null, 2),
        ].join("\n")
      );
    } catch (error) {
      setResult(
        `TEST ERROR: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#05050d",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <h1>Account Security Test</h1>

        <p>
          Normal kullanıcı hesabıyla başka bir
          kullanıcıyı askıya almayı dener.
        </p>

        <p>
          Hedef kullanıcı ID:
          {" "}
          <code>{TARGET_USER_ID}</code>
        </p>

        <button
          type="button"
          onClick={runTest}
          disabled={isLoading}
          style={{
            marginTop: 20,
            padding: "12px 18px",
            borderRadius: 10,
            cursor: isLoading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {isLoading
            ? "Test ediliyor..."
            : "Başka hesabı askıya almayı dene"}
        </button>

        <pre
          style={{
            marginTop: 24,
            padding: 18,
            whiteSpace: "pre-wrap",
            background: "#11131b",
            borderRadius: 12,
          }}
        >
          {result}
        </pre>
      </div>
    </main>
  );
}