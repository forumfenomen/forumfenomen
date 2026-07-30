import "server-only";

import {
  createHmac,
  randomUUID,
} from "node:crypto";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIEWER_COOKIE_NAME =
  "forumfenomen_viewer_id";

const VIEWER_COOKIE_MAX_AGE =
  60 * 60 * 24 * 365;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function createErrorResponse(
  status: number,
  error: string
) {
  return NextResponse.json(
    {
      error,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

function getClientAddress(
  request: NextRequest
) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const forwardedAddress =
    forwardedFor
      ?.split(",")
      .map((value) => value.trim())
      .find(Boolean);

  return (
    forwardedAddress ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).slice(0, 200);
}

function createViewerHash(
  request: NextRequest,
  viewerId: string,
  secret: string
) {
  const clientAddress =
    getClientAddress(request);

  const userAgent =
    (
      request.headers.get("user-agent") ||
      "unknown"
    ).slice(0, 500);

  return createHmac(
    "sha256",
    secret
  )
    .update(
      [
        viewerId,
        clientAddress,
        userAgent,
      ].join("|")
    )
    .digest("hex");
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  /*
   * Başka sitelerden doğrudan tarayıcı isteği
   * gönderilmesini engelle.
   */
  const requestOrigin =
    request.headers.get("origin");

  if (
    !requestOrigin ||
    requestOrigin !== request.nextUrl.origin
  ) {
    return createErrorResponse(
      403,
      "FORBIDDEN_ORIGIN"
    );
  }

  const { id: topicId } =
    await context.params;

  if (!UUID_PATTERN.test(topicId)) {
    return createErrorResponse(
      400,
      "INVALID_TOPIC_ID"
    );
  }

  const hashSecret =
    process.env.TOPIC_VIEW_HASH_SECRET;

  if (!hashSecret) {
    console.error(
      "TOPIC_VIEW_HASH_SECRET tanımlı değil."
    );

    return createErrorResponse(
      500,
      "VIEW_COUNTER_UNAVAILABLE"
    );
  }

  const existingViewerId =
    request.cookies.get(
      VIEWER_COOKIE_NAME
    )?.value;

  const viewerId =
    existingViewerId &&
    UUID_PATTERN.test(existingViewerId)
      ? existingViewerId
      : randomUUID();

  const shouldSetViewerCookie =
    viewerId !== existingViewerId;

  const viewerHash =
    createViewerHash(
      request,
      viewerId,
      hashSecret
    );

  try {
    const adminSupabase =
      createAdminClient();

    const {
      data,
      error,
    } = await adminSupabase.rpc(
      "record_topic_view",
      {
        p_topic_id: topicId,
        p_viewer_hash: viewerHash,
      }
    );

    if (error) {
      console.error(
        "Konu görüntülenmesi kaydedilemedi:",
        error.message
      );

      return createErrorResponse(
        500,
        "VIEW_COUNTER_FAILED"
      );
    }

    const viewCount =
      Number(data);

    if (!Number.isFinite(viewCount)) {
      return createErrorResponse(
        500,
        "INVALID_VIEW_COUNT"
      );
    }

    const response =
      NextResponse.json(
        {
          viewCount,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );

    if (shouldSetViewerCookie) {
      response.cookies.set(
        VIEWER_COOKIE_NAME,
        viewerId,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          path: "/",
          maxAge:
            VIEWER_COOKIE_MAX_AGE,
        }
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Görüntülenme API hatası:",
      error
    );

    return createErrorResponse(
      500,
      "VIEW_COUNTER_UNAVAILABLE"
    );
  }
}