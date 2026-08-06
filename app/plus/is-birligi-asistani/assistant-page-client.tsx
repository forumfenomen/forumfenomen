"use client";

import ForumFooter from "@/components/forum-footer";
import NotificationBell from "@/components/notification-bell";
import SiteSearch from "@/components/site-search";
import {
  getForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";
import {
  calculateCollaborationPrice,
  type PricingContentType,
  type PricingResult,
} from "@/lib/collaboration-pricing";
import {
  analyseCollaborationOffer,
  type OfferAnalysisResult,
} from "@/lib/collaboration-offer-analysis";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./page.module.css";

type Theme = "dark" | "light";
type WorkspaceTab =
  | "price"
  | "analyse"
  | "reply";

type EngagementSource =
  | "automatic"
  | "manual"
  | null;

type CreatorAnalysisResult = {
  platform: "youtube";
  channel: {
    id: string;
    handle: string;
    title: string;
    thumbnail: string | null;
    subscribers: number;
    totalViews: number;
    totalVideos: number;
    hiddenSubscriberCount: boolean;
  };
  analysis: {
    analysedVideoCount: number;
    averageViews: number;
    averageLikes: number;
    averageComments: number;
    followerEngagementRate: number | null;
    viewEngagementRate: number | null;
  };
};

const translations = {
  tr: {
    backToPlus: "Plus'a dÃ¶n",
    plusTool: "FORUMFENOMEN PLUS ARACI",
    title: "Ä°ÅŸ BirliÄŸi AsistanÄ±",
    description:
      "Marka iÅŸ birliklerinde fiyatÄ±nÄ± belirle, teklifleri analiz et ve profesyonel yanÄ±tlarÄ±nÄ± hazÄ±rla.",
    priceTab: "Fiyat Hesapla",
    analyseTab: "Teklifi Analiz Et",
    replyTab: "YanÄ±t HazÄ±rla",
    active: "AKTÄ°F",
    soon: "YAKINDA",
    formTitle: "Ä°ÅŸ birliÄŸi detaylarÄ±",
    accountAnalysisTitle: "HesabÄ±nÄ± otomatik analiz et",
    accountAnalysisDescription:
      "KullanÄ±cÄ± adÄ±nÄ± girerek eriÅŸilebilen herkese aÃ§Ä±k performans verilerini otomatik analiz et.",
    username: "KullanÄ±cÄ± adÄ±",
    usernamePlaceholder: "@kullaniciadi",
    analyseAccount: "HesabÄ± Analiz Et",
    connectAccount: "HesabÄ±mÄ± BaÄŸla",
    manualEntry: "Manuel giriÅŸ",
    automaticAnalysis: "Otomatik analiz",
    analysisPreview: "Analiz sonucu burada gÃ¶rÃ¼necek",
    analysing: "Hesap analiz ediliyor...",
    accountFound: "Hesap bulundu",
    analysedContent: "Analiz edilen iÃ§erik",
    subscribers: "Abone sayÄ±sÄ±",
    averageLikes: "Ortalama beÄŸeni",
    averageComments: "Ortalama yorum",
    followerEngagement: "TakipÃ§i bazlÄ± etkileÅŸim",
    viewEngagement: "Ä°zlenme bazlÄ± etkileÅŸim",
    platformComingSoon:
      "Instagram ve TikTok otomatik analizi yakÄ±nda kullanÄ±ma aÃ§Ä±lacak.",
    analysisFailed:
      "Hesap analizi sÄ±rasÄ±nda bir sorun oluÅŸtu.",
    analysisPreviewDescription:
      "TakipÃ§i, ortalama izlenme ve etkileÅŸim verileri bulunabildiÄŸinde form alanlarÄ±na aktarÄ±lacak.",
    publicDataNotice:
      "KullanÄ±cÄ± adÄ±yla yapÄ±lan analiz yalnÄ±zca eriÅŸilebilen herkese aÃ§Ä±k verilere dayanÄ±r.",
    formDescription:
      "Teklifin kapsamÄ±nÄ± gir. Hesaplama motoru tÃ¼m ayrÄ±ntÄ±larÄ± birlikte deÄŸerlendirecek.",
    platform: "Platform",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    followers: "TakipÃ§i sayÄ±sÄ±",
    followersPlaceholder: "Ã–rn. 25.000",
    averageViews: "Ortalama izlenme",
    averageViewsPlaceholder: "Ã–rn. 18.500",
    engagement: "EtkileÅŸim oranÄ±",
    engagementPlaceholder: "Ã–rn. %4,8",
    averageLikesPlaceholder: "Ã–rn. 850",
    averageCommentsPlaceholder: "Ã–rn. 42",
    averageSaves: "Ortalama kaydetme",
    averageSavesPlaceholder: "Ã–rn. 65",
    averageShares: "Ortalama paylaÅŸÄ±m",
    averageSharesPlaceholder: "Ã–rn. 30",
    followerBasedEngagement: "Abone bazlÄ± etkileÅŸim",
    followerCountBasedEngagement:
      "TakipÃ§i bazlÄ± etkileÅŸim",
    viewBasedEngagement: "Ä°zlenme bazlÄ± etkileÅŸim",
    socialEngagementCalculated:
      "BeÄŸeni, yorum, kaydetme ve paylaÅŸÄ±m verilerinden otomatik hesaplandÄ±",
    enterSocialPerformance:
      "EtkileÅŸim oranÄ±nÄ± hesaplamak iÃ§in iÃ§erik performans verilerini gir.",
    manualEngagementCalculated:
      "BeÄŸeni ve yorum verilerinden otomatik hesaplandÄ±",
    enterManualPerformance:
      "EtkileÅŸim oranÄ±nÄ± hesaplamak iÃ§in ortalama beÄŸeni ve yorum sayÄ±larÄ±nÄ± gir.",
    engagementAutomatic:
      "YouTube son iÃ§eriklerinden otomatik hesaplandÄ±",
    engagementEdited:
      "Otomatik deÄŸer kullanÄ±cÄ± tarafÄ±ndan dÃ¼zenlendi",
    engagementManual:
      "EtkileÅŸim oranÄ±nÄ± manuel olarak gir",
    contentType: "Ä°Ã§erik tÃ¼rÃ¼",
    reel: "Reels",
    story: "Story",
    post: "GÃ¶nderi",
    video: "Video",
    ugc: "UGC",
    tiktokVideo: "TikTok Video",
    adVideo: "Reklam Videosu",
    liveStream: "CanlÄ± YayÄ±n",
    shorts: "Shorts",
    longVideo: "Uzun Video",
    adIntegration: "Reklam Entegrasyonu",
    quantity: "Ä°Ã§erik adedi",
    delivery: "Teslim sÃ¼resi",
    sevenDays: "7 gÃ¼n",
    fourteenDays: "14 gÃ¼n",
    thirtyDays: "30 gÃ¼n",
    usageTitle: "KullanÄ±m ve reklam haklarÄ±",
    organicOnly: "Sadece organik paylaÅŸÄ±m",
    paidAds: "Reklamlarda kullanÄ±m",
    rawFiles: "Ham gÃ¶rÃ¼ntÃ¼ teslimi",
    exclusivity: "Rakip marka kÄ±sÄ±tlamasÄ±",
    calculate: "Fiyat aralÄ±ÄŸÄ±nÄ± hesapla",
    previewLabel: "CANLI Ã–NÄ°ZLEME",
    previewTitle: "Tahmini iÅŸ birliÄŸi deÄŸeri",
    previewDescription:
      "Bilgileri tamamladÄ±ÄŸÄ±nda Ã¶nerilen fiyat aralÄ±ÄŸÄ±n burada gÃ¶rÃ¼necek.",
    recommendedOffer: "Ã–nerilen profesyonel teklif",
    negotiationRange: "PazarlÄ±k aralÄ±ÄŸÄ±",
    minimumPrice: "Minimum kabul fiyatÄ±",
    premiumPrice: "GÃ¼Ã§lÃ¼ pazarlÄ±k Ã¼st sÄ±nÄ±rÄ±",
    forumConfidenceScore: "Veri gÃ¼ven skoru",
    verifiedConfidenceNote:
      "EriÅŸilebilir hesap verileri otomatik analiz edilerek hesaplandÄ±.",
    manualConfidenceNote:
      "KullanÄ±cÄ±nÄ±n manuel girdiÄŸi verilere gÃ¶re hesaplandÄ±.",
    priceStrengths: "FiyatÄ± gÃ¼Ã§lendiren nedenler",
    priceWarnings: "Dikkat edilmesi gerekenler",

    performanceScoreTitle:
      "Hesap performansÄ±",
    performanceLabel:
      "Performans",
    commercialAssessmentTitle:
      "Ticari deÄŸerlendirme",

    minimumPriceDescription:
      "Kapsam azaltÄ±lmadan bunun altÄ±na inilmemeli.",
    recommendedOfferDescription:
      "Markaya sunulacak ana teklif rakamÄ±.",
    premiumPriceDescription:
      "BÃ¼yÃ¼k marka veya ek haklarda kullanÄ±labilir.",

    analysisScope:
      "Analiz kapsamÄ±",
    analysedContentResult:
      "iÃ§erik incelendi",

    assessmentStrongViewsLowEngagement:
      "Ä°zlenme performansÄ± gÃ¼Ã§lÃ¼, ancak etkileÅŸim seviyesi dÃ¼ÅŸÃ¼k. Ã–nerilen teklif ana referans olarak kullanÄ±lmalÄ±.",
    assessmentStrongOverallPerformance:
      "Ä°zlenme ve etkileÅŸim performansÄ± gÃ¼Ã§lÃ¼. Ã–nerilen teklif gÃ¼venle sunulabilir; ek haklarda Ã¼st sÄ±nÄ±r savunulabilir.",
    assessmentBalancedPerformance:
      "Hesap dengeli bir ticari performansa sahip. Ã–nerilen teklif ana pazarlÄ±k rakamÄ± olarak kullanÄ±lmalÄ±.",
    assessmentLimitedPerformance:
      "Ä°zlenme ve etkileÅŸim performansÄ± sÄ±nÄ±rlÄ±. Minimum fiyat korunmalÄ±, daha yÃ¼ksek teklif iÃ§in kapsam ve haklar gerekÃ§elendirilmelidir.",
    assessmentStandardPerformance:
      "Hesap standart performans aralÄ±ÄŸÄ±nda. Ã–nerilen fiyat iÃ§erik Ã¼retim emeÄŸi ve kampanya kapsamÄ±na gÃ¶re kullanÄ±lmalÄ±.",

    reasonViewsAboveFollowerCount:
      "Ortalama izlenme takipÃ§i sayÄ±sÄ±nÄ±n Ã¼zerinde.",
    reasonStrongViewPerformance:
      "Ä°zlenme performansÄ± takipÃ§i kitlesine gÃ¶re gÃ¼Ã§lÃ¼.",
    reasonExceptionalEngagement:
      "EtkileÅŸim oranÄ± olaÄŸanÃ¼stÃ¼ seviyede.",
    reasonStrongEngagement:
      "EtkileÅŸim oranÄ± gÃ¼Ã§lÃ¼ seviyede.",
    reasonPaidAdUsage:
      "Ä°Ã§eriÄŸin reklamda kullanÄ±m hakkÄ± fiyata dahil edildi.",
    reasonCategoryExclusivity:
      "Kategori mÃ¼nhasÄ±rlÄ±ÄŸÄ± ticari deÄŸeri artÄ±rdÄ±.",
    reasonRawFileDelivery:
      "Ham gÃ¶rÃ¼ntÃ¼ teslimi ek Ã¼retim deÄŸeri oluÅŸturdu.",
    reasonFastDelivery:
      "HÄ±zlÄ± teslim sÃ¼resi fiyatÄ± yÃ¼kseltti.",
    reasonMultipleContentPackage:
      "Birden fazla iÃ§erik Ã¼retimi toplam proje deÄŸerini artÄ±rdÄ±.",
    reasonStandardCreatorPerformance:
      "Fiyat standart hesap performansÄ± ve Ã¼retim emeÄŸine gÃ¶re oluÅŸturuldu.",

    warningLowViewFollowerRatio:
      "Ä°zlenme/takipÃ§i oranÄ± dÃ¼ÅŸÃ¼k; teklif verirken performans verilerini gÃ¼ncelle.",
    warningLowEngagementRate:
      "EtkileÅŸim oranÄ± dÃ¼ÅŸÃ¼k olduÄŸu iÃ§in fiyatÄ±n Ã¼st sÄ±nÄ±rÄ± sÄ±nÄ±rlÄ± tutuldu.",
    warningMissingViewData:
      "Ortalama izlenme verisi bulunmadÄ±ÄŸÄ± iÃ§in tahmin gÃ¼veni dÃ¼ÅŸtÃ¼.",
    warningMissingFollowerData:
      "TakipÃ§i verisi bulunmadÄ±ÄŸÄ± iÃ§in karÅŸÄ±laÅŸtÄ±rma kapsamÄ± sÄ±nÄ±rlÄ±.",

    waiting: "Bilgiler bekleniyor",
    calculated: "HesaplandÄ±",
    completeRequiredFields:
      "TakipÃ§i, ortalama izlenme ve etkileÅŸim oranÄ± alanlarÄ±nÄ± doldur.",
    confidence: "Tahmin gÃ¼veni",
    confidenceLow: "DÃ¼ÅŸÃ¼k",
    confidenceMedium: "Orta",
    confidenceHigh: "YÃ¼ksek",
    betaEstimate: "BETA TAHMÄ°NÄ°",
    calculationDetails: "Hesaplama Ã¶zeti",
    dataSource: "Veri kaynaÄŸÄ±",
    automaticData: "Otomatik hesap analizi",
    manualData: "Manuel kullanÄ±cÄ± giriÅŸi",
    usedPlatform: "Platform",
    usedViews: "Ortalama izlenme",
    usedEngagement: "EtkileÅŸim oranÄ±",
    selectedContentType: "Ä°Ã§erik tÃ¼rÃ¼",
    basePerformanceValue: "Performans tabanÄ±",
    engagementFactor: "EtkileÅŸim katsayÄ±sÄ±",
    quantityFactor: "Ä°Ã§erik adedi katsayÄ±sÄ±",
    deliveryFactor: "Teslim sÃ¼resi katsayÄ±sÄ±",
    rightsFactor: "KullanÄ±m hakkÄ± katsayÄ±sÄ±",
    resultOutdated:
      "Form deÄŸiÅŸtiÄŸi iÃ§in fiyatÄ± yeniden hesapla.",
    factorsTitle: "Hesaplamaya dahil edilenler",
    factorOne: "TakipÃ§i ve ortalama izlenme iliÅŸkisi",
    factorTwo: "Ä°Ã§erik Ã¼retim ve teslim kapsamÄ±",
    factorThree: "KullanÄ±m hakkÄ± ve reklam sÃ¼resi",
    factorFour: "MÃ¼nhasÄ±rlÄ±k ve ham gÃ¶rÃ¼ntÃ¼ talepleri",
    notice:
      "GÃ¶sterilecek tutarlar kesin piyasa fiyatÄ± deÄŸil, karar desteÄŸi saÄŸlayan tahmini aralÄ±klardÄ±r.",
    howTitle: "Asistan nasÄ±l Ã§alÄ±ÅŸacak?",
    howOneTitle: "Verilerini gir",
    howOneText:
      "PerformansÄ±nÄ± ve markanÄ±n istediÄŸi iÃ§erikleri belirt.",
    howTwoTitle: "KapsamÄ± deÄŸerlendir",
    howTwoText:
      "KullanÄ±m haklarÄ±, teslim sÃ¼resi ve ek talepler hesaba katÄ±lÄ±r.",
    howThreeTitle: "Teklifini hazÄ±rla",
    howThreeText:
      "Fiyat aralÄ±ÄŸÄ± ve pazarlÄ±k alt sÄ±nÄ±rÄ± birlikte oluÅŸturulur.",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    createTopic: "Konu OluÅŸtur",
    blog: "Blog",
    profile: "Profil",
    changeTheme: "TemayÄ± deÄŸiÅŸtir",
  },
  en: {
    backToPlus: "Back to Plus",
    plusTool: "FORUMFENOMEN PLUS TOOL",
    title: "Collaboration Assistant",
    description:
      "Set your pricing, analyse brand offers and prepare professional replies.",
    priceTab: "Calculate Price",
    analyseTab: "Analyse Offer",
    replyTab: "Prepare Reply",
    active: "ACTIVE",
    soon: "COMING SOON",
    formTitle: "Collaboration details",
    accountAnalysisTitle: "Analyse your account automatically",
    accountAnalysisDescription:
      "Enter a username to analyse available public performance data or connect your account for more reliable results.",
    username: "Username",
    usernamePlaceholder: "@username",
    analyseAccount: "Analyse Account",
    connectAccount: "Connect My Account",
    manualEntry: "Manual entry",
    automaticAnalysis: "Automatic analysis",
    analysisPreview: "Analysis results will appear here",
    analysing: "Analysing account...",
    accountFound: "Account found",
    analysedContent: "Analysed content",
    subscribers: "Subscriber count",
    averageLikes: "Average likes",
    averageComments: "Average comments",
    followerEngagement: "Follower engagement",
    viewEngagement: "View engagement",
    platformComingSoon:
      "Automatic Instagram and TikTok analysis is coming soon.",
    analysisFailed:
      "An error occurred while analysing the account.",
    analysisPreviewDescription:
      "Follower, average-view and engagement data will be transferred into the form when available.",
    publicDataNotice:
      "Username analysis is based only on accessible public information.",
    formDescription:
      "Enter the scope of the offer. The pricing engine will evaluate all details together.",
    platform: "Platform",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    followers: "Follower count",
    followersPlaceholder: "Example: 25,000",
    averageViews: "Average views",
    averageViewsPlaceholder: "Example: 18,500",
    engagement: "Engagement rate",
    engagementPlaceholder: "Example: 4.8%",
    averageLikesPlaceholder: "Example: 850",
    averageCommentsPlaceholder: "Example: 42",
    averageSaves: "Average saves",
    averageSavesPlaceholder: "Example: 65",
    averageShares: "Average shares",
    averageSharesPlaceholder: "Example: 30",
    followerBasedEngagement: "Subscriber-based engagement",
    followerCountBasedEngagement:
      "Follower-based engagement",
    viewBasedEngagement: "View-based engagement",
    socialEngagementCalculated:
      "Automatically calculated from likes, comments, saves and shares",
    enterSocialPerformance:
      "Enter content performance data to calculate the engagement rate.",
    manualEngagementCalculated:
      "Automatically calculated from like and comment data",
    enterManualPerformance:
      "Enter average likes and comments to calculate the engagement rate.",
    engagementAutomatic:
      "Automatically calculated from recent YouTube content",
    engagementEdited:
      "Automatic value edited by the user",
    engagementManual:
      "Enter the engagement rate manually",
    contentType: "Content type",
    reel: "Reels",
    story: "Story",
    post: "Post",
    video: "Video",
    ugc: "UGC",
    tiktokVideo: "TikTok Video",
    adVideo: "Advertising Video",
    liveStream: "Live Stream",
    shorts: "Shorts",
    longVideo: "Long Video",
    adIntegration: "Advertising Integration",
    quantity: "Content quantity",
    delivery: "Delivery period",
    sevenDays: "7 days",
    fourteenDays: "14 days",
    thirtyDays: "30 days",
    usageTitle: "Usage and advertising rights",
    organicOnly: "Organic publishing only",
    paidAds: "Paid advertising usage",
    rawFiles: "Raw footage delivery",
    exclusivity: "Competitor exclusivity",
    calculate: "Calculate pricing range",
    previewLabel: "LIVE PREVIEW",
    previewTitle: "Estimated collaboration value",
    previewDescription:
      "Your suggested pricing range will appear here after completing the details.",
    recommendedOffer: "Recommended professional offer",
    negotiationRange: "Negotiation range",
    minimumPrice: "Minimum acceptable price",
    premiumPrice: "Strong negotiation ceiling",
    forumConfidenceScore: "Data confidence score",
    verifiedConfidenceNote:
      "Calculated from automatically analysed accessible account data.",
    manualConfidenceNote:
      "Calculated from data entered manually by the user.",
    priceStrengths: "Reasons strengthening the price",
    priceWarnings: "Points requiring attention",

    performanceScoreTitle:
      "Account performance",
    performanceLabel:
      "Performance",
    commercialAssessmentTitle:
      "Commercial assessment",

    minimumPriceDescription:
      "Do not go below this without reducing the scope.",
    recommendedOfferDescription:
      "The primary offer to present to the brand.",
    premiumPriceDescription:
      "Use for major brands or additional commercial rights.",

    analysisScope:
      "Analysis scope",
    analysedContentResult:
      "items analysed",

    assessmentStrongViewsLowEngagement:
      "View performance is strong, but engagement is low. Use the recommended offer as the primary reference.",
    assessmentStrongOverallPerformance:
      "View and engagement performance are strong. The recommended offer is defensible, with the ceiling available for additional rights.",
    assessmentBalancedPerformance:
      "The account has balanced commercial performance. Use the recommended offer as the main negotiation figure.",
    assessmentLimitedPerformance:
      "View and engagement performance are limited. Protect the minimum price and justify higher figures through scope and rights.",
    assessmentStandardPerformance:
      "The account is within a standard performance range. Base the offer on production work and campaign scope.",

    reasonViewsAboveFollowerCount:
      "Average views are higher than the follower count.",
    reasonStrongViewPerformance:
      "View performance is strong relative to the audience size.",
    reasonExceptionalEngagement:
      "The engagement rate is at an exceptional level.",
    reasonStrongEngagement:
      "The engagement rate is at a strong level.",
    reasonPaidAdUsage:
      "Paid advertising usage rights were included in the price.",
    reasonCategoryExclusivity:
      "Category exclusivity increased the commercial value.",
    reasonRawFileDelivery:
      "Raw-file delivery added production value.",
    reasonFastDelivery:
      "Fast delivery increased the project price.",
    reasonMultipleContentPackage:
      "Multiple deliverables increased the total project value.",
    reasonStandardCreatorPerformance:
      "The price was based on standard account performance and production work.",

    warningLowViewFollowerRatio:
      "The view-to-follower ratio is low; update performance data before quoting.",
    warningLowEngagementRate:
      "The upper price limit was restricted because engagement is low.",
    warningMissingViewData:
      "Confidence is lower because average-view data is missing.",
    warningMissingFollowerData:
      "Comparison coverage is limited because follower data is missing.",

    waiting: "Waiting for information",
    calculated: "Calculated",
    completeRequiredFields:
      "Complete follower, average views and engagement rate fields.",
    confidence: "Estimate confidence",
    confidenceLow: "Low",
    confidenceMedium: "Medium",
    confidenceHigh: "High",
    betaEstimate: "BETA ESTIMATE",
    calculationDetails: "Calculation summary",
    dataSource: "Data source",
    automaticData: "Automatic account analysis",
    manualData: "Manual user input",
    usedPlatform: "Platform",
    usedViews: "Average views",
    usedEngagement: "Engagement rate",
    selectedContentType: "Content type",
    basePerformanceValue: "Performance base",
    engagementFactor: "Engagement multiplier",
    quantityFactor: "Quantity multiplier",
    deliveryFactor: "Delivery multiplier",
    rightsFactor: "Usage-rights multiplier",
    resultOutdated:
      "Recalculate the price because the form changed.",
    factorsTitle: "Included in the calculation",
    factorOne: "Follower and average-view relationship",
    factorTwo: "Content production and delivery scope",
    factorThree: "Usage rights and advertising period",
    factorFour: "Exclusivity and raw-footage requests",
    notice:
      "Displayed amounts will be decision-support estimates, not guaranteed market prices.",
    howTitle: "How will the assistant work?",
    howOneTitle: "Enter your data",
    howOneText:
      "Provide your performance and requested content details.",
    howTwoTitle: "Evaluate the scope",
    howTwoText:
      "Usage rights, delivery time and additional requests are assessed.",
    howThreeTitle: "Prepare your offer",
    howThreeText:
      "A pricing range and negotiation minimum are generated together.",
    home: "Home",
    categories: "Categories",
    createTopic: "Create Topic",
    blog: "Blog",
    profile: "Profile",
    changeTheme: "Change theme",
  },
} as const;

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function SoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
      />
      <circle
        cx="17.4"
        cy="6.7"
        r="1"
        className="brandDot"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M14.2 3v11.1a4.6 4.6 0 1 1-3.7-4.5" />
      <path d="M14.2 3c.8 2.8 2.5 4.5 5.3 5.1" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="5.5"
        width="19"
        height="13"
        rx="4"
      />
      <path
        d="m10 9 5 3-5 3V9Z"
        className="brandFill"
      />
    </svg>
  );
}
function CalculatorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 10v10h13V10" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M4.5 21c.7-5 3.2-7 7.5-7s6.8 2 7.5 7" />
    </svg>
  );
}

