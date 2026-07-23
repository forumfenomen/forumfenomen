export type BlogLanguage = "tr" | "en";

export type BlogCategory =
  | "platforms"
  | "content"
  | "growth"
  | "money"
  | "education"
  | "legal";

export type BlogText = {
  tr: string;
  en: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  category: BlogCategory;
  title: BlogText;
  excerpt: BlogText;
  author: string;
  readMinutes: number;
  publishedAt: string;
  accent: string;
  featured?: "main" | "side";
  quickRead?: boolean;
  editorPick?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "instagram-algoritmasi-2026",
    category: "platforms",
    title: {
      tr: "2026 Instagram Algoritması Nasıl Çalışıyor?",
      en: "How Does the 2026 Instagram Algorithm Work?",
    },
    excerpt: {
      tr: "Erişim düşüşlerinin nedenlerini ve hesabınızı yeniden büyütmek için uygulanabilecek yöntemleri inceliyoruz.",
      en: "We examine why reach declines and the practical methods you can use to grow your account again.",
    },
    author: "ForumFenomen",
    readMinutes: 9,
    publishedAt: "2026-07-20",
    accent: "#e743d8",
    featured: "main",
    editorPick: true,
  },
  {
    id: 2,
    slug: "youtube-shorts-100-bin-izlenme",
    category: "platforms",
    title: {
      tr: "YouTube Shorts ile İlk 100 Bin İzlenme",
      en: "Your First 100K Views with YouTube Shorts",
    },
    excerpt: {
      tr: "Kısa video içeriklerinde izlenme süresini artıran temel yöntemler.",
      en: "Core methods that improve retention in short-form video content.",
    },
    author: "Selin",
    readMinutes: 6,
    publishedAt: "2026-07-19",
    accent: "#ff315c",
    featured: "side",
  },
  {
    id: 3,
    slug: "marka-isbirligi-fiyatlandirma",
    category: "money",
    title: {
      tr: "Marka İş Birliği Fiyatı Nasıl Belirlenir?",
      en: "How Should You Price a Brand Collaboration?",
    },
    excerpt: {
      tr: "Takipçi sayısından daha önemli olan fiyatlandırma ölçütleri.",
      en: "The pricing metrics that matter more than follower count.",
    },
    author: "Merve",
    readMinutes: 7,
    publishedAt: "2026-07-18",
    accent: "#f2b544",
    featured: "side",
    editorPick: true,
  },
  {
    id: 4,
    slug: "yapay-zeka-icerik-takvimi",
    category: "content",
    title: {
      tr: "Yapay Zeka ile Bir Aylık İçerik Takvimi Hazırlama",
      en: "Create a One-Month Content Calendar with AI",
    },
    excerpt: {
      tr: "Fikir bulma, metin hazırlama ve içerik planlama sürecini tek sistemde birleştirin.",
      en: "Combine idea generation, writing and content planning in one workflow.",
    },
    author: "Emre",
    readMinutes: 8,
    publishedAt: "2026-07-17",
    accent: "#a758ff",
    editorPick: true,
  },
  {
    id: 5,
    slug: "thumbnail-tasarim-hatalari",
    category: "content",
    title: {
      tr: "YouTube Thumbnail Tasarımında Yapılan 7 Hata",
      en: "7 Common YouTube Thumbnail Design Mistakes",
    },
    excerpt: {
      tr: "Tıklanma oranını düşüren kapak tasarımı hataları ve düzeltme yolları.",
      en: "Thumbnail mistakes that reduce click-through rate and how to fix them.",
    },
    author: "Buse",
    readMinutes: 5,
    publishedAt: "2026-07-16",
    accent: "#4b77ff",
  },
  {
    id: 6,
    slug: "ugc-icerik-ureticileri-kazanc",
    category: "money",
    title: {
      tr: "UGC İçerik Üreticileri Ne Kadar Kazanıyor?",
      en: "How Much Do UGC Creators Earn?",
    },
    excerpt: {
      tr: "UGC fiyatlandırması, paket oluşturma ve marka görüşmelerinin temel noktaları.",
      en: "The essentials of UGC pricing, packages and brand negotiations.",
    },
    author: "Ece",
    readMinutes: 7,
    publishedAt: "2026-07-15",
    accent: "#34c89d",
  },
  {
    id: 7,
    slug: "affiliate-marketing-baslangic",
    category: "money",
    title: {
      tr: "Affiliate Marketing Başlangıç Rehberi",
      en: "Beginner's Guide to Affiliate Marketing",
    },
    excerpt: {
      tr: "Doğru ürün, doğru içerik ve sürdürülebilir gelir sistemi nasıl kurulur?",
      en: "How to build a sustainable income system with the right products and content.",
    },
    author: "Mark",
    readMinutes: 10,
    publishedAt: "2026-07-14",
    accent: "#12b9ed",
    editorPick: true,
  },
  {
    id: 8,
    slug: "influencer-reklam-kurallari",
    category: "legal",
    title: {
      tr: "Influencer Reklamlarında Dikkat Edilmesi Gerekenler",
      en: "What to Consider in Influencer Advertising",
    },
    excerpt: {
      tr: "Reklam etiketi, marka anlaşmaları ve tüketiciyi bilgilendirme yükümlülükleri.",
      en: "Advertising labels, brand agreements and consumer disclosure obligations.",
    },
    author: "Seda",
    readMinutes: 8,
    publishedAt: "2026-07-13",
    accent: "#ef5f91",
  },
  {
    id: 9,
    slug: "instagram-bio-seo",
    category: "growth",
    title: {
      tr: "Instagram Bio SEO Nedir?",
      en: "What Is Instagram Bio SEO?",
    },
    excerpt: {
      tr: "Profilinizin aramalarda daha kolay bulunmasını sağlayan küçük düzenlemeler.",
      en: "Small changes that help your profile appear more often in search.",
    },
    author: "Deniz",
    readMinutes: 3,
    publishedAt: "2026-07-12",
    accent: "#dd42e5",
    quickRead: true,
  },
  {
    id: 10,
    slug: "ugc-influencer-farki",
    category: "content",
    title: {
      tr: "UGC ile Influencer Arasındaki Fark",
      en: "The Difference Between UGC and Influencer Content",
    },
    excerpt: {
      tr: "İki içerik modelinin marka açısından farklarını kısa şekilde öğrenin.",
      en: "A quick look at how these two content models differ for brands.",
    },
    author: "Merve",
    readMinutes: 4,
    publishedAt: "2026-07-11",
    accent: "#6a72ff",
    quickRead: true,
  },
  {
    id: 11,
    slug: "telif-ihtari-ilk-adim",
    category: "legal",
    title: {
      tr: "Telif İhtarında İlk Yapılması Gereken",
      en: "The First Step After a Copyright Notice",
    },
    excerpt: {
      tr: "Panik yapmadan önce kontrol edilmesi gereken temel noktalar.",
      en: "The key points to check before taking action.",
    },
    author: "Ceren",
    readMinutes: 5,
    publishedAt: "2026-07-10",
    accent: "#f05d8f",
    quickRead: true,
  },
  {
    id: 12,
    slug: "viral-video-ilk-saniyeler",
    category: "growth",
    title: {
      tr: "Viral Videoların İlk 3 Saniyesi",
      en: "The First 3 Seconds of Viral Videos",
    },
    excerpt: {
      tr: "İzleyiciyi videoda tutan açılış biçimlerinin kısa analizi.",
      en: "A short analysis of openings that keep viewers watching.",
    },
    author: "Ali",
    readMinutes: 4,
    publishedAt: "2026-07-09",
    accent: "#37c99f",
    quickRead: true,
  },
];
