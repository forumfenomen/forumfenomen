import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL("/akis", request.url));
    }
  }

  const errorUrl = new URL("/giris", request.url);
  errorUrl.searchParams.set("error", "auth_callback");

  return NextResponse.redirect(errorUrl);
}