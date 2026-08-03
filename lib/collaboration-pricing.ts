export type PricingPlatform =
  | "instagram"
  | "tiktok"
  | "youtube";

export type PricingContentType =
  | "instagram_reel"
  | "instagram_story"
  | "instagram_post"
  | "instagram_ugc"
  | "tiktok_video"
  | "tiktok_ugc"
  | "tiktok_ad_video"
  | "tiktok_live"
  | "youtube_shorts"
  | "youtube_long_video"
  | "youtube_ugc"
  | "youtube_integration";

export type PricingDelivery =
  | "seven"
  | "fourteen"
  | "thirty";

export type PricingInput = {
  platform: PricingPlatform;
  followers: number;
  averageViews: number;
  engagementRate: number;
  contentType: PricingContentType;
  quantity: number;
  delivery: PricingDelivery;
  paidAds: boolean;
  rawFiles: boolean;
  exclusivity: boolean;
};

export type PricingResult = {
  recommendedOffer: number;
  negotiationLow: number;
  negotiationHigh: number;
  minimumPrice: number;
  premiumPrice: number;

  confidence: "low" | "medium" | "high";
  confidenceScore: number;

  positiveReasons: string[];
  warningReasons: string[];

  factors: {
    baseValue: number;
    engagementMultiplier: number;
    quantityMultiplier: number;
    deliveryMultiplier: number;
    rightsMultiplier: number;
  };
};

function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function roundToNearest(
  value: number,
  step = 250
) {
  return Math.max(
    step,
    Math.round(value / step) * step
  );
}

/*
  BETA BAŞLANGIÇ DEĞERLERİ

  Bu değerler kesin Türkiye piyasa tarifesi değildir.
  İlk ürün testinde tutarlı tahmin üretmek için
  merkezi biçimde tutulur ve gerçek anlaşma verileri
  geldikçe güncellenir.
*/
const VIEW_VALUE_TRY: Record<
  PricingPlatform,
  Partial<Record<PricingContentType, number>>
> = {
  instagram: {
    instagram_reel: 0.42,
    instagram_story: 0.16,
    instagram_post: 0.3,
    instagram_ugc: 0.34,
  },
  tiktok: {
    tiktok_video: 0.38,
    tiktok_ugc: 0.34,
    tiktok_ad_video: 0.46,
    tiktok_live: 0.28,
  },
  youtube: {
    youtube_shorts: 0.3,
    youtube_long_video: 0.72,
    youtube_ugc: 0.4,
    youtube_integration: 0.56,
  },
};

const FOLLOWER_FALLBACK_TRY: Record<
  PricingPlatform,
  number
> = {
  instagram: 0.085,
  tiktok: 0.07,
  youtube: 0.045,
};

function getEngagementMultiplier(
  engagementRate: number
) {
  if (engagementRate <= 0) {
    return 0.9;
  }

  if (engagementRate < 1) {
    return 0.85;
  }

  if (engagementRate < 2) {
    return 0.95;
  }

  if (engagementRate < 4) {
    return 1;
  }

  if (engagementRate < 6) {
    return 1.12;
  }

  if (engagementRate < 9) {
    return 1.25;
  }

  return 1.35;
}

function getQuantityMultiplier(
  quantity: number
) {
  const safeQuantity = clamp(
    Math.floor(quantity),
    1,
    20
  );

  if (safeQuantity === 1) {
    return 1;
  }

  /*
    Paket büyüdükçe küçük birim indirimi uygulanır.
  */
  return (
    1 +
    (safeQuantity - 1) * 0.88
  );
}

function getDeliveryMultiplier(
  delivery: PricingDelivery
) {
  switch (delivery) {
    case "seven":
      return 1.15;

    case "thirty":
      return 0.97;

    case "fourteen":
    default:
      return 1;
  }
}

function getRightsMultiplier(
  input: PricingInput
) {
  let multiplier = 1;

  if (input.paidAds) {
    multiplier += 0.5;
  }

  if (input.rawFiles) {
    multiplier += 0.2;
  }

  if (input.exclusivity) {
    multiplier += 0.3;
  }

  return multiplier;
}

function getBaseValue(
  input: PricingInput
) {
  const validAverageViews =
    Number.isFinite(input.averageViews) &&
    input.averageViews > 0;

  if (validAverageViews) {
    return (
      input.averageViews *
      (
        VIEW_VALUE_TRY[input.platform][
          input.contentType
        ] ?? 0.3
      )
    );
  }

  return (
    input.followers *
    FOLLOWER_FALLBACK_TRY[
      input.platform
    ]
  );
}

function getConfidence(
  input: PricingInput
): PricingResult["confidence"] {
  const hasViews =
    input.averageViews > 0;

  const hasFollowers =
    input.followers > 0;

  const hasEngagement =
    input.engagementRate > 0;

  if (
    hasViews &&
    hasFollowers &&
    hasEngagement
  ) {
    return "high";
  }

  if (
    hasViews &&
    (hasFollowers || hasEngagement)
  ) {
    return "medium";
  }

  return "low";
}

function getConfidenceScore(
  input: PricingInput
) {
  let score = 35;

  if (input.followers > 0) {
    score += 10;
  }

  if (input.averageViews > 0) {
    score += 20;
  }

  if (input.engagementRate > 0) {
    score += 15;
  }

  const viewFollowerRatio =
    input.followers > 0
      ? input.averageViews / input.followers
      : 0;

  if (viewFollowerRatio >= 0.75) {
    score += 10;
  } else if (viewFollowerRatio >= 0.35) {
    score += 6;
  } else if (viewFollowerRatio >= 0.15) {
    score += 3;
  }

  if (input.quantity > 0) {
    score += 5;
  }

  if (
    input.paidAds ||
    input.rawFiles ||
    input.exclusivity
  ) {
    score += 5;
  }

  return Math.round(
    clamp(score, 35, 95)
  );
}

