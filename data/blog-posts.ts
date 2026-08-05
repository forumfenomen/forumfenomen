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
  id: string;
  slug: string;
  category: BlogCategory;
  categoryLabel: string;
  title: BlogText;
  excerpt: BlogText;
  author: string;
  readMinutes: number;
  publishedAt: string;
  accent: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  isFeatured?: boolean;
};

export type BlogPlacement = {
  blogPostId: string;
  placementType:
    | "featured_main"
    | "featured_side"
    | "quick_learn"
    | "editor_pick";
  sortOrder: number;
};

const categoryAliases: Record<
  string,
  BlogCategory
> = {
  platformlar: "platforms",
  platform: "platforms",
  platforms: "platforms",
  "sosyal medya": "platforms",

  "içerik üretimi": "content",
  "icerik uretimi": "content",
  içerik: "content",
  content: "content",
  "yapay zekâ": "content",
  "yapay zeka": "content",

  büyüme: "growth",
  buyume: "growth",
  growth: "growth",

  "para kazanma": "money",
  monetization: "money",
  money: "money",

  eğitim: "education",
  egitim: "education",
  education: "education",

  yasal: "legal",
  "yasal mevzuat": "legal",
  hukuk: "legal",
  legal: "legal",
  /* Gerçek blog alt kategorileri */

  instagram: "platforms",
  ınstagram: "platforms",
  tiktok: "platforms",
  youtube: "platforms",

  "video edit": "content",
  "kamera & ekipman": "content",
  "thumbnail & kapak tasarımı": "content",

  seo: "growth",
  algoritmalar: "growth",
  "hashtag & anahtar kelimeler": "growth",
  "viral analizleri": "growth",

  "marka iş birlikleri": "money",
  ugc: "money",
  affiliate: "money",
  "youtube para kazanma": "money",
  "tiktok para kazanma": "money",

  "reklam kuralları": "legal",
  "vergi mevzuatı": "legal",
  sözleşmeler: "legal",
  "telif hakları": "legal",
};

export function mapDatabaseCategory(
  value: string | null | undefined
): BlogCategory {
  const normalized = (value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR");

  return (
    categoryAliases[normalized] ??
    "content"
  );
}