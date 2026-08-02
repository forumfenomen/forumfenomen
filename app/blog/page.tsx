import { createClient } from "@/lib/supabase/server";

import BlogPageClient from "./blog-page-client";

import {
  mapDatabaseCategory,
  type BlogPlacement,
  type BlogPost,
} from "@/data/blog-posts";

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  content_profile_id: string | null;
  author_id: string | null;
  reading_time: number;
  is_featured: boolean;
  published_at: string;
};

type PlacementRow = {
  blog_post_id: string;
  placement_type:
  | "featured_main"
  | "featured_side"
  | "quick_learn"
  | "editor_pick";
  sort_order: number;
};

type NamedProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
};

const accentPalette = [
  "#e743d8",
  "#ff315c",
  "#f2b544",
  "#a758ff",
  "#4b77ff",
  "#34c89d",
  "#12b9ed",
  "#ef5f91",
];

function getAccent(index: number) {
  return accentPalette[
    index % accentPalette.length
  ];
}

function getProfileName(
  profile: NamedProfile | undefined
) {
  return (
    profile?.display_name?.trim() ||
    profile?.username?.replace(/^@/, "").trim() ||
    "ForumFenomen"
  );
}

export const revalidate = 60;

export default async function BlogPage() {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const {
    data: postData,
    error: postsError,
  } = await supabase
    .from("blog_posts")
    .select(`
      id,
      slug,
      title,
      excerpt,
      category,
      cover_image_url,
      cover_image_alt,
      content_profile_id,
      author_id,
      reading_time,
      is_featured,
      published_at
    `)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", {
      ascending: false,
    })
    .limit(100);

  if (postsError) {
    console.error(
      "Blog yazıları alınamadı:",
      postsError.message
    );
  }

  const rows =
    (postData ?? []) as BlogPostRow[];

  const postIds = rows.map((post) => post.id);

  const contentProfileIds = Array.from(
    new Set(
      rows
        .map(
          (post) => post.content_profile_id
        )
        .filter(
          (id): id is string => Boolean(id)
        )
    )
  );

  const staffProfileIds = Array.from(
    new Set(
      rows
        .map((post) => post.author_id)
        .filter(
          (id): id is string => Boolean(id)
        )
    )
  );

  const [
    placementsResult,
    contentProfilesResult,
    staffProfilesResult,
  ] = await Promise.all([
    postIds.length > 0
      ? supabase
        .from("blog_post_placements")
        .select(`
            blog_post_id,
            placement_type,
            sort_order
          `)
        .in("blog_post_id", postIds)
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        })
      : Promise.resolve({
        data: [],
        error: null,
      }),

    contentProfileIds.length > 0
      ? supabase
        .from("content_profiles")
        .select(`
            id,
            display_name,
            username
          `)
        .in("id", contentProfileIds)
      : Promise.resolve({
        data: [],
        error: null,
      }),

    staffProfileIds.length > 0
      ? supabase
        .from("profiles")
        .select(`
            id,
            display_name,
            username
          `)
        .in("id", staffProfileIds)
      : Promise.resolve({
        data: [],
        error: null,
      }),
  ]);

  if (placementsResult.error) {
    console.error(
      "Blog yerleşimleri alınamadı:",
      placementsResult.error.message
    );
  }

  if (contentProfilesResult.error) {
    console.error(
      "Blog içerik profilleri alınamadı:",
      contentProfilesResult.error.message
    );
  }

  if (staffProfilesResult.error) {
    console.error(
      "Blog yönetim yazarları alınamadı:",
      staffProfilesResult.error.message
    );
  }

  const contentProfiles = new Map(
    (
      (contentProfilesResult.data ??
        []) as NamedProfile[]
    ).map((profile) => [
      profile.id,
      profile,
    ])
  );

  const staffProfiles = new Map(
    (
      (staffProfilesResult.data ??
        []) as NamedProfile[]
    ).map((profile) => [
      profile.id,
      profile,
    ])
  );

  const posts: BlogPost[] = rows.map(
    (post, index) => {
      const contentProfile =
        post.content_profile_id
          ? contentProfiles.get(
            post.content_profile_id
          )
          : undefined;

      const staffProfile = post.author_id
        ? staffProfiles.get(post.author_id)
        : undefined;

      return {
        id: post.id,
        slug: post.slug,
        category: mapDatabaseCategory(
          post.category
        ),
        title: {
          tr: post.title,
          en: post.title,
        },
        excerpt: {
          tr: post.excerpt,
          en: post.excerpt,
        },
        author: getProfileName(
          contentProfile ?? staffProfile
        ),
        readMinutes:
          post.reading_time || 1,
        publishedAt: post.published_at,
        accent: getAccent(index),
        coverImageUrl:
          post.cover_image_url,
        coverImageAlt:
          post.cover_image_alt,
        isFeatured: post.is_featured,
      };
    }
  );

  const placements: BlogPlacement[] =
    (
      (placementsResult.data ??
        []) as PlacementRow[]
    ).map((placement) => ({
      blogPostId:
        placement.blog_post_id,
      placementType:
        placement.placement_type,
      sortOrder:
        placement.sort_order,
    }));

  return (
    <BlogPageClient
      posts={posts}
      placements={placements}
    />
  );
}