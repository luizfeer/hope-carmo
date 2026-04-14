export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  external_url: string | null;
  thumb_url: string | null;
  category: string;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type NewsComment = {
  id: string;
  news_id: string;
  user_id: string;
  body: string;
  author_name: string;
  author_avatar_url: string | null;
  created_at: string;
};

export type VideoItem = {
  id: string;
  title: string;
  video_url: string;
  thumb_url: string | null;
  duration: string | null;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
