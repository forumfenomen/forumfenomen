import type { Language } from "./feed-types";

type FeedCopy = {
  heroStart: string;
  heroAccent: string;
  slogan: string;
  newTopic: string;
  featured: string;
  seeAll: string;
  search: string;
  trends: string;
  trendsCount: string;
  community: string;
  communityCount: string;
  following: string;
  followingCount: string;
  ad: string;
  adTitle: string;
  adText: string;
  advertise: string;
  home: string;
  categories: string;
  blog: string;
  profile: string;
  openTopic: string;
};

export const feedCopy: Record<
  Language,
  FeedCopy
> = {
  tr: {
    heroStart: "Keşfet, paylaş,",
    heroAccent: "konuş!",
    slogan:
      "Fikirler buluşur, fenomenler konuşur.",
    newTopic: "Yeni Konu Aç",
    featured: "Öne Çıkan Konular",
    seeAll: "Tümünü Gör",
    search:
      "Konu, kullanıcı veya kategori ara...",
    trends: "Güncel Trendler",
    trendsCount: "56 yeni konu",
    community: "Öne Çıkanlar",
    communityCount: "18 yeni konu",
    following: "Takip Ettiklerin",
    followingCount: "12 yeni konu",
    ad: "REKLAM",
    adTitle:
      "Markanızı ForumFenomen’de gösterin",
    adText:
      "Mobil ve masaüstü reklam alanı",
    advertise: "Reklam Ver",
    home: "Ana Sayfa",
    categories: "Kategoriler",
    blog: "Blog",
    profile: "Profil",
    openTopic: "Yeni konu aç",
  },

  en: {
    heroStart: "Discover, share,",
    heroAccent: "connect!",
    slogan:
      "Ideas meet, phenomena speak.",
    newTopic: "Create New Topic",
    featured: "Featured Topics",
    seeAll: "View All",
    search:
      "Search topics, users or categories...",
    trends: "Current Trends",
    trendsCount: "56 new topics",
    community: "Highlights",
    communityCount: "18 new topics",
    following: "Following",
    followingCount: "12 new topics",
    ad: "ADVERTISEMENT",
    adTitle:
      "Show your brand on ForumFenomen",
    adText:
      "Mobile and desktop advertising space",
    advertise: "Advertise",
    home: "Home",
    categories: "Categories",
    blog: "Blog",
    profile: "Profile",
    openTopic: "Create new topic",
  },
};