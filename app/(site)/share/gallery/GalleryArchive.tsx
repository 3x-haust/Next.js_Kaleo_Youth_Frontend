'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clientGet } from '@/lib/client-api';
import { formatDateRange, toFileUrl } from '@/lib/format';
import type { PaginatedResult, Post } from '@/lib/types';
import {
  Caption,
  Card,
  Grid,
  ImageCard,
  ImagePlaceholder,
  InfiniteStatus,
} from './gallery.styled';

interface Props {
  initialResult: PaginatedResult<Post>;
  keyword: string;
}

export function GalleryArchive({ initialResult, keyword }: Props) {
  const [posts, setPosts] = useState(initialResult.items);
  const [page, setPage] = useState(initialResult.page);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || page >= initialResult.totalPages) return;
    loadingRef.current = true;
    setLoading(true);
    setFailed(false);

    try {
      const query = new URLSearchParams({
        page: String(page + 1),
        limit: String(initialResult.limit),
        boardType: 'gallery',
      });
      if (keyword) query.set('keyword', keyword);
      const next = await clientGet<PaginatedResult<Post>>(
        `/posts?${query.toString()}`,
      );
      setPosts((current) => {
        const known = new Set(current.map((post) => post.id));
        return [...current, ...next.items.filter((post) => !known.has(post.id))];
      });
      setPage(next.page);
    } catch {
      setFailed(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [initialResult.limit, initialResult.totalPages, keyword, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || page >= initialResult.totalPages) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNext();
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [initialResult.totalPages, loadNext, page]);

  return (
    <>
      <Grid data-zone="gallery-grid">
        {posts.map((post, index) => {
          const formattedDate = formatDateRange(post.startDate, post.endDate);
          const thumbnail = post.thumbnailUrl
            ? toFileUrl(post.thumbnailUrl)
            : null;
          const cardNumber = index + 1;

          return (
            <Card
              key={post.id}
              href={`/share/gallery/${post.id}`}
              aria-label={`${post.title} ${formattedDate}`}
              data-gallery-card={cardNumber}
            >
              {thumbnail ? (
                <ImageCard
                  src={thumbnail}
                  alt=""
                  fill
                  sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 32px), (max-width: 1919px) 29vw, 554px"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  unoptimized
                />
              ) : (
                <ImagePlaceholder aria-hidden="true" />
              )}
              <Caption data-gallery-caption={cardNumber}>
                <h2 data-gallery-title={cardNumber}>{post.title}</h2>
                <time
                  data-gallery-date={cardNumber}
                  dateTime={post.startDate ?? undefined}
                >
                  {formattedDate}
                </time>
              </Caption>
            </Card>
          );
        })}
      </Grid>
      <InfiniteStatus
        ref={sentinelRef}
        data-infinite-sentinel="gallery"
        aria-live="polite"
      >
        {loading && '사진을 더 불러오는 중입니다.'}
        {failed && (
          <button type="button" onClick={() => void loadNext()}>
            다시 불러오기
          </button>
        )}
      </InfiniteStatus>
    </>
  );
}
