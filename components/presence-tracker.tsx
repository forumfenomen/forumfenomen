"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const PRESENCE_INTERVAL_MS = 60_000;
const PRESENCE_THROTTLE_MS = 15_000;

export default function PresenceTracker() {
  useEffect(() => {
    const supabase = createClient();

    let isMounted = true;
    let hasSession = false;
    let lastUpdateAt = 0;

    const updatePresence = async (
      force = false
    ) => {
      if (
        !isMounted ||
        !hasSession ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      const now = Date.now();

      if (
        !force &&
        now - lastUpdateAt <
          PRESENCE_THROTTLE_MS
      ) {
        return;
      }

      lastUpdateAt = now;

      const { error } = await supabase.rpc(
        "update_user_presence"
      );

      if (error) {
        console.error(
          "Çevrimiçi durum güncellenemedi:",
          error.message
        );
      }
    };

    const initializePresence = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      hasSession = Boolean(session);

      if (hasSession) {
        await updatePresence(true);
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        void updatePresence();
      }
    };

    const handleFocus = () => {
      void updatePresence();
    };

    void initializePresence();

    const intervalId = window.setInterval(
      () => {
        void updatePresence();
      },
      PRESENCE_INTERVAL_MS
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      isMounted = false;

      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  return null;
}