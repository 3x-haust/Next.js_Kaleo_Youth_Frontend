import type { MetadataRoute } from 'next';
import { apiGetSafe } from '@/lib/api';
import { siteUrl } from '@/lib/site';
import type { PaginatedResult, Post, Sermon, Setlist } from '@/lib/types';

const STATIC_PATHS = [
  '/',
  '/about',
  '/sermons',
  '/jteen',
  '/events',
  '/share/gallery',
  '/privacy',
];

const EMPTY = { items: [], total: 0, page: 1, limit: 100, totalPages: 1 };

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [sermons, setlists, posts] = await Promise.all([
    apiGetSafe<PaginatedResult<Sermon>>('/sermons', EMPTY, { query: { limit: 100 } }),
    apiGetSafe<PaginatedResult<Setlist>>('/setlists', EMPTY, { query: { limit: 100 } }),
    apiGetSafe<PaginatedResult<Post>>('/posts', EMPTY, { query: { limit: 100, boardType: 'gallery' } }),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${base}${path}`, lastModified: new Date() })),
    ...sermons.items.map((item) => ({
      url: `${base}/sermons/${item.id}`,
      lastModified: new Date(item.updatedAt),
    })),
    ...setlists.items.map((item) => ({
      url: `${base}/jteen/setlists/${item.id}`,
      lastModified: new Date(item.updatedAt),
    })),
    ...posts.items.map((item) => ({
      url: `${base}/share/gallery/${item.id}`,
      lastModified: new Date(item.updatedAt),
    })),
  ];
}
