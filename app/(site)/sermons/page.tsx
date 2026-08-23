import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { apiGetSafe } from '@/lib/api';
import { toFileUrl, youtubeThumbnail } from '@/lib/format';
import { toPage, toText, type SearchParams } from '@/lib/search-params';
import { SITE } from '@/lib/site';
import type { PaginatedResult, Sermon } from '@/lib/types';
import {
  Card,
  CardCopy,
  CardDate,
  CardTitle,
  CurrentPage,
  Empty,
  Eyebrow,
  Grid,
  Hero,
  HeroMeta,
  Page,
  Pagination,
  Quote,
  Search,
  Thumbnail,
} from './sermons.styled';

export const metadata: Metadata = { title: '말씀', description: '수도교회 청소년부 주일 예배 말씀입니다.' };
const EMPTY: PaginatedResult<Sermon> = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
interface Props { searchParams: Promise<SearchParams>; }

function pageNumbers(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function dateLabel(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Seoul' }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('day')} ${get('month').toUpperCase()} ${get('year')}`;
}

function SermonCard({ sermon }: { sermon: Sermon }) {
  const image =
    toFileUrl(sermon.thumbnailUrl)
    || (sermon.youtubeVideoId ? youtubeThumbnail(sermon.youtubeVideoId) : '');
  return (
    <Card href={`/sermons/${sermon.id}`}>
      <Thumbnail>
        {image ? (
          <Image
            src={image}
            alt=""
            width={544}
            height={304}
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 544px"
          />
        ) : null}
      </Thumbnail>
      <CardCopy>
        <CardDate dateTime={sermon.publishedAt}>{dateLabel(sermon.publishedAt)} · SUNDAY WORSHIP</CardDate>
        <CardTitle>{sermon.title}</CardTitle>
        <Quote>
          {sermon.bibleReference && <span>{sermon.bibleReference.replaceAll('-', '–')}</span>}
          <span>{sermon.preacherName}</span>
        </Quote>
      </CardCopy>
    </Card>
  );
}

export default async function SermonsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = toPage(params.page);
  const keyword = toText(params.keyword);
  const result = await apiGetSafe<PaginatedResult<Sermon>>('/sermons', EMPTY, {
    query: { page, limit: 20, keyword },
    revalidate: 60,
  });
  const visibleSermons = result.items;
  const authoredFrame = page === 1 && !keyword && visibleSermons.length === 9;
  return (
    <Page data-authored-frame={authoredFrame ? 'true' : undefined}>
      <Hero>
        <Eyebrow>MESSAGE</Eyebrow>
        <h1>하나님의<br />말씀을 듣습니다</h1>
        <HeroMeta data-zone="sermon-hero-meta"><span>2026.08.13 – 주일예배 찬양 콘티</span></HeroMeta>
      </Hero>
      {visibleSermons.length > 0 ? <>
        <Grid data-zone="sermon-archive-list" aria-label="말씀 목록">
          {visibleSermons.map((sermon) => <SermonCard key={sermon.id} sermon={sermon} />)}
        </Grid>
        {result.totalPages > 1 && <Pagination aria-label="페이지 이동">
          {pageNumbers(result.page, result.totalPages).map((number) => {
            const href = `/sermons?page=${number}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
            return number === result.page
              ? <CurrentPage key={number} href={href} aria-current="page">{number}</CurrentPage>
              : <Link key={number} href={href}>{number}</Link>;
          })}
        </Pagination>}
      </> : keyword ? <Empty><p>검색 결과가 없습니다.</p><p>검색어를 지우시면 전체 목록으로 돌아갑니다. <Link href="/sermons">전체 말씀 보기</Link></p></Empty> : <Empty><p>올린 말씀이 없습니다.</p><p>{SITE.worship.time}, {SITE.worship.place}에서 그 주 말씀을 들으실 수 있습니다.</p></Empty>}
      <Search action="/sermons" method="get" data-visual-extra>
        <label htmlFor="sermon-keyword">말씀 검색</label>
        <input id="sermon-keyword" name="keyword" defaultValue={keyword} placeholder="제목, 설교자, 본문" />
        <button type="submit">검색</button>
      </Search>
      <PageUnderGlowClip>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </Page>
  );
}
