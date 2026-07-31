import { createHmac } from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

const validSubjects = new Set([
  "general",
  "advertising",
  "social",
]);

type ContactPayload = {
  fullName?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  language?: unknown;
};

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getClientIp(
  request: NextRequest,
): string {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return (
      forwardedFor
        .split(",")[0]
        ?.trim() || "unknown"
    );
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function createIpHash(
  ipAddress: string,
): string {
  const secret =
    process.env.SUPABASE_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "SUPABASE_SECRET_KEY tanÃ„Â±mlÃ„Â± deÃ„Å¸il.",
    );
  }

  return createHmac("sha256", secret)
    .update(`forumfenomen-contact-ip:${ipAddress}`)
    .digest("hex");
}

function errorResponse(
  code: string,
  status: number,
) {
  return NextResponse.json(
    {
      ok: false,
      code,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  const contentLength = Number(
    request.headers.get("content-length") || "0",
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_BODY_BYTES
  ) {
    return errorResponse(
      "PAYLOAD_TOO_LARGE",
      413,
    );
  }

  const origin = request.headers.get("origin");

  if (
    origin &&
    origin !== request.nextUrl.origin
  ) {
    return errorResponse(
      "INVALID_ORIGIN",
      403,
    );
  }

  let payload: ContactPayload;

  try {
    payload =
      (await request.json()) as ContactPayload;
  } catch {
    return errorResponse(
      "INVALID_JSON",
      400,
    );
  }

  const fullName = normalizeText(
    payload.fullName,
  );

  const email = normalizeText(
    payload.email,
  ).toLowerCase();

  const subject = normalizeText(
    payload.subject,
  );

  const message = normalizeText(
    payload.message,
  );

  const requestedLanguage =
    normalizeText(
      payload.language,
    ).toLowerCase();

  const language =
    requestedLanguage === "en"
      ? "en"
      : "tr";

  if (
    fullName.length < 2 ||
    fullName.length > 100
  ) {
    return errorResponse(
      "INVALID_FULL_NAME",
      400,
    );
  }

  if (
    email.length < 5 ||
    email.length > 254 ||
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
      email,
    )
  ) {
    return errorResponse(
      "INVALID_EMAIL",
      400,
    );
  }

  if (!validSubjects.has(subject)) {
    return errorResponse(
      "INVALID_SUBJECT",
      400,
    );
  }

  if (
    message.length < 10 ||
    message.length > 5000
  ) {
    return errorResponse(
      "INVALID_MESSAGE",
      400,
    );
  }

  try {
    const ipHash = createIpHash(
      getClientIp(request),
    );

    const recentThreshold =
      new Date(
        Date.now() - 10 * 60 * 1000,
      ).toISOString();

    const admin =
      createAdminClient();

    const [
      emailRateResult,
      ipRateResult,
    ] = await Promise.all([
      admin
        .from("contact_messages")
        .select("id")
        .eq("email", email)
        .gt(
          "created_at",
          recentThreshold,
        )
        .limit(3),

      admin
        .from("contact_messages")
        .select("id")
        .eq("ip_hash", ipHash)
        .gt(
          "created_at",
          recentThreshold,
        )
        .limit(5),
    ]);

    if (
      emailRateResult.error ||
      ipRateResult.error
    ) {
      console.error(
        "Contact rate limit check failed:",
        JSON.stringify(
          {
            emailError: emailRateResult.error,
            ipError: ipRateResult.error,
          },
          null,
          2,
        ),
      );

      return errorResponse(
        "GENERAL_ERROR",
        500,
      );
    }

    if (
      (emailRateResult.data?.length || 0) >= 3 ||
      (ipRateResult.data?.length || 0) >= 5
    ) {
      return errorResponse(
        "CONTACT_RATE_LIMIT",
        429,
      );
    }

    const supabase =
      await createClient();

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.warn(
        "Contact form session could not be read:",
        authError.message,
      );
    }

    const userId =
      authData.user?.id || null;

    const { error: insertError } =
      await admin
        .from("contact_messages")
        .insert({
          user_id: userId,
          full_name: fullName,
          email,
          subject,
          message,
          language,
          ip_hash: ipHash,
        });

    if (insertError) {
      console.error(
        "Contact message could not be saved:",
        insertError.message,
      );

      return errorResponse(
        "GENERAL_ERROR",
        500,
      );
    }

    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Contact API error:",
      error,
    );

    return errorResponse(
      "GENERAL_ERROR",
      500,
    );
  }
}
