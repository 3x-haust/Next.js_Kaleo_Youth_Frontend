'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clientGet } from '@/lib/client-api';
import { toFileUrl, youtubeThumbnail } from '@/lib/format';
import type { PaginatedResult, Sermon } from '@/lib/types';
import {
  Card,
  CardCopy,
  CardDate,
  CardTitle,
  Grid,
  InfiniteStatus,
  Quote,
  Thumbnail,
} from './sermons.styled';

interface Props {
  initialResult: PaginatedResult<Sermon>;
  keyword: string;
}

function dateLabel(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Seoul',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${get('day')} ${get('month').toUpperCase()} ${get('year')}`;
}

function SermonCard({
  sermon,
  eager,
}: {
  sermon: Sermon;
  eager: boolean;
}) {
  const image =
    toFileUrl(sermon.thumbnailUrl) ||
    (sermon.youtubeVideoId ? youtubeThumbnail(sermon.youtubeVideoId) : '');

  return (
    <Card href={`/sermons/${sermon.id}`} data-sermon-card>
      <Thumbnail>
        {image ? (
          <Image
            src={image}
            alt=""
            width={544}
            height={304}
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 544px"
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
          />
        ) : null}
      </Thumbnail>
      <CardCopy>
        <CardDate dateTime={sermon.publishedAt}>
          {dateLabel(sermon.publishedAt)} · SUNDAY WORSHIP
        </CardDate>
        <CardTitle>{sermon.title}</CardTitle>
        <Quote>
          {sermon.bibleReference && (
            <span>{sermon.bibleReference.replaceAll('-', '–')}</span>
          )}
          <span>{sermon.preacherName}</span>
        </Quote>
      </CardCopy>
    </Card>
  );
}

export function SermonArchive({ initialResult, keyword }: Props) {
  const [sermons, setSermons] = useState(initialResult.items);
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
      });
      if (keyword) query.set('keyword', keyword);
      const next = await clientGet<PaginatedResult<Sermon>>(
        `/sermons?${query.toString()}`,
      );
      setSermons((current) => {
        const known = new Set(current.map((sermon) => sermon.id));
        return [
          ...current,
          ...next.items.filter((sermon) => !known.has(sermon.id)),
        ];
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
      <Grid data-zone="sermon-archive-list" aria-label="말씀 목록">
        {sermons.map((sermon, index) => (
          <SermonCard key={sermon.id} sermon={sermon} eager={index === 0} />
        ))}
      </Grid>
      <InfiniteStatus
        ref={sentinelRef}
        data-infinite-sentinel="sermons"
        aria-live="polite"
      >
        {loading && '말씀을 더 불러오는 중입니다.'}
        {failed && (
          <button type="button" onClick={() => void loadNext()}>
            다시 불러오기
          </button>
        )}
      </InfiniteStatus>
    </>
  );
}
