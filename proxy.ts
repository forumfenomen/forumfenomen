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
   * Ana alan adında mevcut app/page.tsx
   * yerine logo sayfasını göster.
   * Tarayıcı adresi "/" olarak kalır.
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
   * Test giriş sayfası ve doğrulama
   * endpoint'i herkese açık olmalıdır.
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
   * Ortam değişkeni yoksa veya çerez
   * geçersizse sistem kapalı kalır.
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
   * Test kapısını geçen kullanıcı için
   * mevcut Supabase oturum ve hesap
   * kısıtlama sistemi aynen çalışır.
   */
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};