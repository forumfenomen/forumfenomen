import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type PlusAccessState = {
  isAuthenticated: boolean;
  hasAccess: boolean;
  userId: string | null;
};

export async function getPlusAccessState(): Promise<PlusAccessState> {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (claimsError || !userId) {
    return {
      isAuthenticated: false,
      hasAccess: false,
      userId: null,
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role, plus_access")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      isAuthenticated: true,
      hasAccess: false,
      userId,
    };
  }

  return {
    isAuthenticated: true,
    hasAccess:
      profile.role === "admin" ||
      profile.role === "moderator" ||
      profile.plus_access === true,
    userId,
  };
}

export async function requirePlusAccess() {
  const access = await getPlusAccessState();

  if (!access.isAuthenticated) {
    redirect("/giris");
  }

  if (!access.hasAccess) {
    redirect("/plus");
  }

  return access;
}