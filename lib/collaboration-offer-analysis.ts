export type OfferAnalysisPlatform =
  | "instagram"
  | "tiktok"
  | "youtube";

export type OfferAnalysisStatus =
  | "strong"
  | "acceptable"
  | "negotiate"
  | "reject";

export type OfferAnalysisInput = {
  offerText: string;
  offeredPrice: number;

  platform: OfferAnalysisPlatform;
  contentType: string;
  quantity: number;

  forumMinimumPrice: number;
  forumRecommendedPrice: number;
  forumPremiumPrice: number;

  paidAds: boolean;
  rawFiles: boolean;
  exclusivity: boolean;

  revisionCount: number | null;
  paymentTermDays: number | null;
  usageDurationMonths: number | null;
};

export type OfferAnalysisResult = {
  status: OfferAnalysisStatus;
  score: number;

  priceDifference: number;
  priceDifferencePercent: number;

  recommendedCounterOffer: number;

  detectedTerms: {
    paidAds: boolean;
    rawFiles: boolean;
    exclusivity: boolean;
    perpetualUsage: boolean;
    multiPlatformUsage: boolean;
    unlimitedRevision: boolean;
    productOnlyOffer: boolean;
    performanceGuarantee: boolean;
  };

  risks: string[];
  missingTerms: string[];
  positiveTerms: string[];

  decisionCode: string;
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

function roundSignedToNearest(
  value: number,
  step = 250
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return (
    Math.round(value / step) *
    step
  );
}

function normalizeOfferText(
  value: string
) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(
  text: string,
  patterns: string[]
) {
  return patterns.some((pattern) =>
    text.includes(pattern)
  );
}

function detectOfferTerms(
  offerText: string
): OfferAnalysisResult["detectedTerms"] {
  const text =
    normalizeOfferText(offerText);

  return {
    paidAds:
      containsAny(text, [
        "reklamda kullanım",
        "reklamlarda kullanım",
        "reklam amaçlı",
        "reklam için",
        "reklam olarak",
        "reklam kampanyası",
        "reklam videosu",
        "sponsorlu reklam",
        "paid media",
        "paid ads",
        "whitelisting",
        "boost",
      ]),

    rawFiles:
      containsAny(text, [
        "ham görüntü",
        "ham video",
        "raw dosya",
        "raw footage",
        "kaynak dosya",
      ]),

    exclusivity:
      containsAny(text, [
        "münhasırlık",
        "münhasır",
        "rakip marka",
        "rakiplerle çalışmama",
        "kategori özel",
        "exclusivity",
        "exclusive",
      ]),

    perpetualUsage:
      containsAny(text, [
        "süresiz",
        "sınırsız süre",
        "süresiz kullanım",
        "daimi kullanım",
        "perpetual",
        "in perpetuity",
      ]),

    multiPlatformUsage:
      containsAny(text, [
        "tüm dijital mecralar",
        "tüm dijital kanallar",
        "tüm platformlar",
        "farklı platformlarda",
        "web sitesi ve sosyal medya",
        "all platforms",
        "all digital channels",
      ]),

    unlimitedRevision:
      containsAny(text, [
        "sınırsız revizyon",
        "revizyon sınırı yok",
        "unlimited revision",
        "unlimited revisions",
      ]),

    productOnlyOffer:
      containsAny(text, [
        "ürün karşılığı",
        "barter",
        "hediye ürün",
        "sadece ürün",
        "product exchange",
        "gifted collaboration",
      ]),

    performanceGuarantee:
      containsAny(text, [
        "satış garantisi",
        "izlenme garantisi",
        "erişim garantisi",
        "performans garantisi",
        "guaranteed sales",
        "guaranteed views",
        "performance guarantee",
      ]),
  };
}

function getPriceStatus(
  input: OfferAnalysisInput
): OfferAnalysisStatus {
  if (
    input.offeredPrice >=
    input.forumPremiumPrice
  ) {
    return "strong";
  }

  if (
    input.offeredPrice >=
    input.forumRecommendedPrice
  ) {
    return "acceptable";
  }

  if (
    input.offeredPrice >=
    input.forumMinimumPrice
  ) {
    return "negotiate";
  }

  return "reject";
}

function getDecisionCode(
  status: OfferAnalysisStatus
) {
  if (status === "strong") {
    return "strong_offer";
  }

  if (status === "acceptable") {
    return "acceptable_offer";
  }

  if (status === "negotiate") {
    return "counter_offer_recommended";
  }

  return "below_minimum_price";
}

function getRecommendedCounterOffer(
  input: OfferAnalysisInput,
  status: OfferAnalysisStatus
) {
  if (
    status === "strong" ||
    status === "acceptable"
  ) {
    return roundToNearest(
      input.offeredPrice
    );
  }

  if (status === "negotiate") {
    return roundToNearest(
      input.forumRecommendedPrice
    );
  }

  return roundToNearest(
    Math.max(
      input.forumMinimumPrice,
      input.forumRecommendedPrice
    )
  );
}

function getRisks(
  input: OfferAnalysisInput,
  detected:
    OfferAnalysisResult["detectedTerms"]
) {
  const risks: string[] = [];

  if (
    detected.perpetualUsage
  ) {
    risks.push(
      "perpetual_usage"
    );
  }

  if (
    detected.unlimitedRevision
  ) {
    risks.push(
      "unlimited_revision"
    );
  }

  if (
    detected.productOnlyOffer
  ) {
    risks.push(
      "product_only_offer"
    );
  }

  if (
    detected.performanceGuarantee
  ) {
    risks.push(
      "performance_guarantee"
    );
  }

  if (
    detected.multiPlatformUsage
  ) {
    risks.push(
      "multi_platform_usage"
    );
  }

  if (
    detected.paidAds &&
    !input.paidAds
  ) {
    risks.push(
      "undisclosed_paid_ads"
    );
  }

  if (
    detected.rawFiles &&
    !input.rawFiles
  ) {
    risks.push(
      "undisclosed_raw_files"
    );
  }

  if (
    detected.exclusivity &&
    !input.exclusivity
  ) {
    risks.push(
      "undisclosed_exclusivity"
    );
  }

  if (
    input.offeredPrice <
    input.forumMinimumPrice
  ) {
    risks.push(
      "offer_below_minimum"
    );
  }

  return risks;
}

function getMissingTerms(
  input: OfferAnalysisInput
) {
  const missing: string[] = [];

  if (
    input.paymentTermDays === null
  ) {
    missing.push(
      "payment_term"
    );
  }

  if (
    input.usageDurationMonths === null
  ) {
    missing.push(
      "usage_duration"
    );
  }

  if (
    input.revisionCount === null
  ) {
    missing.push(
      "revision_limit"
    );
  }

  if (
    !normalizeOfferText(
      input.offerText
    ).includes("teslim")
  ) {
    missing.push(
      "delivery_date"
    );
  }

  return missing;
}

function getPositiveTerms(
  input: OfferAnalysisInput,
  status: OfferAnalysisStatus
) {
  const positives: string[] = [];

  if (
    status === "strong"
  ) {
    positives.push(
      "price_above_premium"
    );
  } else if (
    status === "acceptable"
  ) {
    positives.push(
      "price_meets_recommendation"
    );
  }

  if (
    input.paymentTermDays !== null &&
    input.paymentTermDays <= 30
  ) {
    positives.push(
      "clear_payment_term"
    );
  }

  if (
    input.usageDurationMonths !== null &&
    input.usageDurationMonths > 0 &&
    input.usageDurationMonths <= 12
  ) {
    positives.push(
      "limited_usage_duration"
    );
  }

  if (
    input.revisionCount !== null &&
    input.revisionCount >= 0 &&
    input.revisionCount <= 2
  ) {
    positives.push(
      "reasonable_revision_limit"
    );
  }

  return positives;
}

function getOfferScore(
  input: OfferAnalysisInput,
  status: OfferAnalysisStatus,
  risks: string[],
  missingTerms: string[],
  positiveTerms: string[]
) {
  let score =
    status === "strong"
      ? 90
      : status === "acceptable"
        ? 78
        : status === "negotiate"
          ? 60
          : 38;

  score -= risks.length * 6;
  score -= missingTerms.length * 3;
  score += positiveTerms.length * 3;

  if (
    input.offerText.trim().length >= 80
  ) {
    score += 3;
  }

  return Math.round(
    clamp(score, 15, 95)
  );
}

export function analyseCollaborationOffer(
  input: OfferAnalysisInput
): OfferAnalysisResult {
  const safeInput: OfferAnalysisInput = {
    ...input,

    offerText:
      input.offerText ?? "",

    offeredPrice:
      Math.max(
        0,
        input.offeredPrice
      ),

    quantity:
      Math.max(
        1,
        Math.round(input.quantity)
      ),

    forumMinimumPrice:
      Math.max(
        0,
        input.forumMinimumPrice
      ),

    forumRecommendedPrice:
      Math.max(
        0,
        input.forumRecommendedPrice
      ),

    forumPremiumPrice:
      Math.max(
        0,
        input.forumPremiumPrice
      ),
  };

  const detectedTerms =
    detectOfferTerms(
      safeInput.offerText
    );

  const status =
    getPriceStatus(safeInput);

  const risks =
    getRisks(
      safeInput,
      detectedTerms
    );

  const missingTerms =
    getMissingTerms(safeInput);

  const positiveTerms =
    getPositiveTerms(
      safeInput,
      status
    );

  const priceDifference =
    roundSignedToNearest(
      safeInput.offeredPrice -
        safeInput.forumRecommendedPrice
    );

  const priceDifferencePercent =
    safeInput.forumRecommendedPrice > 0
      ? Number(
          (
            (
              priceDifference /
              safeInput.forumRecommendedPrice
            ) *
            100
          ).toFixed(1)
        )
      : 0;

  const recommendedCounterOffer =
    getRecommendedCounterOffer(
      safeInput,
      status
    );

  return {
    status,

    score:
      getOfferScore(
        safeInput,
        status,
        risks,
        missingTerms,
        positiveTerms
      ),

    priceDifference,
    priceDifferencePercent,

    recommendedCounterOffer,

    detectedTerms,

    risks,
    missingTerms,
    positiveTerms,

    decisionCode:
      getDecisionCode(status),
  };
}