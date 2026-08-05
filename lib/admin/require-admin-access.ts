import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireAdminAccess() {
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
    redirect("/giris");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/akis");
  }

  if (
    profile.role !== "admin" &&
    profile.role !== "moderator"
  ) {
    redirect("/akis");
  }

  return {
    supabase,
    userId,
    role: profile.role as "admin" | "moderator",
  };
}