export default function CollaborationAssistantPage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [activeTab, setActiveTab] =
    useState<WorkspaceTab>("price");

  const [selectedPlatform, setSelectedPlatform] =
    useState("instagram");

  const [selectedContent, setSelectedContent] =
    useState<PricingContentType>(
      "instagram_reel"
    );

  const [analysisPlatform, setAnalysisPlatform] =
    useState("youtube");

  const [accountUsername, setAccountUsername] =
    useState("");

  const [followers, setFollowers] =
    useState("");

  const [averageViews, setAverageViews] =
    useState("");

  const [engagementRate, setEngagementRate] =
    useState("");

  const [manualAverageLikes, setManualAverageLikes] =
    useState("");

  const [
    manualAverageComments,
    setManualAverageComments,
  ] = useState("");

  const [
    manualAverageSaves,
    setManualAverageSaves,
  ] = useState("");

  const [
    manualAverageShares,
    setManualAverageShares,
  ] = useState("");

  const [
    engagementSource,
    setEngagementSource,
  ] = useState<EngagementSource>(null);

  const [
    automaticEngagementValue,
    setAutomaticEngagementValue,
  ] = useState("");

  const [analysisResult, setAnalysisResult] =
    useState<CreatorAnalysisResult | null>(null);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [analysisError, setAnalysisError] =
    useState("");

  const [selectedDelivery, setSelectedDelivery] =
    useState("seven");

  const [quantity, setQuantity] =
    useState("1");

  const [pricingResult, setPricingResult] =
    useState<PricingResult | null>(null);

  const [pricingError, setPricingError] =
    useState("");

  const [offerBrandName, setOfferBrandName] =
    useState("");

  const [offerText, setOfferText] =
    useState("");

  const [offeredPrice, setOfferedPrice] =
    useState("");

  const [offerPaymentDays, setOfferPaymentDays] =
    useState("");

  const [offerRevisionCount, setOfferRevisionCount] =
    useState("");

  const [offerUsageMonths, setOfferUsageMonths] =
    useState("");

  const [offerRights, setOfferRights] = useState({
    ads: false,
    raw: false,
    exclusivity: false,
  });

  const [offerAnalysisResult, setOfferAnalysisResult] =
    useState<OfferAnalysisResult | null>(null);

  const [offerAnalysisError, setOfferAnalysisError] =
    useState("");

  const [usageRights, setUsageRights] = useState({
    organic: true,
    ads: false,
    raw: false,
    exclusivity: false,
  });

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem(
        "forumfenomen-theme"
      );

    const resolvedTheme: Theme =
      storedTheme === "light"
        ? "light"
        : "dark";

    setTheme(resolvedTheme);

    document.documentElement.dataset.theme =
      resolvedTheme;

    setLanguage(getForumLanguage());
  }, []);

  useEffect(() => {
    setPricingResult(null);
    setPricingError("");
  }, [
    selectedPlatform,
    followers,
    averageViews,
    engagementRate,
    selectedContent,
    quantity,
    selectedDelivery,
    usageRights.ads,
    usageRights.raw,
    usageRights.exclusivity,
  ]);

  function updateManualEngagement(
    nextLikes: string,
    nextComments: string,
    nextViews = averageViews,
    nextSaves = manualAverageSaves,
    nextShares = manualAverageShares
  ) {
    const parsedLikes =
      parseCountInput(nextLikes);

    const parsedComments =
      parseCountInput(nextComments);

    const parsedViews =
      parseCountInput(nextViews);

    const parsedSaves =
      parseCountInput(nextSaves);

    const parsedShares =
      parseCountInput(nextShares);

    const interactions =
      parsedLikes +
      parsedComments +
      (
        selectedPlatform === "youtube"
          ? 0
          : parsedSaves + parsedShares
      );

    const calculatedRate =
      parsedViews > 0 &&
      interactions > 0
        ? Number(
            (
              (interactions / parsedViews) *
              100
            ).toFixed(2)
          )
        : null;

    const nextEngagement =
      calculatedRate !== null
        ? String(calculatedRate)
        : "";

    setEngagementRate(nextEngagement);
    setAutomaticEngagementValue("");
    setEngagementSource(
      nextEngagement
        ? "manual"
        : null
    );
  }

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(nextTheme);

    document.documentElement.dataset.theme =
      nextTheme;

    window.localStorage.setItem(
      "forumfenomen-theme",
      nextTheme
    );
  }

  async function analyseCreatorAccount() {
    const username = accountUsername.trim();

    if (!username || analysisLoading) {
      return;
    }

    setAnalysisError("");
    setAnalysisResult(null);

    if (analysisPlatform !== "youtube") {
      setAnalysisError(t.platformComingSoon);
      return;
    }

    try {
      setAnalysisLoading(true);

      const response = await fetch(
        `/api/creator-analysis/youtube?handle=${encodeURIComponent(
          username
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || t.analysisFailed
        );
      }

      const result =
        data as CreatorAnalysisResult & {
          ok: true;
        };

      setAnalysisResult(result);

      setSelectedPlatform("youtube");
      setSelectedContent("youtube_shorts");

      setFollowers(
        String(result.channel.subscribers)
      );

      setAverageViews(
        String(result.analysis.averageViews)
      );

      setManualAverageLikes(
        String(result.analysis.averageLikes)
      );

      setManualAverageComments(
        String(result.analysis.averageComments)
      );

      const preferredEngagement =
        result.analysis.viewEngagementRate ??
        result.analysis.followerEngagementRate;

      const automaticEngagement =
        preferredEngagement !== null
          ? String(preferredEngagement)
          : "";

      setEngagementRate(
        automaticEngagement
      );

      setAutomaticEngagementValue(
        automaticEngagement
      );

      setEngagementSource(
        automaticEngagement
          ? "automatic"
          : null
      );
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : t.analysisFailed
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  function parseCountInput(value: string) {
    const normalized = value
      .trim()
      .replace(/\s/g, "")
      .replace(/[.,](?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".");

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  function parsePercentageInput(value: string) {
    const normalized = value
      .trim()
      .replace("%", "")
      .replace(/\s/g, "")
      .replace(",", ".");

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat(
      language === "tr"
        ? "tr-TR"
        : "en-US",
      {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  function calculatePrice() {
    const parsedFollowers =
      parseCountInput(followers);

    const parsedAverageViews =
      parseCountInput(averageViews);

    const parsedEngagement =
      parsePercentageInput(engagementRate);

    const parsedQuantity =
      Math.max(
        1,
        Math.floor(
          parseCountInput(quantity)
        )
      );

    if (
      parsedFollowers <= 0 ||
      parsedAverageViews <= 0 ||
      parsedEngagement <= 0
    ) {
      setPricingResult(null);
      setPricingError(
        t.completeRequiredFields
      );
      return;
    }

    const result =
      calculateCollaborationPrice({
        platform:
          selectedPlatform as
            | "instagram"
            | "tiktok"
            | "youtube",
        followers: parsedFollowers,
        averageViews:
          parsedAverageViews,
        engagementRate:
          parsedEngagement,
        contentType: selectedContent,
        quantity: parsedQuantity,
        delivery:
          selectedDelivery as
            | "seven"
            | "fourteen"
            | "thirty",
        paidAds: usageRights.ads,
        rawFiles: usageRights.raw,
        exclusivity:
          usageRights.exclusivity,
      });

    const hasVerifiedAutomaticData =
      engagementSource === "automatic" &&
      Boolean(analysisResult);

    const sourceAdjustedResult: PricingResult = {
      ...result,

      confidence:
        hasVerifiedAutomaticData
          ? result.confidence
          : result.confidence === "high"
            ? "medium"
            : result.confidence,

      confidenceScore:
        hasVerifiedAutomaticData
          ? result.confidenceScore
          : Math.max(
              35,
              result.confidenceScore - 15
            ),
    };

    setPricingResult(
      sourceAdjustedResult
    );

    setPricingError("");
  }

  function calculateOfferAnalysis() {
    if (!pricingResult) {
      setOfferAnalysisResult(null);
      setOfferAnalysisError(
        language === "tr"
          ? "Ã–nce Fiyat Hesapla sekmesinde iÅŸ birliÄŸi deÄŸerini hesapla."
          : "First calculate the collaboration value in the Calculate Price tab."
      );
      return;
    }

    const parsedOfferedPrice =
      parseCountInput(offeredPrice);

    if (
      !offerBrandName.trim() ||
      !offerText.trim() ||
      parsedOfferedPrice <= 0
    ) {
      setOfferAnalysisResult(null);
      setOfferAnalysisError(
        language === "tr"
          ? "Marka adÄ±, teklif metni ve teklif edilen Ã¼cret alanlarÄ±nÄ± doldur."
          : "Complete the brand name, offer text and offered fee fields."
      );
      return;
    }

    const parseOptionalNumber = (
      value: string
    ) => {
      if (!value.trim()) {
        return null;
      }

      const parsed =
        parseCountInput(value);

      return Number.isFinite(parsed)
        ? Math.max(0, parsed)
        : null;
    };

    const result =
      analyseCollaborationOffer({
        offerText,
        offeredPrice:
          parsedOfferedPrice,

        platform:
          selectedPlatform as
            | "instagram"
            | "tiktok"
            | "youtube",

        contentType:
          selectedContent,

        quantity:
          Math.max(
            1,
            Math.floor(
              parseCountInput(quantity)
            )
          ),

        forumMinimumPrice:
          pricingResult.minimumPrice,

        forumRecommendedPrice:
          pricingResult.recommendedOffer,

        forumPremiumPrice:
          pricingResult.premiumPrice,

        paidAds:
          offerRights.ads,

        rawFiles:
          offerRights.raw,

        exclusivity:
          offerRights.exclusivity,

        revisionCount:
          parseOptionalNumber(
            offerRevisionCount
          ),

        paymentTermDays:
          parseOptionalNumber(
            offerPaymentDays
          ),

        usageDurationMonths:
          parseOptionalNumber(
            offerUsageMonths
          ),
      });

    setOfferAnalysisResult(result);
    setOfferAnalysisError("");
  }

  function toggleOfferRight(
    key: keyof typeof offerRights
  ) {
    setOfferRights((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setOfferAnalysisResult(null);
    setOfferAnalysisError("");
  }

  function toggleUsage(
    key: keyof typeof usageRights
  ) {
    setUsageRights((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  const t = translations[language];

  const positiveReasonLabels: Record<
    string,
    string
  > = {
    views_above_follower_count:
      t.reasonViewsAboveFollowerCount,

    strong_view_performance:
      t.reasonStrongViewPerformance,

    exceptional_engagement:
      t.reasonExceptionalEngagement,

    strong_engagement:
      t.reasonStrongEngagement,

    paid_ad_usage:
      t.reasonPaidAdUsage,

    category_exclusivity:
      t.reasonCategoryExclusivity,

    raw_file_delivery:
      t.reasonRawFileDelivery,

    fast_delivery:
      t.reasonFastDelivery,

    multiple_content_package:
      t.reasonMultipleContentPackage,

    standard_creator_performance:
      t.reasonStandardCreatorPerformance,
  };

  const warningReasonLabels: Record<
    string,
    string
  > = {
    low_view_follower_ratio:
      t.warningLowViewFollowerRatio,

    low_engagement_rate:
      t.warningLowEngagementRate,

    missing_view_data:
      t.warningMissingViewData,

    missing_follower_data:
      t.warningMissingFollowerData,
  };

  const commercialAssessmentText =
    pricingResult
      ? pricingResult.commercialAssessment ===
        "strong_views_low_engagement"
        ? t.assessmentStrongViewsLowEngagement
        : pricingResult.commercialAssessment ===
            "strong_overall_performance"
          ? t.assessmentStrongOverallPerformance
          : pricingResult.commercialAssessment ===
              "balanced_performance"
            ? t.assessmentBalancedPerformance
            : pricingResult.commercialAssessment ===
                "limited_performance"
              ? t.assessmentLimitedPerformance
              : t.assessmentStandardPerformance
      : "";

  const manualFollowersValue =
    parseCountInput(followers);

  const manualViewsValue =
    parseCountInput(averageViews);

  const manualLikesValue =
    parseCountInput(manualAverageLikes);

  const manualCommentsValue =
    parseCountInput(manualAverageComments);

  const manualSavesValue =
    parseCountInput(manualAverageSaves);

  const manualSharesValue =
    parseCountInput(manualAverageShares);

  const manualTotalInteractions =
    manualLikesValue +
    manualCommentsValue +
    (
      selectedPlatform === "youtube"
        ? 0
        : manualSavesValue +
          manualSharesValue
    );

  const manualFollowerEngagement =
    manualFollowersValue > 0 &&
    manualTotalInteractions > 0
      ? Number(
          (
            (manualTotalInteractions /
              manualFollowersValue) *
            100
          ).toFixed(2)
        )
      : null;

  const manualViewEngagement =
    manualViewsValue > 0 &&
    manualTotalInteractions > 0
      ? Number(
          (
            (manualTotalInteractions /
              manualViewsValue) *
            100
          ).toFixed(2)
        )
      : null;

  const contentTypeOptions: Array<{
    id: PricingContentType;
    label: string;
  }> =
    selectedPlatform === "instagram"
      ? [
        {
          id: "instagram_reel",
          label: t.reel,
        },
        {
          id: "instagram_story",
          label: t.story,
        },
        {
          id: "instagram_post",
          label: t.post,
        },
        {
          id: "instagram_ugc",
          label: t.ugc,
        },
      ]
      : selectedPlatform === "tiktok"
        ? [
          {
            id: "tiktok_video",
            label: t.tiktokVideo,
          },
          {
            id: "tiktok_ugc",
            label: t.ugc,
          },
          {
            id: "tiktok_ad_video",
            label: t.adVideo,
          },
          {
            id: "tiktok_live",
            label: t.liveStream,
          },
        ]
        : [
          {
            id: "youtube_shorts",
            label: t.shorts,
          },
          {
            id: "youtube_long_video",
            label: t.longVideo,
          },
          {
            id: "youtube_ugc",
            label: t.ugc,
          },
          {
            id: "youtube_integration",
            label: t.adIntegration,
          },
        ];

  const selectedContentLabel =
    contentTypeOptions.find(
      (contentType) =>
        contentType.id === selectedContent
    )?.label ?? t.video;

  const selectedPlatformLabel =
    selectedPlatform === "instagram"
      ? t.instagram
      : selectedPlatform === "tiktok"
        ? t.tiktok
        : t.youtube;

  const tabs = [
    {
      id: "price" as WorkspaceTab,
      label: t.priceTab,
      icon: <CalculatorIcon />,
      enabled: true,
    },
    {
      id: "analyse" as WorkspaceTab,
      label: t.analyseTab,
      icon: <DocumentIcon />,
      enabled: true,
    },
    {
      id: "reply" as WorkspaceTab,
      label: t.replyTab,
      icon: <MessageIcon />,
      enabled: false,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className="ff-feed-header">
          <Link
            href="/akis"
            className="ff-feed-logo-wrap"
            aria-label="ForumFenomen"
          >
            <Image
              className="ff-feed-logo"
              src="/forumfenomen-logo-transparent.png"
              alt="ForumFenomen"
              width={460}
              height={140}
              priority
            />
          </Link>

          <div className="ff-feed-header-actions">
            <button
              type="button"
              className="ff-round-action"
              onClick={toggleTheme}
              aria-label={t.changeTheme}
              title={t.changeTheme}
            >
              {theme === "dark" ? (
                <MoonIcon />
              ) : (
                <SunIcon />
              )}
            </button>

            <NotificationBell />

            <SiteSearch language={language} />
          </div>
        </header>

        <div className={styles.backLinkRow}>
          <Link
            href="/plus"
            className={styles.backLink}
          >
            <ArrowLeftIcon />
            {t.backToPlus}
          </Link>
        </div>

        <section className={styles.workspaceHero}>
          <div className={styles.heroGlow} />

          <div className={styles.heroMain}>
            <div className={styles.heroIcon}>
              <SparkleIcon />
            </div>

            <div>
              <span>{t.plusTool}</span>
              <h1>{t.title}</h1>
              <p>{t.description}</p>
            </div>
          </div>
        </section>

        <nav className={styles.toolTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? styles.activeTab
                  : ""
              }
              disabled={!tab.enabled}
              onClick={() => {
                if (tab.enabled) {
                  setActiveTab(tab.id);
                }
              }}
            >
              <span className={styles.tabIcon}>
                {tab.icon}
              </span>

              <span className={styles.tabText}>
                <strong>{tab.label}</strong>
                <small>
                  {tab.enabled
                    ? t.active
                    : t.soon}
                </small>
              </span>

              {!tab.enabled && (
                <LockIcon />
              )}
            </button>
          ))}
        </nav>

        {activeTab === "price" && (
        <section className={styles.workspaceGrid}>
          <div className={styles.formCard}>
            <div className={styles.cardHeading}>
              <span>
                <CalculatorIcon />
              </span>

              <div>
                <h2>{t.formTitle}</h2>
                <p>{t.formDescription}</p>
              </div>
            </div>

            <section className={styles.accountAnalysisCard}>
              <div className={styles.analysisHeading}>
                <div className={styles.analysisHeadingIcon}>
                  <SparkleIcon />
                </div>

                <div>
                  <span>{t.automaticAnalysis}</span>
                  <h3>{t.accountAnalysisTitle}</h3>
                  <p>{t.accountAnalysisDescription}</p>
                </div>
              </div>

              <div className={styles.analysisPlatformGrid}>
                {[
                  {
                    id: "instagram",
                    label: t.instagram,
                    icon: <InstagramIcon />,
                    comingSoon: true,
                  },
                  {
                    id: "tiktok",
                    label: t.tiktok,
                    icon: <TikTokIcon />,
                    comingSoon: true,
                  },
                  {
                    id: "youtube",
                    label: t.youtube,
                    icon: <YouTubeIcon />,
                    comingSoon: false,
                  },
                ].map((platform) => {
                  const isDisabled =
                    platform.comingSoon;

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      className={[
                        analysisPlatform ===
                          platform.id
                          ? styles.selectedAnalysisPlatform
                          : "",
                        isDisabled
                          ? styles.analysisPlatformComingSoon
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={isDisabled}
                      aria-disabled={isDisabled}
                      title={
                        isDisabled
                          ? t.platformComingSoon
                          : platform.label
                      }
                      onClick={() => {
                        if (isDisabled) {
                          return;
                        }

                        setAnalysisPlatform(
                          platform.id
                        );

                        setAnalysisResult(null);
                        setAnalysisError("");
                      }}
                    >
                      <span
                        className={
                          styles.analysisPlatformIdentity
                        }
                      >
                        <span
                          className={
                            styles.analysisPlatformIcon
                          }
                        >
                          {platform.icon}
                        </span>

                        <span
                          className={
                            styles.analysisPlatformLabel
                          }
                        >
                          {platform.label}
                        </span>
                      </span>

                      {isDisabled ? (
                        <span
                          className={
                            styles.analysisSoonBadge
                          }
                        >
                          <SoonIcon />
                          {t.soon}
                        </span>
                      ) : (
                        <span
                          className={
                            styles.analysisPlatformActiveName
                          }
                        >
                          {platform.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className={styles.usernameRow}>
                <label>
                  <span>{t.username}</span>

                  <input
                    type="text"
                    value={accountUsername}
                    placeholder={t.usernamePlaceholder}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) =>
                      setAccountUsername(event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className={styles.analyseAccountButton}
                  disabled={
                    !accountUsername.trim() ||
                    analysisLoading
                  }
                  onClick={analyseCreatorAccount}
                >
                  <SparkleIcon />
                  {analysisLoading
                    ? t.analysing
                    : t.analyseAccount}
                </button>
              </div>

              {analysisResult ? (
                <div className={styles.analysisResultCard}>
                  <div className={styles.analysisAccountHeader}>
                    {analysisResult.channel.thumbnail ? (
                      <Image
                        src={analysisResult.channel.thumbnail}
                        alt=""
                        width={52}
                        height={52}
                        className={styles.analysisAvatar}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.analysisResultIcon}>
                        <DocumentIcon />
                      </div>
                    )}

                    <div>
                      <span>{t.accountFound}</span>
                      <strong>
                        {analysisResult.channel.title}
                      </strong>
                      <small>
                        {analysisResult.channel.handle}
                      </small>
                    </div>
                  </div>

                  <div className={styles.analysisMetrics}>
                    <article>
                      <span>{t.subscribers}</span>
                      <strong>
                        {analysisResult.channel.subscribers.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US"
                        )}
                      </strong>
                    </article>

                    <article>
                      <span>{t.averageViews}</span>
                      <strong>
                        {analysisResult.analysis.averageViews.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US"
                        )}
                      </strong>
                    </article>

                    <article>
                      <span>{t.averageLikes}</span>
                      <strong>
                        {analysisResult.analysis.averageLikes.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US"
                        )}
                      </strong>
                    </article>

                    <article>
                      <span>{t.averageComments}</span>
                      <strong>
                        {analysisResult.analysis.averageComments.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US"
                        )}
                      </strong>
                    </article>

                    <article>
                      <span>{t.followerEngagement}</span>
                      <strong>
                        {analysisResult.analysis
                          .followerEngagementRate !== null
                          ? `%${analysisResult.analysis.followerEngagementRate.toLocaleString(
                              language === "tr"
                                ? "tr-TR"
                                : "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`
                          : "â€”"}
                      </strong>
                    </article>

                    <article>
                      <span>{t.viewEngagement}</span>
                      <strong>
                        {analysisResult.analysis
                          .viewEngagementRate !== null
                          ? `%${analysisResult.analysis.viewEngagementRate.toLocaleString(
                              language === "tr"
                                ? "tr-TR"
                                : "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`
                          : "â€”"}
                      </strong>
                    </article>
                  </div>

                  <p className={styles.analysedVideoCount}>
                    {t.analysedContent}:{" "}
                    <strong>
                      {
                        analysisResult.analysis
                          .analysedVideoCount
                      }
                    </strong>
                  </p>
                </div>
              ) : (
                <div className={styles.analysisResultPlaceholder}>
                  <div className={styles.analysisResultIcon}>
                    <DocumentIcon />
                  </div>

                  <div>
                    <strong>{t.analysisPreview}</strong>
                    <p>{t.analysisPreviewDescription}</p>
                  </div>
                </div>
              )}

              {analysisError && (
                <p className={styles.analysisError}>
                  {analysisError}
                </p>
              )}

              <div className={styles.analysisFooter}>
                <p>{t.publicDataNotice}</p>
              </div>
            </section>

            <div className={styles.manualDivider}>
              <span>{t.manualEntry}</span>
            </div>

            <div className={styles.formSection}>
              <label>{t.platform}</label>

              <div className={styles.optionGridThree}>
                {[
                  {
                    id: "instagram",
                    label: t.instagram,
                    icon: <InstagramIcon />,
                  },
                  {
                    id: "tiktok",
                    label: t.tiktok,
                    icon: <TikTokIcon />,
                  },
                  {
                    id: "youtube",
                    label: t.youtube,
                    icon: <YouTubeIcon />,
                  },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    className={
                      selectedPlatform ===
                      platform.id
                        ? styles.selectedOption
                        : ""
                    }
                    onClick={() => {
                      setSelectedPlatform(
                        platform.id
                      );

                      setSelectedContent(
                        platform.id === "instagram"
                          ? "instagram_reel"
                          : platform.id === "tiktok"
                            ? "tiktok_video"
                            : "youtube_shorts"
                      );

                      setFollowers("");
                      setAverageViews("");
                      setManualAverageLikes("");
                      setManualAverageComments("");
                      setManualAverageSaves("");
                      setManualAverageShares("");
                      setEngagementRate("");
                      setAutomaticEngagementValue("");
                      setEngagementSource(null);
                      setAnalysisResult(null);
                      setPricingError("");
                      setPricingResult(null);
                    }}
                  >
                    <span>{platform.icon}</span>
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedPlatform === "youtube" ? (
              <>
                <div className={styles.youtubeManualGrid}>
                  <label>
                    <span>{t.subscribers}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={followers}
                      placeholder={
                        t.followersPlaceholder
                      }
                      onChange={(event) =>
                        setFollowers(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>{t.averageViews}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={averageViews}
                      placeholder={
                        t.averageViewsPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setAverageViews(nextValue);

                        if (
                          engagementSource !==
                          "automatic"
                        ) {
                          updateManualEngagement(
                            manualAverageLikes,
                            manualAverageComments,
                            nextValue
                          );
                        }
                      }}
                    />
                  </label>

                  <label>
                    <span>{t.averageLikes}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={manualAverageLikes}
                      placeholder={
                        t.averageLikesPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setManualAverageLikes(
                          nextValue
                        );

                        updateManualEngagement(
                          nextValue,
                          manualAverageComments
                        );
                      }}
                    />
                  </label>

                  <label>
                    <span>{t.averageComments}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        manualAverageComments
                      }
                      placeholder={
                        t.averageCommentsPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setManualAverageComments(
                          nextValue
                        );

                        updateManualEngagement(
                          manualAverageLikes,
                          nextValue
                        );
                      }}
                    />
                  </label>
                </div>

                <div
                  className={
                    styles.manualEngagementResult
                  }
                >
                  <div>
                    <span>
                      {t.followerBasedEngagement}
                    </span>

                    <strong>
                      {manualFollowerEngagement !==
                      null
                        ? `%${manualFollowerEngagement.toLocaleString(
                            language === "tr"
                              ? "tr-TR"
                              : "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`
                        : "â€”"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.viewBasedEngagement}
                    </span>

                    <strong>
                      {manualViewEngagement !== null
                        ? `%${manualViewEngagement.toLocaleString(
                            language === "tr"
                              ? "tr-TR"
                              : "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`
                        : "â€”"}
                    </strong>
                  </div>

                  <small
                    className={
                      manualViewEngagement !== null
                        ? styles.manualEngagementStatusReady
                        : styles.manualEngagementStatus
                    }
                  >
                    {manualViewEngagement !== null
                      ? t.manualEngagementCalculated
                      : t.enterManualPerformance}
                  </small>
                </div>
              </>
            ) : (
              <>
                <div className={styles.socialManualGrid}>
                  <label>
                    <span>{t.followers}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={followers}
                      placeholder={
                        t.followersPlaceholder
                      }
                      onChange={(event) =>
                        setFollowers(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>{t.averageViews}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={averageViews}
                      placeholder={
                        t.averageViewsPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setAverageViews(nextValue);

                        updateManualEngagement(
                          manualAverageLikes,
                          manualAverageComments,
                          nextValue
                        );
                      }}
                    />
                  </label>

                  <label>
                    <span>{t.averageLikes}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={manualAverageLikes}
                      placeholder={
                        t.averageLikesPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setManualAverageLikes(
                          nextValue
                        );

                        updateManualEngagement(
                          nextValue,
                          manualAverageComments
                        );
                      }}
                    />
                  </label>

                  <label>
                    <span>{t.averageComments}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        manualAverageComments
                      }
                      placeholder={
                        t.averageCommentsPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setManualAverageComments(
                          nextValue
                        );

                        updateManualEngagement(
                          manualAverageLikes,
                          nextValue
                        );
                      }}
                    />
                  </label>

                  <label>
                    <span>{t.averageSaves}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={manualAverageSaves}
                      placeholder={
                        t.averageSavesPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setManualAverageSaves(
                          nextValue
                        );

                        updateManualEngagement(
                          manualAverageLikes,
                          manualAverageComments,
                          averageViews,
                          nextValue,
                          manualAverageShares
                        );
                      }}
                    />
                  </label>

                  <label>
                    <span>{t.averageShares}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={manualAverageShares}
                      placeholder={
                        t.averageSharesPlaceholder
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setManualAverageShares(
                          nextValue
                        );

                        updateManualEngagement(
                          manualAverageLikes,
                          manualAverageComments,
                          averageViews,
                          manualAverageSaves,
                          nextValue
                        );
                      }}
                    />
                  </label>
                </div>

                <div
                  className={
                    styles.manualEngagementResult
                  }
                >
                  <div>
                    <span>
                      {t.followerCountBasedEngagement}
                    </span>

                    <strong>
                      {manualFollowerEngagement !==
                      null
                        ? `%${manualFollowerEngagement.toLocaleString(
                            language === "tr"
                              ? "tr-TR"
                              : "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`
                        : "â€”"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.viewBasedEngagement}
                    </span>

                    <strong>
                      {manualViewEngagement !== null
                        ? `%${manualViewEngagement.toLocaleString(
                            language === "tr"
                              ? "tr-TR"
                              : "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`
                        : "â€”"}
                    </strong>
                  </div>

                  <small
                    className={
                      manualViewEngagement !== null
                        ? styles.manualEngagementStatusReady
                        : styles.manualEngagementStatus
                    }
                  >
                    {manualViewEngagement !== null
                      ? t.socialEngagementCalculated
                      : t.enterSocialPerformance}
                  </small>
                </div>
              </>
            )}

            <div className={styles.formSection}>
              <label>{t.contentType}</label>

              <div className={styles.optionGridFour}>
                {contentTypeOptions.map((contentType) => (
                  <button
                    key={contentType.id}
                    type="button"
                    className={
                      selectedContent ===
                      contentType.id
                        ? styles.selectedOption
                        : ""
                    }
                    onClick={() =>
                      setSelectedContent(
                        contentType.id
                      )
                    }
                  >
                    {contentType.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGridTwo}>
              <label>
                <span>{t.quantity}</span>

                <select
                  value={quantity}
                  onChange={(event) => {
                    setQuantity(
                      event.target.value
                    );
                    setPricingResult(null);
                  }}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </label>

              <div className={styles.deliveryField}>
                <span>{t.delivery}</span>

                <div className={styles.deliveryOptions}>
                  {[
                    {
                      id: "seven",
                      label: t.sevenDays,
                    },
                    {
                      id: "fourteen",
                      label: t.fourteenDays,
                    },
                    {
                      id: "thirty",
                      label: t.thirtyDays,
                    },
                  ].map((delivery) => (
                    <button
                      key={delivery.id}
                      type="button"
                      className={
                        selectedDelivery ===
                        delivery.id
                          ? styles.selectedDelivery
                          : ""
                      }
                      onClick={() =>
                        setSelectedDelivery(
                          delivery.id
                        )
                      }
                    >
                      {delivery.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <label>{t.usageTitle}</label>

              <div className={styles.usageGrid}>
                {[
                  {
                    key: "organic" as const,
                    label: t.organicOnly,
                  },
                  {
                    key: "ads" as const,
                    label: t.paidAds,
                  },
                  {
                    key: "raw" as const,
                    label: t.rawFiles,
                  },
                  {
                    key: "exclusivity" as const,
                    label: t.exclusivity,
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={
                      usageRights[option.key]
                        ? styles.selectedUsage
                        : ""
                    }
                    onClick={() =>
                      toggleUsage(option.key)
                    }
                  >
                    <span className={styles.checkbox}>
                      {usageRights[
                        option.key
                      ] && <CheckIcon />}
                    </span>

                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.calculateButton}
              onClick={calculatePrice}
            >
              <SparkleIcon />
              {t.calculate}
            </button>

            {pricingError && (
              <p className={styles.pricingError}>
                {pricingError}
              </p>
            )}
          </div>

          <aside className={styles.previewCard}>
            <div className={styles.previewTop}>
              <span>{t.previewLabel}</span>

              <div
                className={
                  pricingResult
                    ? `${styles.previewPulse} ${styles.previewReady}`
                    : styles.previewPulse
                }
              >
                <i />
                {pricingResult
                  ? t.calculated
                  : t.waiting}
              </div>
            </div>

            <div className={styles.previewIntro}>
              <div className={styles.previewIcon}>
                <SparkleIcon />
              </div>

              <h2>{t.previewTitle}</h2>
              <p>{t.previewDescription}</p>
            </div>

            <div className={styles.pricePreview}>
              <article
                className={styles.minimumPriceCard}
              >
                <div className={styles.priceText}>
                  <span>{t.minimumPrice}</span>
                  <small>
                    {t.minimumPriceDescription}
                  </small>
                </div>

                <strong>
                  {pricingResult
                    ? formatCurrency(
                        pricingResult.minimumPrice
                      )
                    : "â€” TL"}
                </strong>
              </article>

              <article
                className={
                  styles.recommendedPriceCard
                }
              >
                <div className={styles.priceText}>
                  <span>
                    {t.recommendedOffer}
                  </span>
                  <small>
                    {t.recommendedOfferDescription}
                  </small>
                </div>

                <strong>
                  {pricingResult
                    ? formatCurrency(
                        pricingResult.recommendedOffer
                      )
                    : "â€” TL"}
                </strong>
              </article>

              <article
                className={styles.premiumPriceCard}
              >
                <div className={styles.priceText}>
                  <span>
                    {t.premiumPrice}
                  </span>
                  <small>
                    {t.premiumPriceDescription}
                  </small>
                </div>

                <strong>
                  {pricingResult
                    ? formatCurrency(
                        pricingResult.premiumPrice
                      )
                    : "â€” TL"}
                </strong>
              </article>
            </div>

            {pricingResult && (
              <>
                <div className={styles.confidenceCard}>
                  <div
                    className={
                      styles.confidenceHeading
                    }
                  >
                    <span>
                      {t.forumConfidenceScore}
                    </span>

                    <p>
                      {engagementSource ===
                        "automatic" &&
                      analysisResult
                        ? t.verifiedConfidenceNote
                        : t.manualConfidenceNote}
                    </p>
                  </div>

                  <div
                    className={
                      styles.confidenceValue
                    }
                  >
                    <small>{t.confidence}</small>

                    <strong>
                      {pricingResult.confidenceScore}
                      /100
                    </strong>

                    <span>
                      {pricingResult.confidence ===
                      "high"
                        ? t.confidenceHigh
                        : pricingResult.confidence ===
                            "medium"
                          ? t.confidenceMedium
                          : t.confidenceLow}
                    </span>
                  </div>
                </div>

                <div className={styles.performanceCard}>
                  <div
                    className={
                      styles.performanceHeading
                    }
                  >
                    <span>
                      {t.performanceScoreTitle}
                    </span>
                  </div>

                  <div
                    className={
                      styles.performanceValue
                    }
                  >
                    <small>
                      {t.performanceLabel}
                    </small>

                    <strong>
                      {pricingResult.performanceScore}
                      /100
                    </strong>

                    <span>
                      {pricingResult.performance ===
                      "high"
                        ? t.confidenceHigh
                        : pricingResult.performance ===
                            "medium"
                          ? t.confidenceMedium
                          : t.confidenceLow}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.commercialAssessment
                  }
                >
                  <strong>
                    {t.commercialAssessmentTitle}
                  </strong>

                  <p>
                    {commercialAssessmentText}
                  </p>
                </div>
                <div className={styles.pricingReasons}>
                  <section
                    className={
                      styles.positiveReasonGroup
                    }
                  >
                    <h3>{t.priceStrengths}</h3>

                    {pricingResult.positiveReasons.map(
                      (reason) => (
                        <div key={reason}>
                          <CheckIcon />

                          <span>
                            {positiveReasonLabels[
                              reason
                            ] ?? reason}
                          </span>
                        </div>
                      )
                    )}
                  </section>

                  {pricingResult.warningReasons
                    .length > 0 && (
                    <section
                      className={
                        styles.warningReasonGroup
                      }
                    >
                      <h3>{t.priceWarnings}</h3>

                      {pricingResult.warningReasons.map(
                        (reason) => (
                          <div key={reason}>
                            <span
                              className={
                                styles.warningMarker
                              }
                            >
                              !
                            </span>

                            <span>
                              {warningReasonLabels[
                                reason
                              ] ?? reason}
                            </span>
                          </div>
                        )
                      )}
                    </section>
                  )}
                </div>

                <div className={styles.calculationSummary}>
                  <h3>{t.calculationDetails}</h3>

                  <div>
                    <span>{t.negotiationRange}</span>

                    <strong>
                      {formatCurrency(
                        pricingResult.negotiationLow
                      )}{" "}
                      â€“{" "}
                      {formatCurrency(
                        pricingResult.negotiationHigh
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>{t.dataSource}</span>
                    <strong>
                      {engagementSource ===
                        "automatic" &&
                      analysisResult
                        ? t.automaticData
                        : t.manualData}
                    </strong>
                  </div>

                  {engagementSource ===
                    "automatic" &&
                    analysisResult && (
                    <div>
                      <span>{t.analysisScope}</span>

                      <strong>
                        {
                          analysisResult.analysis
                            .analysedVideoCount
                        }{" "}
                        {t.analysedContentResult}
                      </strong>
                    </div>
                  )}

                  <div>
                    <span>{t.usedPlatform}</span>
                    <strong>
                      {selectedPlatformLabel}
                    </strong>
                  </div>

                  <div>
                    <span>{t.usedViews}</span>
                    <strong>
                      {parseCountInput(
                        averageViews
                      ).toLocaleString(
                        language === "tr"
                          ? "tr-TR"
                          : "en-US"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>{t.usedEngagement}</span>
                    <strong>
                      %{parsePercentageInput(
                        engagementRate
                      ).toLocaleString(
                        language === "tr"
                          ? "tr-TR"
                          : "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.selectedContentType}
                    </span>
                    <strong>
                      {selectedContentLabel}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.calculationDivider
                    }
                  />

                  <div>
                    <span>
                      {t.basePerformanceValue}
                    </span>
                    <strong>
                      {formatCurrency(
                        pricingResult.factors
                          .baseValue
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.engagementFactor}
                    </span>
                    <strong>
                      Ã—
                      {pricingResult.factors
                        .engagementMultiplier.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.quantityFactor}
                    </span>
                    <strong>
                      Ã—
                      {pricingResult.factors
                        .quantityMultiplier.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.deliveryFactor}
                    </span>
                    <strong>
                      Ã—
                      {pricingResult.factors
                        .deliveryMultiplier.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t.rightsFactor}
                    </span>
                    <strong>
                      Ã—
                      {pricingResult.factors
                        .rightsMultiplier.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </strong>
                  </div>
                </div>
              </>
            )}

            <div className={styles.factorBox}>
              <h3>{t.factorsTitle}</h3>

              {[
                t.factorOne,
                t.factorTwo,
                t.factorThree,
                t.factorFour,
              ].map((factor) => (
                <div key={factor}>
                  <CheckIcon />
                  <span>{factor}</span>
                </div>
              ))}
            </div>

            <p className={styles.notice}>
              {t.notice}
            </p>
          </aside>
        </section>
        )}
        {activeTab === "analyse" && (
          <section className={styles.workspaceGrid}>
            <div className={styles.formCard}>
              <div className={styles.cardHeading}>
                <span>
                  <DocumentIcon />
                </span>

                <div>
                  <h2>
                    {language === "tr"
                      ? "Marka teklifini analiz et"
                      : "Analyse the brand offer"}
                  </h2>

                  <p>
                    {language === "tr"
                      ? "Markadan gelen teklif metnini ve ticari ÅŸartlarÄ± gir. Sistem teklifi mevcut fiyat sonucunla karÅŸÄ±laÅŸtÄ±racak."
                      : "Enter the brand offer and commercial terms. The system will compare it with your existing pricing result."}
                  </p>
                </div>
              </div>

              {!pricingResult && (
                <div className={styles.offerPriceWarning}>
                  <strong>
                    {language === "tr"
                      ? "Ã–nce fiyatÄ±nÄ± hesapla"
                      : "Calculate your price first"}
                  </strong>

                  <p>
                    {language === "tr"
                      ? "Teklifi deÄŸerlendirebilmek iÃ§in Fiyat Hesapla sekmesinde gÃ¼ncel bir fiyat sonucu oluÅŸturmalÄ±sÄ±n."
                      : "Create a current pricing result in the Calculate Price tab before analysing an offer."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab("price")
                    }
                  >
                    {language === "tr"
                      ? "Fiyat Hesapla sekmesine git"
                      : "Go to Calculate Price"}
                  </button>
                </div>
              )}

              {pricingResult && (
                <div className={styles.offerReferenceStrip}>
                  <div>
                    <span>
                      {language === "tr"
                        ? "Minimum"
                        : "Minimum"}
                    </span>

                    <strong>
                      {formatCurrency(
                        pricingResult.minimumPrice
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {language === "tr"
                        ? "Ã–nerilen"
                        : "Recommended"}
                    </span>

                    <strong>
                      {formatCurrency(
                        pricingResult.recommendedOffer
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {language === "tr"
                        ? "Ãœst sÄ±nÄ±r"
                        : "Ceiling"}
                    </span>

                    <strong>
                      {formatCurrency(
                        pricingResult.premiumPrice
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className={styles.offerForm}>
                <div className={styles.offerInputGrid}>
                  <label>
                    <span>
                      {language === "tr"
                        ? "Marka adÄ±"
                        : "Brand name"}
                    </span>

                    <input
                      type="text"
                      value={offerBrandName}
                      placeholder={
                        language === "tr"
                          ? "Ã–rn. ForumFenomen"
                          : "Example: ForumFenomen"
                      }
                      onChange={(event) => {
                        setOfferBrandName(
                          event.target.value
                        );
                        setOfferAnalysisResult(null);
                      }}
                    />
                  </label>

                  <label>
                    <span>
                      {language === "tr"
                        ? "Teklif edilen Ã¼cret"
                        : "Offered fee"}
                    </span>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={offeredPrice}
                      placeholder={
                        language === "tr"
                          ? "Ã–rn. 5.000"
                          : "Example: 5,000"
                      }
                      onChange={(event) => {
                        setOfferedPrice(
                          event.target.value
                        );
                        setOfferAnalysisResult(null);
                      }}
                    />
                  </label>
                </div>

                <label className={styles.offerTextField}>
                  <span>
                    {language === "tr"
                      ? "Markadan gelen teklif metni"
                      : "Brand offer text"}
                  </span>

                  <textarea
                    value={offerText}
                    rows={8}
                    placeholder={
                      language === "tr"
                        ? "MarkanÄ±n gÃ¶nderdiÄŸi e-posta veya mesajÄ± buraya yapÄ±ÅŸtÄ±r..."
                        : "Paste the email or message received from the brand..."
                    }
                    onChange={(event) => {
                      setOfferText(
                        event.target.value
                      );
                      setOfferAnalysisResult(null);
                    }}
                  />
                </label>

                <div className={styles.offerInputGridThree}>
                  <label>
                    <span>
                      {language === "tr"
                        ? "Ã–deme sÃ¼resi"
                        : "Payment term"}
                    </span>

                    <div className={styles.offerInputSuffix}>
                      <input
                        type="number"
                        min="0"
                        value={offerPaymentDays}
                        placeholder="30"
                        onChange={(event) => {
                          setOfferPaymentDays(
                            event.target.value
                          );
                          setOfferAnalysisResult(null);
                        }}
                      />

                      <small>
                        {language === "tr"
                          ? "gÃ¼n"
                          : "days"}
                      </small>
                    </div>
                  </label>

                  <label>
                    <span>
                      {language === "tr"
                        ? "Revizyon sÄ±nÄ±rÄ±"
                        : "Revision limit"}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={offerRevisionCount}
                      placeholder="2"
                      onChange={(event) => {
                        setOfferRevisionCount(
                          event.target.value
                        );
                        setOfferAnalysisResult(null);
                      }}
                    />
                  </label>

                  <label>
                    <span>
                      {language === "tr"
                        ? "KullanÄ±m sÃ¼resi"
                        : "Usage duration"}
                    </span>

                    <div className={styles.offerInputSuffix}>
                      <input
                        type="number"
                        min="0"
                        value={offerUsageMonths}
                        placeholder="3"
                        onChange={(event) => {
                          setOfferUsageMonths(
                            event.target.value
                          );
                          setOfferAnalysisResult(null);
                        }}
                      />

                      <small>
                        {language === "tr"
                          ? "ay"
                          : "months"}
                      </small>
                    </div>
                  </label>
                </div>

                <div className={styles.offerRightsSection}>
                  <span>
                    {language === "tr"
                      ? "Teklifte aÃ§Ä±kÃ§a istenen haklar"
                      : "Rights explicitly requested"}
                  </span>

                  <div className={styles.usageGrid}>
                    {[
                      {
                        id: "ads" as const,
                        label:
                          language === "tr"
                            ? "Reklamlarda kullanÄ±m"
                            : "Paid advertising usage",
                      },
                      {
                        id: "raw" as const,
                        label:
                          language === "tr"
                            ? "Ham gÃ¶rÃ¼ntÃ¼ teslimi"
                            : "Raw footage delivery",
                      },
                      {
                        id: "exclusivity" as const,
                        label:
                          language === "tr"
                            ? "Rakip marka kÄ±sÄ±tlamasÄ±"
                            : "Competitor exclusivity",
                      },
                    ].map((right) => {
                      const selected =
                        offerRights[right.id];

                      return (
                        <button
                          key={right.id}
                          type="button"
                          className={
                            selected
                              ? styles.selectedUsage
                              : ""
                          }
                          onClick={() =>
                            toggleOfferRight(
                              right.id
                            )
                          }
                        >
                          <span className={styles.checkbox}>
                            {selected && <CheckIcon />}
                          </span>

                          {right.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.calculateButton}
                  onClick={calculateOfferAnalysis}
                >
                  <SparkleIcon />

                  {language === "tr"
                    ? "Teklifi analiz et"
                    : "Analyse offer"}
                </button>

                {offerAnalysisError && (
                  <p className={styles.pricingError}>
                    {offerAnalysisError}
                  </p>
                )}
              </div>
            </div>

            <aside className={styles.previewCard}>
              <div className={styles.previewTop}>
                <span>
                  {language === "tr"
                    ? "TEKLÄ°F SONUCU"
                    : "OFFER RESULT"}
                </span>

                <div
                  className={
                    offerAnalysisResult
                      ? `${styles.previewPulse} ${styles.previewReady}`
                      : styles.previewPulse
                  }
                >
                  <i />

                  {offerAnalysisResult
                    ? language === "tr"
                      ? "ANALÄ°Z EDÄ°LDÄ°"
                      : "ANALYSED"
                    : language === "tr"
                      ? "FORM BEKLENÄ°YOR"
                      : "WAITING FOR FORM"}
                </div>
              </div>

              {!offerAnalysisResult && (
                <>
                  <div className={styles.previewIntro}>
                    <h2>
                      {language === "tr"
                        ? "Teklif deÄŸerlendirmesi"
                        : "Offer assessment"}
                    </h2>

                    <p>
                      {language === "tr"
                        ? "Form tamamlandÄ±ÄŸÄ±nda fiyat seviyesi, riskler ve Ã¶nerilen karÅŸÄ± teklif burada gÃ¶sterilecek."
                        : "The price level, risks and recommended counteroffer will appear here after completing the form."}
                    </p>
                  </div>

                  <div className={styles.factorBox}>
                    <h3>
                      {language === "tr"
                        ? "Analiz edilecek baÅŸlÄ±klar"
                        : "Terms to analyse"}
                    </h3>

                    {[
                      language === "tr"
                        ? "Teklif edilen Ã¼cret"
                        : "Offered fee",
                      language === "tr"
                        ? "KullanÄ±m haklarÄ±"
                        : "Usage rights",
                      language === "tr"
                        ? "Ã–deme ve revizyon ÅŸartlarÄ±"
                        : "Payment and revision terms",
                      language === "tr"
                        ? "Eksik veya riskli maddeler"
                        : "Missing or risky terms",
                    ].map((item) => (
                      <div key={item}>
                        <CheckIcon />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {offerAnalysisResult && pricingResult && (
                <>
                  <div
                    className={`${styles.offerStatusCard} ${
                      styles[
                        `offerStatus${offerAnalysisResult.status
                          .charAt(0)
                          .toUpperCase()}${offerAnalysisResult.status.slice(
                          1
                        )}`
                      ]
                    }`}
                  >
                    <span>
                      {language === "tr"
                        ? "Teklif kararÄ±"
                        : "Offer decision"}
                    </span>

                    <h2>
                      {offerAnalysisResult.status === "strong"
                        ? language === "tr"
                          ? "GÃ¼Ã§lÃ¼ teklif"
                          : "Strong offer"
                        : offerAnalysisResult.status ===
                            "acceptable"
                          ? language === "tr"
                            ? "Kabul edilebilir"
                            : "Acceptable"
                          : offerAnalysisResult.status ===
                              "negotiate"
                            ? language === "tr"
                              ? "PazarlÄ±k gerekli"
                              : "Negotiation required"
                            : language === "tr"
                              ? "Minimumun altÄ±nda"
                              : "Below minimum"}
                    </h2>

                    <strong>
                      {offerAnalysisResult.score}/100
                    </strong>
                  </div>

                  <div className={styles.pricePreview}>
                    <article>
                      <span>
                        {language === "tr"
                          ? "Marka teklifi"
                          : "Brand offer"}
                      </span>

                      <strong>
                        {formatCurrency(
                          parseCountInput(
                            offeredPrice
                          )
                        )}
                      </strong>
                    </article>

                    <article>
                      <span>
                        {language === "tr"
                          ? "ForumFenomen minimumu"
                          : "ForumFenomen minimum"}
                      </span>

                      <strong>
                        {formatCurrency(
                          pricingResult.minimumPrice
                        )}
                      </strong>
                    </article>

                    <article>
                      <span>
                        {language === "tr"
                          ? "Ã–nerilen profesyonel fiyat"
                          : "Recommended professional price"}
                      </span>

                      <strong>
                        {formatCurrency(
                          pricingResult.recommendedOffer
                        )}
                      </strong>
                    </article>

                    <article
                      className={
                        styles.recommendedPriceCard
                      }
                    >
                      <span>
                        {language === "tr"
                          ? "Ã–nerilen karÅŸÄ± teklif"
                          : "Recommended counteroffer"}
                      </span>

                      <strong>
                        {formatCurrency(
                          offerAnalysisResult
                            .recommendedCounterOffer
                        )}
                      </strong>
                    </article>
                  </div>

                  <div className={styles.offerDifferenceCard}>
                    <span>
                      {language === "tr"
                        ? "Ã–nerilen fiyata gÃ¶re fark"
                        : "Difference from recommendation"}
                    </span>

                    <strong>
                      {offerAnalysisResult.priceDifference >
                      0
                        ? "+"
                        : ""}
                      {formatCurrency(
                        offerAnalysisResult
                          .priceDifference
                      )}
                    </strong>

                    <small>
                      %
                      {offerAnalysisResult
                        .priceDifferencePercent.toLocaleString(
                          language === "tr"
                            ? "tr-TR"
                            : "en-US"
                        )}
                    </small>
                  </div>

                  {offerAnalysisResult.risks.length >
                    0 && (
                    <div className={styles.offerResultGroup}>
                      <h3>
                        {language === "tr"
                          ? "Riskli maddeler"
                          : "Risky terms"}
                      </h3>

                      {offerAnalysisResult.risks.map(
                        (risk) => (
                          <div key={risk}>
                            <span
                              className={
                                styles.offerRiskMarker
                              }
                            >
                              !
                            </span>

                            <span>
                              {risk === "perpetual_usage"
                                ? language === "tr"
                                  ? "SÃ¼resiz kullanÄ±m hakkÄ± talep ediliyor."
                                  : "Perpetual usage rights are requested."
                                : risk ===
                                    "unlimited_revision"
                                  ? language === "tr"
                                    ? "SÄ±nÄ±rsÄ±z revizyon talebi bulunuyor."
                                    : "Unlimited revisions are requested."
                                  : risk ===
                                      "product_only_offer"
                                    ? language === "tr"
                                      ? "Teklif yalnÄ±zca Ã¼rÃ¼n karÅŸÄ±lÄ±ÄŸÄ± olabilir."
                                      : "The offer may be product-only."
                                    : risk ===
                                        "performance_guarantee"
                                      ? language === "tr"
                                        ? "Performans garantisi talep ediliyor."
                                        : "A performance guarantee is requested."
                                      : risk ===
                                          "multi_platform_usage"
                                        ? language === "tr"
                                          ? "Birden fazla platformda kullanÄ±m talep ediliyor."
                                          : "Multi-platform usage is requested."
                                        : risk ===
                                            "undisclosed_paid_ads"
                                          ? language === "tr"
                                            ? "Metinde reklam kullanÄ±mÄ± var ancak formda belirtilmedi."
                                            : "Paid advertising appears in the text but was not selected."
                                          : risk ===
                                              "undisclosed_raw_files"
                                            ? language === "tr"
                                              ? "Metinde ham gÃ¶rÃ¼ntÃ¼ talebi var ancak formda belirtilmedi."
                                              : "Raw footage appears in the text but was not selected."
                                            : risk ===
                                                "undisclosed_exclusivity"
                                              ? language === "tr"
                                                ? "Metinde mÃ¼nhasÄ±rlÄ±k var ancak formda belirtilmedi."
                                                : "Exclusivity appears in the text but was not selected."
                                              : language === "tr"
                                                ? "Teklif ForumFenomen minimum fiyatÄ±nÄ±n altÄ±nda."
                                                : "The offer is below the ForumFenomen minimum price."}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {offerAnalysisResult.missingTerms
                    .length > 0 && (
                    <div className={styles.offerResultGroup}>
                      <h3>
                        {language === "tr"
                          ? "Eksik ÅŸartlar"
                          : "Missing terms"}
                      </h3>

                      {offerAnalysisResult.missingTerms.map(
                        (term) => (
                          <div key={term}>
                            <span
                              className={
                                styles.offerMissingMarker
                              }
                            >
                              ?
                            </span>

                            <span>
                              {term === "payment_term"
                                ? language === "tr"
                                  ? "Ã–deme sÃ¼resi belirtilmemiÅŸ."
                                  : "Payment term is not specified."
                                : term ===
                                    "usage_duration"
                                  ? language === "tr"
                                    ? "KullanÄ±m sÃ¼resi belirtilmemiÅŸ."
                                    : "Usage duration is not specified."
                                  : term ===
                                      "revision_limit"
                                    ? language === "tr"
                                      ? "Revizyon sÄ±nÄ±rÄ± belirtilmemiÅŸ."
                                      : "Revision limit is not specified."
                                    : language === "tr"
                                      ? "Teslim tarihi belirtilmemiÅŸ."
                                      : "Delivery date is not specified."}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {offerAnalysisResult.positiveTerms
                    .length > 0 && (
                    <div className={styles.offerResultGroup}>
                      <h3>
                        {language === "tr"
                          ? "Olumlu ÅŸartlar"
                          : "Positive terms"}
                      </h3>

                      {offerAnalysisResult.positiveTerms.map(
                        (term) => (
                          <div key={term}>
                            <CheckIcon />

                            <span>
                              {term ===
                              "price_above_premium"
                                ? language === "tr"
                                  ? "Teklif gÃ¼Ã§lÃ¼ pazarlÄ±k Ã¼st sÄ±nÄ±rÄ±nÄ±n Ã¼zerinde."
                                  : "The offer is above the strong negotiation ceiling."
                                : term ===
                                    "price_meets_recommendation"
                                  ? language === "tr"
                                    ? "Teklif Ã¶nerilen profesyonel fiyatÄ± karÅŸÄ±lÄ±yor."
                                    : "The offer meets the recommended professional price."
                                  : term ===
                                      "clear_payment_term"
                                    ? language === "tr"
                                      ? "Ã–deme sÃ¼resi aÃ§Ä±k ve makul."
                                      : "The payment term is clear and reasonable."
                                    : term ===
                                        "limited_usage_duration"
                                      ? language === "tr"
                                        ? "KullanÄ±m sÃ¼resi sÄ±nÄ±rlandÄ±rÄ±lmÄ±ÅŸ."
                                        : "The usage duration is limited."
                                      : language === "tr"
                                        ? "Revizyon sÄ±nÄ±rÄ± makul."
                                        : "The revision limit is reasonable."}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </>
              )}

              <p className={styles.notice}>
                {language === "tr"
                  ? "Bu analiz sÃ¶zleÅŸme veya hukuki danÄ±ÅŸmanlÄ±k yerine geÃ§mez; ticari karar desteÄŸi saÄŸlar."
                  : "This analysis provides commercial decision support and does not replace legal or contract advice."}
              </p>
            </aside>
          </section>
        )}
<ForumFooter />
      </div>

      <nav
        className="ff-bottom-nav"
        aria-label="ForumFenomen"
      >
        <Link href="/akis">
          <HomeIcon />
          <span>{t.home}</span>
        </Link>

        <Link href="/kategoriler">
          <GridIcon />
          <span>{t.categories}</span>
        </Link>

        <Link
          href="/konu-ac"
          className="ff-center-nav-button"
          aria-label={t.createTopic}
          title={t.createTopic}
        >
          <span className="ff-center-nav-glow" />

          <span className="ff-center-nav-image">
            <Image
              src="/forumfenomen-icon-256.png"
              alt=""
              fill
              sizes="70px"
              priority
            />
          </span>
        </Link>

        <Link href="/blog">
          <BlogIcon />
          <span>{t.blog}</span>
        </Link>

        <Link href="/profil">
          <UserIcon />
          <span>{t.profile}</span>
        </Link>
      </nav>
    </main>
  );
}
