import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  SITE_PREVIEW_PATH,
  SITE_TEST_ACCESS_COOKIE,
  SITE_TEST_ENTRY_PATH,
} from "@/lib/site-test-access";

import { updateSession } from "@/lib/supabase/proxy";

const PUBLIC_TEST_PATHS = new Set([
  SITE_PREVIEW_PATH,
  SITE_TEST_ENTRY_PATH,
  "/api/test-access",
  "/api/contact",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/site.webmanifest",
]);

function isPublicTestPath(
  pathname: string
) {
  return (
    PUBLIC_TEST_PATHS.has(pathname) ||
    pathname.startsWith("/.well-known/")
  );
}

export async function proxy(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  /*
   * Ana alan adÄ±nda mevcut app/page.tsx
   * yerine logo sayfasÄ±nÄ± gÃ¶ster.
   * TarayÄ±cÄ± adresi "/" olarak kalÄ±r.
   */
  if (pathname === "/") {
    const previewUrl =
      request.nextUrl.clone();

    previewUrl.pathname =
      SITE_PREVIEW_PATH;

    previewUrl.search = "";

    return NextResponse.rewrite(
      previewUrl
    );
  }

  /*
   * Test giriÅŸ sayfasÄ± ve doÄŸrulama
   * endpoint'i herkese aÃ§Ä±k olmalÄ±dÄ±r.
   */
  if (isPublicTestPath(pathname)) {
    return NextResponse.next({
      request,
    });
  }

  const expectedAccessToken =
    process.env.SITE_TEST_ACCESS_TOKEN;

  const currentAccessToken =
    request.cookies.get(
      SITE_TEST_ACCESS_COOKIE
    )?.value;

  /*
   * Ortam deÄŸiÅŸkeni yoksa veya Ã§erez
   * geÃ§ersizse sistem kapalÄ± kalÄ±r.
   */
  if (
    !expectedAccessToken ||
    currentAccessToken !==
      expectedAccessToken
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname = "/";
    redirectUrl.search = "";

    return NextResponse.redirect(
      redirectUrl
    );
  }

  /*
   * Test kapÄ±sÄ±nÄ± geÃ§en kullanÄ±cÄ± iÃ§in
   * mevcut Supabase oturum ve hesap
   * kÄ±sÄ±tlama sistemi aynen Ã§alÄ±ÅŸÄ±r.
   */
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};