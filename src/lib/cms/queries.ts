import { createPublicClient } from '@/lib/supabase/public';
import type { NewsItem, VideoItem } from '@/types/cms';

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