function getPositiveReasons(
  input: PricingInput
) {
  const reasons: string[] = [];

  const viewFollowerRatio =
    input.followers > 0
      ? input.averageViews / input.followers
      : 0;

  if (viewFollowerRatio >= 1) {
    reasons.push(
      "views_above_follower_count"
    );
  } else if (viewFollowerRatio >= 0.5) {
    reasons.push(
      "strong_view_performance"
    );
  }

  if (input.engagementRate >= 8) {
    reasons.push(
      "exceptional_engagement"
    );
  } else if (input.engagementRate >= 4) {
    reasons.push(
      "strong_engagement"
    );
  }

  if (input.paidAds) {
    reasons.push(
      "paid_ad_usage"
    );
  }

  if (input.exclusivity) {
    reasons.push(
      "category_exclusivity"
    );
  }

  if (input.rawFiles) {
    reasons.push(
      "raw_file_delivery"
    );
  }

  if (input.delivery === "seven") {
    reasons.push(
      "fast_delivery"
    );
  }

  if (input.quantity >= 2) {
    reasons.push(
      "multiple_content_package"
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "standard_creator_performance"
    );
  }

  return reasons;
}

function getWarningReasons(
  input: PricingInput
) {
  const warnings: string[] = [];

  const viewFollowerRatio =
    input.followers > 0
      ? input.averageViews / input.followers
      : 0;

  if (
    input.followers > 0 &&
    viewFollowerRatio < 0.15
  ) {
    warnings.push(
      "low_view_follower_ratio"
    );
  }

  if (
    input.engagementRate > 0 &&
    input.engagementRate < 1.5
  ) {
    warnings.push(
      "low_engagement_rate"
    );
  }

  if (input.averageViews <= 0) {
    warnings.push(
      "missing_view_data"
    );
  }

  if (input.followers <= 0) {
    warnings.push(
      "missing_follower_data"
    );
  }

  return warnings;
}
export function calculateCollaborationPrice(
  input: PricingInput
): PricingResult {
  const baseValue =
    getBaseValue(input);

  const engagementMultiplier =
    getEngagementMultiplier(
      input.engagementRate
    );

  const quantityMultiplier =
    getQuantityMultiplier(
      input.quantity
    );

  const deliveryMultiplier =
    getDeliveryMultiplier(
      input.delivery
    );

  const rightsMultiplier =
    getRightsMultiplier(input);

  const calculated =
    baseValue *
    engagementMultiplier *
    quantityMultiplier *
    deliveryMultiplier *
    rightsMultiplier;

  /*
    Çok düşük tahminlerin anlamsızlaşmaması için
    üretim emeği tabanı.
  */
  const productionFloor =
    input.contentType === "youtube_long_video"
      ? 3500
      : input.contentType === "youtube_integration"
        ? 2750
        : input.contentType === "tiktok_ad_video"
          ? 2250
          : input.contentType === "instagram_ugc" ||
              input.contentType === "tiktok_ugc" ||
              input.contentType === "youtube_ugc"
            ? 2000
            : input.contentType === "instagram_reel" ||
                input.contentType === "tiktok_video" ||
                input.contentType === "youtube_shorts"
              ? 1500
              : input.contentType === "instagram_post"
                ? 1000
                : input.contentType === "tiktok_live"
                  ? 1250
                  : 750;

  const recommendedOffer =
    roundToNearest(
      Math.max(
        calculated,
        productionFloor *
          input.quantity
      )
    );

  /*
   * Minimum kabul fiyatı:
   * Profesyonel teklifin yaklaşık %82'si.
   * Kullanıcıya pazarlık tabanı sağlar.
   */
  const minimumPrice =
    roundToNearest(
      recommendedOffer * 0.82
    );

  /*
   * Normal pazarlık aralığı.
   */
  const negotiationLow =
    roundToNearest(
      recommendedOffer * 0.92
    );

  const negotiationHigh =
    roundToNearest(
      recommendedOffer * 1.15
    );

  /*
   * Güçlü marka, geniş kullanım hakkı veya
   * güçlü performans halinde savunulabilir üst fiyat.
   */
  const premiumMultiplier =
    1.25 +
    (input.paidAds ? 0.08 : 0) +
    (input.exclusivity ? 0.07 : 0) +
    (input.rawFiles ? 0.03 : 0);

  const premiumPrice =
    roundToNearest(
      recommendedOffer *
        clamp(
          premiumMultiplier,
          1.25,
          1.45
        )
    );

  const confidence =
    getConfidence(input);

  const confidenceScore =
    getConfidenceScore(input);

  const positiveReasons =
    getPositiveReasons(input);

  const warningReasons =
    getWarningReasons(input);

  return {
    recommendedOffer,
    negotiationLow,
    negotiationHigh,
    minimumPrice,
    premiumPrice,
    confidence,
    confidenceScore,
    positiveReasons,
    warningReasons,
    factors: {
      baseValue:
        roundToNearest(baseValue),
      engagementMultiplier,
      quantityMultiplier,
      deliveryMultiplier,
      rightsMultiplier,
    },
  };
}