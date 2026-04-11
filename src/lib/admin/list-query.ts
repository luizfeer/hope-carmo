/** Escapa `%`, `_` e `\` para uso seguro em `ilike` no PostgREST. */
export function escapeIlikePattern(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

export type StatusFilter = 'all' | 'published' | 'draft';
export type SortOrder = 'asc' | 'desc';

export const NEWS_SORT_FIELDS = [
  'published_at',
  'created_at',
  'title',
  'sort_order',
  'category',
] as const;
export type NewsSortField = (typeof NEWS_SORT_FIELDS)[number];

export const VIDEO_SORT_FIELDS = [
  'created_at',
  'title',
  'sort_order',
  'duration',
] as const;
export type VideoSortField = (typeof VIDEO_SORT_FIELDS)[number];

export const RESPONSE_SORT_FIELDS = ['created_at', 'series_slug'] as const;
export type ResponseSortField = (typeof RESPONSE_SORT_FIELDS)[number];

export function parseStatusFilter(v: string | undefined): StatusFilter {
  if (v === 'published' || v === 'draft') return v;
  return 'all';
}

export function parseSortOrder(v: string | undefined): SortOrder {
  return v === 'asc' ? 'asc' : 'desc';
}

export function parseNewsSort(v: string | undefined): NewsSortField {
  return NEWS_SORT_FIELDS.includes(v as NewsSortField)
    ? (v as NewsSortField)
    : 'published_at';
}

export function parseVideoSort(v: string | undefined): VideoSortField {
  return VIDEO_SORT_FIELDS.includes(v as VideoSortField)
    ? (v as VideoSortField)
    : 'created_at';
}

export function parseResponseSort(v: string | undefined): ResponseSortField {
  return RESPONSE_SORT_FIELDS.includes(v as ResponseSortField)
    ? (v as ResponseSortField)
    : 'created_at';
}
