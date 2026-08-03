import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const YOUTUBE_API_BASE =
  "https://www.googleapis.com/youtube/v3";

type YouTubeChannelResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      customUrl?: string;
      thumbnails?: {
        high?: {
          url?: string;
        };
        medium?: {
          url?: string;
        };
        default?: {
          url?: string;
        };
      };
    };
    statistics?: {
      subscriberCount?: string;
      viewCount?: string;
      videoCount?: string;
      hiddenSubscriberCount?: boolean;
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
  error?: {
    message?: string;
  };
};

type YouTubePlaylistResponse = {
  items?: Array<{
    contentDetails?: {
      videoId?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

type YouTubeVideosResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: {
        medium?: {
          url?: string;
        };
        high?: {
          url?: string;
        };
      };
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function toSafeNumber(value?: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function round(value: number, digits = 2) {
  const multiplier = 10 ** digits;

  return Math.round(value * multiplier) / multiplier;
}

function cleanHandle(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?youtube\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
}

async function youtubeFetch<T>(
  endpoint: string,
  parameters: Record<string, string>
): Promise<T> {
  const apiKey =
    process.env.YOUTUBE_DATA_API_KEY;

  if (!apiKey) {
    throw new Error(
      "YOUTUBE_DATA_API_KEY tanımlı değil."
    );
  }

  const url = new URL(
    `${YOUTUBE_API_BASE}/${endpoint}`
  );

  Object.entries(parameters).forEach(
    ([key, value]) => {
      url.searchParams.set(key, value);
    }
  );

  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    cache: "no-store",
  });

  const data = (await response.json()) as T & {
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        "YouTube API isteği başarısız oldu."
    );
  }

  return data;
}

export async function GET(
  request: NextRequest
) {
  try {
    const rawHandle =
      request.nextUrl.searchParams.get(
        "handle"
      );

    if (!rawHandle) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "YouTube kullanıcı adı gerekli.",
        },
        {
          status: 400,
        }
      );
    }

    const handle = cleanHandle(rawHandle);

    if (
      handle.length < 2 ||
      handle.length > 100
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Geçerli bir YouTube kullanıcı adı gir.",
        },
        {
          status: 400,
        }
      );
    }

    const channelData =
      await youtubeFetch<YouTubeChannelResponse>(
        "channels",
        {
          part:
            "snippet,statistics,contentDetails",
          forHandle: handle,
          maxResults: "1",
        }
      );

    const channel =
      channelData.items?.[0];

    if (!channel) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Bu kullanıcı adıyla eşleşen YouTube kanalı bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const uploadsPlaylistId =
      channel.contentDetails
        ?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Kanalın video listesi alınamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const playlistData =
      await youtubeFetch<YouTubePlaylistResponse>(
        "playlistItems",
        {
          part: "contentDetails",
          playlistId: uploadsPlaylistId,
          maxResults: "12",
        }
      );

    const videoIds =
      playlistData.items
        ?.map(
          (item) =>
            item.contentDetails?.videoId
        )
        .filter(
          (
            videoId
          ): videoId is string =>
            Boolean(videoId)
        ) ?? [];

    let videos:
      | YouTubeVideosResponse["items"]
      | undefined = [];

    if (videoIds.length > 0) {
      const videosData =
        await youtubeFetch<YouTubeVideosResponse>(
          "videos",
          {
            part:
              "snippet,statistics,contentDetails",
            id: videoIds.join(","),
            maxResults:
              String(videoIds.length),
          }
        );

      videos = videosData.items ?? [];
    }

    const analysedVideos =
      (videos ?? []).map((video) => {
        const views = toSafeNumber(
          video.statistics?.viewCount
        );

        const likes = toSafeNumber(
          video.statistics?.likeCount
        );

        const comments = toSafeNumber(
          video.statistics?.commentCount
        );

        return {
          id: video.id,
          title:
            video.snippet?.title ?? "",
          publishedAt:
            video.snippet?.publishedAt ??
            null,
          thumbnail:
            video.snippet?.thumbnails?.high
              ?.url ??
            video.snippet?.thumbnails?.medium
              ?.url ??
            null,
          duration:
            video.contentDetails?.duration ??
            null,
          views,
          likes,
          comments,
        };
      });

    const videoCount =
      analysedVideos.length;

    const totalViews =
      analysedVideos.reduce(
        (sum, video) =>
          sum + video.views,
        0
      );

    const totalLikes =
      analysedVideos.reduce(
        (sum, video) =>
          sum + video.likes,
        0
      );

    const totalComments =
      analysedVideos.reduce(
        (sum, video) =>
          sum + video.comments,
        0
      );

    const averageViews =
      videoCount > 0
        ? Math.round(
            totalViews / videoCount
          )
        : 0;

    const averageLikes =
      videoCount > 0
        ? Math.round(
            totalLikes / videoCount
          )
        : 0;

    const averageComments =
      videoCount > 0
        ? Math.round(
            totalComments / videoCount
          )
        : 0;

    const subscribers =
      toSafeNumber(
        channel.statistics
          ?.subscriberCount
      );

    const followerEngagementRate =
      subscribers > 0
        ? round(
            ((averageLikes +
              averageComments) /
              subscribers) *
              100
          )
        : null;

    const viewEngagementRate =
      totalViews > 0
        ? round(
            ((totalLikes +
              totalComments) /
              totalViews) *
              100
          )
        : null;

    return NextResponse.json({
      ok: true,
      platform: "youtube",
      channel: {
        id: channel.id,
        handle:
          channel.snippet?.customUrl ??
          `@${handle}`,
        title:
          channel.snippet?.title ??
          handle,
        thumbnail:
          channel.snippet?.thumbnails?.high
            ?.url ??
          channel.snippet?.thumbnails?.medium
            ?.url ??
          channel.snippet?.thumbnails?.default
            ?.url ??
          null,
        subscribers,
        totalViews: toSafeNumber(
          channel.statistics?.viewCount
        ),
        totalVideos: toSafeNumber(
          channel.statistics?.videoCount
        ),
        hiddenSubscriberCount:
          Boolean(
            channel.statistics
              ?.hiddenSubscriberCount
          ),
      },
      analysis: {
        analysedVideoCount:
          videoCount,
        averageViews,
        averageLikes,
        averageComments,
        followerEngagementRate,
        viewEngagementRate,
      },
      videos: analysedVideos,
      generatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "YouTube creator analysis error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "YouTube analizi sırasında beklenmeyen bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}