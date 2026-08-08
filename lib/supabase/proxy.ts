import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

type AccountAccess = {
  account_status: string;
  suspended_until: string | null;
  moderation_reason: string | null;
};

const RESTRICTED_PAGE = "/hesap-kisitli";

const ALLOWED_PATHS = [
  "/giris",
  "/auth",
  "/hesap-kisitli",
];

const PROTECTED_PATHS = [
  "/profil",
  "/konu-ac",
  "/admin",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );
}

function isAllowedPath(pathname: string) {
  return ALLOWED_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );
}

export async function updateSession(
  request: NextRequest
) {
  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabase = createServerClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          supabaseResponse =
            NextResponse.next({
              request,
            });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: claimsData,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsData?.claims?.sub ===
      "string"
      ? claimsData.claims.sub
      : null;

  const pathname =
    request.nextUrl.pathname;

  if (!userId) {
    if (isProtectedPath(pathname)) {
      const redirectUrl =
        request.nextUrl.clone();

      redirectUrl.pathname = "/giris";
      redirectUrl.search = "";

      const response =
        NextResponse.redirect(
          redirectUrl
        );

      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) => {
          response.cookies.set(cookie);
        });

      return response;
    }

    return supabaseResponse;
  }

  const { data, error } =
    await supabase.rpc(
      "get_current_account_access"
    );

  if (error) {
    console.error(
      "Hesap erişimi kontrol edilemedi:",
      error.message
    );

    return supabaseResponse;
  }

  const account =
    (
      data?.[0] ?? null
    ) as AccountAccess | null;

  if (!account) {
    return supabaseResponse;
  }

  const isRestricted =
    account.account_status ===
    "banned" ||
    account.account_status ===
    "suspended";

  if (
    isRestricted &&
    pathname !== RESTRICTED_PAGE &&
    !isAllowedPath(pathname)
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname =
      RESTRICTED_PAGE;

    redirectUrl.search = "";

    const response =
      NextResponse.redirect(
        redirectUrl
      );

    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => {
        response.cookies.set(cookie);
      });

    return response;
  }

  if (
    !isRestricted &&
    pathname === RESTRICTED_PAGE
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname = "/akis";
    redirectUrl.search = "";

    const response =
      NextResponse.redirect(
        redirectUrl
      );

    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => {
        response.cookies.set(cookie);
      });

    return response;
  }

  return supabaseResponse;
}