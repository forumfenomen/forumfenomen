"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

const TARGET_NOTIFICATION_ID =
  "34d390d1-964d-4cab-be6a-49c0b1a0fdf8";

export default function NotificationSecurityTestPage() {
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

      const { data, error } = await supabase.rpc(
        "mark_notification_read",
        {
          p_notification_id:
            TARGET_NOTIFICATION_ID,
        }
      );

      if (error) {
        setResult(
          `RPC ERROR:\n${error.message}`
        );
        return;
      }

      if (data === false) {
        setResult(
          [
            "PASS - Başkasının bildirimi değiştirilemedi.",
            "",
            `Notification ID: ${TARGET_NOTIFICATION_ID}`,
            "RPC sonucu: false",
          ].join("\n")
        );
        return;
      }

      setResult(
        [
          "FAIL - GÜVENLİK AÇIĞI!",
          "Başka kullanıcıya ait bildirim okundu yapılabildi.",
          `Notification ID: ${TARGET_NOTIFICATION_ID}`,
          `RPC sonucu: ${String(data)}`,
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
        <h1>Notification Security Test</h1>

        <p>
          Normal kullanıcı hesabıyla başka
          kullanıcının bildirimini okundu
          yapmayı dener.
        </p>

        <button
          type="button"
          onClick={runTest}
          disabled={isLoading}
          style={{
            marginTop: 20,
            padding: "12px 18px",
            borderRadius: 10,
          }}
        >
          {isLoading
            ? "Test ediliyor..."
            : "Başkasının bildirimini değiştirmeyi dene"}
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