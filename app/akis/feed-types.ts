export type Language = "tr" | "en";

export type Theme = "light" | "dark";

export type FeedFilter =
  | "latest"
  | "trends"
  | "community"
  | "following";

export type Post = {
  id?: string;
  icon: string;
  iconClass: string;
  toneClass?: string;
  titleTr: string;
  titleEn: string;
  categoryTr: string;
  categoryEn: string;
  author: string;
  timeTr: string;
  timeEn: string;
  comments: string;
  authorId?: string;
  createdAt?: string;
  commentCountValue?: number;
  viewCountValue?: number;
  likeCountValue?: number;
  saveCountValue?: number;
  views: string;
};

export type TopicRow = {
  id: string;
  author_id: string | null;
  content_profile_id: string | null;
  title: string;
  created_at: string;
  comment_count: number;
  view_count: number;

  categories: {
    id: number;
    slug: string;
    name: string;

    category_groups: {
      slug: string;
      name: string;
    } | null;
  } | null;

  profiles: {
    display_name: string | null;
    username: string | null;
  } | null;
};

export type FeedTopicMetricRow = {
  topic_id: string;
  like_count: number;
  save_count: number;
};