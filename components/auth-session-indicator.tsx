"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AuthSessionIndicator() {
  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    function updateIndicator(
      authenticated: boolean
    ) {
      if (!isActive) {
        return;
      }

      if (authenticated) {
        document.documentElement.dataset.authenticated =
          "true";
      } else {
        document.documentElement.removeAttribute(
          "data-authenticated"
        );
      }
    }

    async function checkSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (error) {
        updateIndicator(false);
        return;
      }

      updateIndicator(Boolean(session));
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateIndicator(Boolean(session));
      }
    );

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}