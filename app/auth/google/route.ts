import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const callbackUrl = new URL("/auth/callback", request.url);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    const errorUrl = new URL("/giris", request.url);
    errorUrl.searchParams.set("error", "google_oauth");

    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(data.url);
}