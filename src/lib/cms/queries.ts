import { createPublicClient } from '@/lib/supabase/public';
import type { NewsComment, NewsItem, VideoItem } from '@/types/cms';

export async function getPublishedNews(): Promise<NewsItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getPublishedNews', error);
    return [];
  }
  return (data ?? []) as NewsItem[];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('getNewsBySlug', error);
    return null;
  }
  return data as NewsItem | null;
}

export async function getNewsComments(newsId: string): Promise<NewsComment[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('news_comments')
    .select(
      'id, news_id, user_id, body, author_name, author_avatar_url, created_at'
    )
    .eq('news_id', newsId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getNewsComments', error);
    return [];
  }
  return (data ?? []) as NewsComment[];
}

export async function getPublishedVideos(): Promise<VideoItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('video_items')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getPublishedVideos', error);
    return [];
  }
  return (data ?? []) as VideoItem[];
}
