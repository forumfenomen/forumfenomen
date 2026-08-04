import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest
) {
  const supabase = await createClient();

  const siteUrl =
    process.env.SITE_URL?.replace(/\/+$/, "");

  if (!siteUrl) {
    console.error(
      "SITE_URL ortam değişkeni tanımlı değil."
    );

    const errorUrl = new URL(
      "/giris",
      request.url
    );

    errorUrl.searchParams.set(
      "error",
      "google_oauth"
    );

    return NextResponse.redirect(errorUrl);
  }

  const callbackUrl =
    `${siteUrl}/auth/callback`;

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

  if (error || !data.url) {
    const errorUrl = new URL(
      "/giris",
      request.url
    );

    errorUrl.searchParams.set(
      "error",
      "google_oauth"
    );

    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(data.url);
}