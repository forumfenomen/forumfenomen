"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

const FOLLOW_RELATION = {
  followerId:
    "bac56e25-f67e-4767-a782-4452fd59eb7b",
  followingId:
    "a1547c89-79f9-4fa5-86dc-96bff92f8e00",
};

const FOLLOW_REQUEST = {
  requesterId:
    "a1547c89-79f9-4fa5-86dc-96bff92f8e00",
  receiverId:
    "a734aca6-554a-4772-9369-34c85fdd3fca",
};

const TOPIC_REACTION = {
  userId:
    "a734aca6-554a-4772-9369-34c85fdd3fca",
  topicId:
    "b5c6c00c-d0a3-4121-8303-10dab04805cc",
};

const SAVED_TOPIC = {
  userId:
    "a1547c89-79f9-4fa5-86dc-96bff92f8e00",
  topicId:
    "63f5ec5c-6346-4a17-9903-c834d1099542",
};

type TestResult = {
  name: string;
  passed: boolean;
  detail: string;
};

export default function SocialDataSecurityTestPage() {
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

      const currentUserId =
        authData.user.id;

      const forbiddenIds = new Set([
        FOLLOW_RELATION.followerId,
        FOLLOW_RELATION.followingId,
        FOLLOW_REQUEST.requesterId,
        FOLLOW_REQUEST.receiverId,
        TOPIC_REACTION.userId,
        SAVED_TOPIC.userId,
      ]);

      if (forbiddenIds.has(currentUserId)) {
        setResult(
          [
            "TEST YAPILAMADI.",
            "",
            "Giriş yapılan hesap test kayıtlarından birinin tarafı.",
            `Oturum kullanıcısı: ${currentUserId}`,
          ].join("\n")
        );
        return;
      }

      const testResults: TestResult[] = [];

      // 1 - Başka iki kullanıcı arasındaki follow ilişkisi
      {
        const { data, error } =
          await supabase
            .from("user_follows")
            .select(
              "follower_id, following_id"
            )
            .eq(
              "follower_id",
              FOLLOW_RELATION.followerId
            )
            .eq(
              "following_id",
              FOLLOW_RELATION.followingId
            );

        testResults.push({
          name: "user_follows",
          passed:
            Boolean(error) ||
            !data ||
            data.length === 0,
          detail: error
            ? `Reddedildi: ${error.message}`
            : `Sonuç: ${JSON.stringify(
                data
              )}`,
        });
      }

      // 2 - Başka kullanıcıların follow request kaydı
      {
        const { data, error } =
          await supabase
            .from("user_follow_requests")
            .select(
              "requester_id, receiver_id, status"
            )
            .eq(
              "requester_id",
              FOLLOW_REQUEST.requesterId
            )
            .eq(
              "receiver_id",
              FOLLOW_REQUEST.receiverId
            );

        testResults.push({
          name: "user_follow_requests",
          passed:
            Boolean(error) ||
            !data ||
            data.length === 0,
          detail: error
            ? `Reddedildi: ${error.message}`
            : `Sonuç: ${JSON.stringify(
                data
              )}`,
        });
      }

      // 3 - Başka kullanıcının topic reaction kaydı
      {
        const { data, error } =
          await supabase
            .from("topic_reactions")
            .select(
              "user_id, topic_id, reaction"
            )
            .eq(
              "user_id",
              TOPIC_REACTION.userId
            )
            .eq(
              "topic_id",
              TOPIC_REACTION.topicId
            );

        testResults.push({
          name: "topic_reactions",
          passed:
            Boolean(error) ||
            !data ||
            data.length === 0,
          detail: error
            ? `Reddedildi: ${error.message}`
            : `Sonuç: ${JSON.stringify(
                data
              )}`,
        });
      }

      // 4 - Başka kullanıcının saved topic kaydı
      {
        const { data, error } =
          await supabase
            .from("saved_topics")
            .select(
              "user_id, topic_id"
            )
            .eq(
              "user_id",
              SAVED_TOPIC.userId
            )
            .eq(
              "topic_id",
              SAVED_TOPIC.topicId
            );

        testResults.push({
          name: "saved_topics",
          passed:
            Boolean(error) ||
            !data ||
            data.length === 0,
          detail: error
            ? `Reddedildi: ${error.message}`
            : `Sonuç: ${JSON.stringify(
                data
              )}`,
        });
      }

      const allPassed =
        testResults.every(
          (test) => test.passed
        );

      const lines = [
        allPassed
          ? "PASS - Sosyal veri RLS testleri geçti."
          : "FAIL - GÜVENLİK AÇIĞI BULUNDU.",
        "",
        `Oturum kullanıcısı: ${currentUserId}`,
        "",
      ];

      for (const test of testResults) {
        lines.push(
          `${test.passed ? "PASS" : "FAIL"} - ${
            test.name
          }`
        );
        lines.push(test.detail);
        lines.push("");
      }

      setResult(lines.join("\n"));
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
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <h1>
          Social Data RLS Security Test
        </h1>

        <p>
          Normal kullanıcı hesabıyla başka
          kullanıcılara ait sosyal verileri
          doğrudan okumayı dener.
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
            : "RLS testlerini çalıştır"}
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