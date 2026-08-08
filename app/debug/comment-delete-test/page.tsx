"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function CommentDeleteSecurityTestPage() {
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

      const {
        data: comment,
        error: commentError,
      } = await supabase
        .from("topic_comments")
        .select("id, content, author_id")
        .eq("status", "published")
        .not("author_id", "is", null)
        .neq("author_id", authData.user.id)
        .limit(1)
        .maybeSingle();

      if (commentError) {
        setResult(
          `YORUM BULMA HATASI:\n${commentError.message}`
        );

        return;
      }

      if (!comment) {
        setResult(
          "TEST YAPILAMADI - Başka kullanıcıya ait yayınlanmış yorum bulunamadı."
        );

        return;
      }

      const { error } = await supabase.rpc(
        "soft_delete_comment",
        {
          p_comment_id: comment.id,
        }
      );

      if (error) {
        setResult(
          [
            "PASS - Başkasının yorumu silinemedi.",
            "",
            `Yorum ID: ${comment.id}`,
            `RPC sonucu: ${error.message}`,
          ].join("\n")
        );

        return;
      }

      setResult(
        [
          "FAIL - GÜVENLİK AÇIĞI!",
          "Başka kullanıcıya ait yorum silinebildi.",
          `Yorum ID: ${comment.id}`,
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
        <h1>Comment Delete Security Test</h1>

        <p>
          Normal kullanıcı hesabıyla başka
          kullanıcının yorumunu silmeyi dener.
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
            : "Başkasının yorumunu silmeyi dene"}
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