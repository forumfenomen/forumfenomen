import { timingSafeEqual } from "node:crypto";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  SITE_TEST_ACCESS_COOKIE,
  SITE_TEST_ENTRY_PATH,
} from "@/lib/site-test-access";

export const runtime = "nodejs";

function valuesMatch(
  submittedValue: string,
  expectedValue: string
) {
  const submittedBuffer = Buffer.from(
    submittedValue,
    "utf8"
  );

  const expectedBuffer = Buffer.from(
    expectedValue,
    "utf8"
  );

  if (
    submittedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    submittedBuffer,
    expectedBuffer
  );
}

function createErrorRedirect(
  request: NextRequest,
  errorType: "sifre" | "sistem"
) {
  const url = new URL(
    SITE_TEST_ENTRY_PATH,
    request.url
  );

  url.searchParams.set(
    "hata",
    errorType
  );

  return NextResponse.redirect(url, {
    status: 303,
  });
}

export async function POST(
  request: NextRequest
) {
  const expectedPassword =
    process.env.SITE_TEST_PASSWORD;

  const accessToken =
    process.env.SITE_TEST_ACCESS_TOKEN;

  if (!expectedPassword || !accessToken) {
    console.error(
      "Test erişim ortam değişkenleri eksik."
    );

    return createErrorRedirect(
      request,
      "sistem"
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return createErrorRedirect(
      request,
      "sifre"
    );
  }

  const submittedPassword =
    formData.get("password");

  if (
    typeof submittedPassword !== "string" ||
    !valuesMatch(
      submittedPassword,
      expectedPassword
    )
  ) {
    return createErrorRedirect(
      request,
      "sifre"
    );
  }

  const response = NextResponse.redirect(
    new URL("/akis", request.url),
    {
      status: 303,
    }
  );

  response.cookies.set(
    SITE_TEST_ACCESS_COOKIE,
    accessToken,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    }
  );

  return response;
}