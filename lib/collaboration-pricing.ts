export type PricingPlatform =
  | "instagram"
  | "tiktok"
  | "youtube";

export type PricingContentType =
  | "reel"
  | "story"
  | "post"
  | "video";

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
  confidence: "low" | "medium" | "high";
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
  Record<PricingContentType, number>
> = {
  instagram: {
    reel: 0.42,
    story: 0.16,
    post: 0.3,
    video: 0.42,
  },
  tiktok: {
    reel: 0.38,
    story: 0.16,
    post: 0.25,
    video: 0.38,
  },
  youtube: {
    reel: 0.3,
    story: 0.12,
    post: 0.22,
    video: 0.72,
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
      VIEW_VALUE_TRY[input.platform][
        input.contentType
      ]
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
    input.contentType === "video"
      ? 2500
      : input.contentType === "reel"
        ? 1500
        : input.contentType === "post"
          ? 1000
          : 750;

  const recommendedOffer =
    roundToNearest(
      Math.max(
        calculated,
        productionFloor *
          input.quantity
      )
    );

  const negotiationLow =
    roundToNearest(
      recommendedOffer * 0.88
    );

  const negotiationHigh =
    roundToNearest(
      recommendedOffer * 1.2
    );

  const minimumPrice =
    roundToNearest(
      recommendedOffer * 0.75
    );

  return {
    recommendedOffer,
    negotiationLow,
    negotiationHigh,
    minimumPrice,
    confidence:
      getConfidence(input),
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