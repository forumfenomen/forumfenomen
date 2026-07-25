"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const PRESENCE_INTERVAL_MS = 60_000;

export default function PresenceTracker() {
  useEffect(() => {
    const supabase = createClient();

    let isMounted = true;

    const updatePresence = async () => {
      if (
        !isMounted ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return;
      }

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

    void updatePresence();

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