/**
 * Blog posts — shared with the mushroomidentifiers.com website via the same
 * Supabase project. The website publishes to `blog_posts`; the app reads
 * the same table so new posts appear automatically with zero deploys.
 */
import { supabase } from "./supabase";
import { config } from "./config";

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  region: string | null;
  risk_level: string | null;
  is_premium: boolean;
  author_name: string | null;
  author_role: string | null;
  read_time: number | null;
  published_at: string | null;
  views: number | null;
};

const LIST_COLS =
  "id,title,slug,excerpt,featured_image,category,region,risk_level,is_premium,author_name,read_time,published_at,views";

/** Latest published posts, newest first. Used by the home-screen preview. */
export async function fetchLatestPosts(limit = 5): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(LIST_COLS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

/** Paginated list for the dedicated /blog screen. */
export async function fetchPostsPage(opts: {
  page?: number;
  pageSize?: number;
  category?: string | null;
  search?: string | null;
}): Promise<{ rows: BlogPost[]; total: number }> {
  const { page = 0, pageSize = 20, category, search } = opts;
  let q = supabase
    .from("blog_posts")
    .select(LIST_COLS, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (category) q = q.eq("category", category);
  if (search && search.trim().length > 1) {
    const term = `%${search.trim()}%`;
    q = q.or(`title.ilike.${term},excerpt.ilike.${term}`);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  return { rows: (data ?? []) as BlogPost[], total: count ?? 0 };
}

/** Single post by slug — for the in-app reader. */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  // Slugs in the DB are stored with a leading "/" (e.g. "/poisonous-mushrooms-in-iowa-identification").
  // We accept either form from callers and normalise.
  const candidates = slug.startsWith("/") ? [slug, slug.replace(/^\//, "")] : [`/${slug}`, slug];
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .in("slug", candidates)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPost | null) ?? null;
}

/** Public URL on the website — used for "Read on web" / share links. */
export function webUrlForPost(post: Pick<BlogPost, "slug">): string {
  const path = post.slug.startsWith("/") ? post.slug : `/${post.slug}`;
  return `${config.website.url}/blog${path}`;
}
