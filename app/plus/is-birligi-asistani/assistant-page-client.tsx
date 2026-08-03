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
    backToPlus: "Plus'a dön",
    plusTool: "FORUMFENOMEN PLUS ARACI",
    title: "İş Birliği Asistanı",
    description:
      "Marka iş birliklerinde fiyatını belirle, teklifleri analiz et ve profesyonel yanıtlarını hazırla.",
    priceTab: "Fiyat Hesapla",
    analyseTab: "Teklifi Analiz Et",
    replyTab: "Yanıt Hazırla",
    active: "AKTİF",
    soon: "YAKINDA",
    formTitle: "İş birliği detayları",
    accountAnalysisTitle: "Hesabını otomatik analiz et",
    accountAnalysisDescription:
      "Kullanıcı adını girerek erişilebilen herkese açık performans verilerini otomatik analiz et.",
    username: "Kullanıcı adı",
    usernamePlaceholder: "@kullaniciadi",
    analyseAccount: "Hesabı Analiz Et",
    connectAccount: "Hesabımı Bağla",
    manualEntry: "Manuel giriş",
    automaticAnalysis: "Otomatik analiz",
    analysisPreview: "Analiz sonucu burada görünecek",
    analysing: "Hesap analiz ediliyor...",
    accountFound: "Hesap bulundu",
    analysedContent: "Analiz edilen içerik",
    subscribers: "Abone",
    averageLikes: "Ortalama beğeni",
    averageComments: "Ortalama yorum",
    followerEngagement: "Takipçi bazlı etkileşim",
    viewEngagement: "İzlenme bazlı etkileşim",
    platformComingSoon:
      "Instagram ve TikTok otomatik analizi yakında kullanıma açılacak.",
    analysisFailed:
      "Hesap analizi sırasında bir sorun oluştu.",
    analysisPreviewDescription:
      "Takipçi, ortalama izlenme ve etkileşim verileri bulunabildiğinde form alanlarına aktarılacak.",
    publicDataNotice:
      "Kullanıcı adıyla yapılan analiz yalnızca erişilebilen herkese açık verilere dayanır.",
    formDescription:
      "Teklifin kapsamını gir. Hesaplama motoru tüm ayrıntıları birlikte değerlendirecek.",
    platform: "Platform",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    followers: "Takipçi sayısı",
    followersPlaceholder: "Örn. 25.000",
    averageViews: "Ortalama izlenme",
    averageViewsPlaceholder: "Örn. 18.500",
    engagement: "Etkileşim oranı",
    engagementPlaceholder: "Örn. %4,8",
    averageLikesPlaceholder: "Örn. 850",
    averageCommentsPlaceholder: "Örn. 42",
    followerBasedEngagement: "Abone bazlı etkileşim",
    viewBasedEngagement: "İzlenme bazlı etkileşim",
    manualEngagementCalculated:
      "Beğeni ve yorum verilerinden otomatik hesaplandı",
    enterManualPerformance:
      "Etkileşim oranını hesaplamak için ortalama beğeni ve yorum sayılarını gir.",
    engagementAutomatic:
      "YouTube son içeriklerinden otomatik hesaplandı",
    engagementEdited:
      "Otomatik değer kullanıcı tarafından düzenlendi",
    engagementManual:
      "Etkileşim oranını manuel olarak gir",
    contentType: "İçerik türü",
    reel: "Reels",
    story: "Story",
    post: "Gönderi",
    video: "Video",
    ugc: "UGC",
    tiktokVideo: "TikTok Video",
    adVideo: "Reklam Videosu",
    liveStream: "Canlı Yayın",
    shorts: "Shorts",
    longVideo: "Uzun Video",
    adIntegration: "Reklam Entegrasyonu",
    quantity: "İçerik adedi",
    delivery: "Teslim süresi",
    sevenDays: "7 gün",
    fourteenDays: "14 gün",
    thirtyDays: "30 gün",
    usageTitle: "Kullanım ve reklam hakları",
    organicOnly: "Sadece organik paylaşım",
    paidAds: "Reklamlarda kullanım",
    rawFiles: "Ham görüntü teslimi",
    exclusivity: "Rakip marka kısıtlaması",
    calculate: "Fiyat aralığını hesapla",
    previewLabel: "CANLI ÖNİZLEME",
    previewTitle: "Tahmini iş birliği değeri",
    previewDescription:
      "Bilgileri tamamladığında önerilen fiyat aralığın burada görünecek.",
    recommendedOffer: "Önerilen teklif",
    negotiationRange: "Pazarlık aralığı",
    minimumPrice: "Önerilen alt sınır",
    waiting: "Bilgiler bekleniyor",
    calculated: "Hesaplandı",
    completeRequiredFields:
      "Takipçi, ortalama izlenme ve etkileşim oranı alanlarını doldur.",
    confidence: "Tahmin güveni",
    confidenceLow: "Düşük",
    confidenceMedium: "Orta",
    confidenceHigh: "Yüksek",
    betaEstimate: "BETA TAHMİNİ",
    calculationDetails: "Hesaplama özeti",
    dataSource: "Veri kaynağı",
    automaticData: "Otomatik hesap analizi",
    manualData: "Manuel kullanıcı girişi",
    usedPlatform: "Platform",
    usedViews: "Ortalama izlenme",
    usedEngagement: "Etkileşim oranı",
    selectedContentType: "İçerik türü",
    basePerformanceValue: "Performans tabanı",
    engagementFactor: "Etkileşim katsayısı",
    quantityFactor: "İçerik adedi katsayısı",
    deliveryFactor: "Teslim süresi katsayısı",
    rightsFactor: "Kullanım hakkı katsayısı",
    resultOutdated:
      "Form değiştiği için fiyatı yeniden hesapla.",
    factorsTitle: "Hesaplamaya dahil edilenler",
    factorOne: "Takipçi ve ortalama izlenme ilişkisi",
    factorTwo: "İçerik üretim ve teslim kapsamı",
    factorThree: "Kullanım hakkı ve reklam süresi",
    factorFour: "Münhasırlık ve ham görüntü talepleri",
    notice:
      "Gösterilecek tutarlar kesin piyasa fiyatı değil, karar desteği sağlayan tahmini aralıklardır.",
    howTitle: "Asistan nasıl çalışacak?",
    howOneTitle: "Verilerini gir",
    howOneText:
      "Performansını ve markanın istediği içerikleri belirt.",
    howTwoTitle: "Kapsamı değerlendir",
    howTwoText:
      "Kullanım hakları, teslim süresi ve ek talepler hesaba katılır.",
    howThreeTitle: "Teklifini hazırla",
    howThreeText:
      "Fiyat aralığı ve pazarlık alt sınırı birlikte oluşturulur.",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    createTopic: "Konu Oluştur",
    blog: "Blog",
    profile: "Profil",
    changeTheme: "Temayı değiştir",
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
    subscribers: "Subscribers",
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
    followerBasedEngagement: "Subscriber-based engagement",
    viewBasedEngagement: "View-based engagement",
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
    recommendedOffer: "Suggested offer",
    negotiationRange: "Negotiation range",
    minimumPrice: "Suggested minimum",
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

  function updateManualYouTubeEngagement(
    nextLikes: string,
    nextComments: string,
    nextViews = averageViews
  ) {
    const parsedLikes =
      parseCountInput(nextLikes);

    const parsedComments =
      parseCountInput(nextComments);

    const parsedViews =
      parseCountInput(nextViews);

    const interactions =
      parsedLikes + parsedComments;

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

    const sourceAdjustedResult: PricingResult = {
      ...result,
      confidence:
        engagementSource === "automatic" &&
        analysisResult
          ? result.confidence
          : result.confidence === "high"
            ? "medium"
            : result.confidence,
    };

    setPricingResult(
      sourceAdjustedResult
    );

    setPricingError("");
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

  const manualFollowersValue =
    parseCountInput(followers);

  const manualViewsValue =
    parseCountInput(averageViews);

  const manualLikesValue =
    parseCountInput(manualAverageLikes);

  const manualCommentsValue =
    parseCountInput(manualAverageComments);

  const manualTotalInteractions =
    manualLikesValue + manualCommentsValue;

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
      enabled: false,
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

        <section className={styles.workspaceHero}>
          <div className={styles.heroGlow} />

          <Link
            href="/plus"
            className={styles.backLink}
          >
            <ArrowLeftIcon />
            {t.backToPlus}
          </Link>

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
                          : "—"}
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
                          : "—"}
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

                      setManualAverageLikes("");
                      setManualAverageComments("");
                      setEngagementRate("");
                      setAutomaticEngagementValue("");
                      setEngagementSource(null);
                      setAnalysisResult(null);
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

                        if (
                          engagementSource !==
                          "automatic"
                        ) {
                          updateManualYouTubeEngagement(
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

                        updateManualYouTubeEngagement(
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

                        updateManualYouTubeEngagement(
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
                        : "—"}
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
                        : "—"}
                    </strong>
                  </div>

                  <small
                    className={
                      manualViewEngagement !== null
                        ? styles.engagementAutomatic
                        : styles.engagementHint
                    }
                  >
                    {manualViewEngagement !== null
                      ? t.manualEngagementCalculated
                      : t.enterManualPerformance}
                  </small>
                </div>
              </>
            ) : (
              <div className={styles.inputGrid}>
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
                    onChange={(event) =>
                      setAverageViews(
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>{t.engagement}</span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={engagementRate}
                    placeholder={
                      t.engagementPlaceholder
                    }
                    onChange={(event) => {
                      const nextValue =
                        event.target.value;

                      setEngagementRate(nextValue);
                      setAutomaticEngagementValue("");
                      setEngagementSource(
                        nextValue.trim()
                          ? "manual"
                          : null
                      );
                    }}
                  />

                  <small
                    className={
                      engagementSource === "manual"
                        ? styles.engagementManual
                        : styles.engagementHint
                    }
                  >
                    {t.engagementManual}
                  </small>
                </label>
              </div>
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
              <article>
                <span>
                  {t.recommendedOffer}
                </span>
                <strong>
                  {pricingResult
                    ? formatCurrency(
                        pricingResult.recommendedOffer
                      )
                    : "— TL"}
                </strong>
              </article>

              <article>
                <span>
                  {t.negotiationRange}
                </span>
                <strong>
                  {pricingResult
                    ? `${formatCurrency(
                        pricingResult.negotiationLow
                      )} – ${formatCurrency(
                        pricingResult.negotiationHigh
                      )}`
                    : "— / — TL"}
                </strong>
              </article>

              <article>
                <span>{t.minimumPrice}</span>
                <strong>
                  {pricingResult
                    ? formatCurrency(
                        pricingResult.minimumPrice
                      )
                    : "— TL"}
                </strong>
              </article>
            </div>

            {pricingResult && (
              <>
                <div className={styles.confidenceCard}>
                  <span>{t.betaEstimate}</span>

                  <div>
                    <small>{t.confidence}</small>

                    <strong>
                      {pricingResult.confidence ===
                      "high"
                        ? t.confidenceHigh
                        : pricingResult.confidence ===
                            "medium"
                          ? t.confidenceMedium
                          : t.confidenceLow}
                    </strong>
                  </div>
                </div>

                <div className={styles.calculationSummary}>
                  <h3>{t.calculationDetails}</h3>

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
                      ×
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
                      ×
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
                      ×
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
                      ×
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
              src="/forumfenomen-icon-master.png"
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