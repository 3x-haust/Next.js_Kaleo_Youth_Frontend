import type { MetadataRoute } from 'next';
import { apiGetSafe } from '@/lib/api';
import { siteUrl } from '@/lib/site';
import type { PaginatedResult, Post, Sermon, Setlist } from '@/lib/types';

const STATIC_PATHS = [
  '/',
  '/about',
  '/sermons',
  '/events',
  '/share/gallery',
  '/privacy',
];

const EMPTY = { items: [], total: 0, page: 1, limit: 100, totalPages: 1 };

export const revalidate = 3600;

async function allItems<T>(
  path: string,
  query?: Record<string, string | number>,
): Promise<T[]> {
  const first = await apiGetSafe<PaginatedResult<T>>(path, EMPTY, {
    query: { ...query, limit: 100, page: 1 },
  });
  if (first.totalPages <= 1) return first.items;
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      apiGetSafe<PaginatedResult<T>>(path, EMPTY, {
        query: { ...query, limit: 100, page: index + 2 },
      }),
    ),
  );
  return [first.items, ...rest.map((page) => page.items)].flat();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [sermons, setlists, posts] = await Promise.all([
    allItems<Sermon>('/sermons'),
    allItems<Setlist>('/setlists'),
    allItems<Post>('/posts', { boardType: 'gallery' }),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const,
      priority: path === '/' ? 1 : 0.7,
    })),
    ...sermons.map((item) => ({
      url: `${base}/sermons/${item.id}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...setlists.map((item) => ({
      url: `${base}/jteen/setlists/${item.id}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...posts.map((item) => ({
      url: `${base}/share/gallery/${item.id}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
