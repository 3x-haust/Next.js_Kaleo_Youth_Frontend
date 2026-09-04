import type { Metadata } from 'next';
import Link from 'next/link';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { apiGetSafe } from '@/lib/api';
import { toText, type SearchParams } from '@/lib/search-params';
import { pageMetadata } from '@/lib/seo';
import type { PaginatedResult, Sermon } from '@/lib/types';
import {
  Empty,
  Eyebrow,
  Hero,
  Page,
  Search,
  Top,
} from './sermons.styled';
import { SermonArchive } from './SermonArchive';

export const metadata: Metadata = pageMetadata({
  title: '말씀',
  description: '수도교회 청소년부 주일 예배 말씀입니다.',
  path: '/sermons',
});
const EMPTY: PaginatedResult<Sermon> = { items: [], total: 0, page: 1, limit: 6, totalPages: 1 };
interface Props { searchParams: Promise<SearchParams>; }

export default async function SermonsPage({ searchParams }: Props) {
  const params = await searchParams;
  const keyword = toText(params.keyword);
  const result = await apiGetSafe<PaginatedResult<Sermon>>('/sermons', EMPTY, {
    query: { page: 1, limit: 6, keyword },
    revalidate: 60,
  });
  const visibleSermons = result.items;

  return (
    <Page>
      <Top>
        <Hero data-zone="archive-heading">
          <Eyebrow>MESSAGE</Eyebrow>
          <h1>하나님의<br />말씀을 듣습니다</h1>
        </Hero>
        <Search action="/sermons" method="get" role="search">
          <label htmlFor="sermon-keyword">말씀 검색</label>
          <input id="sermon-keyword" name="keyword" defaultValue={keyword} placeholder="제목, 설교자, 본문" />
          <button type="submit">검색</button>
        </Search>
      </Top>
      {visibleSermons.length > 0 ? (
        <SermonArchive
          key={keyword}
          initialResult={result}
          keyword={keyword}
        />
      ) : keyword ? (
        <Empty>
          <strong>검색 결과가 없습니다.</strong>
          <Link href="/sermons">전체 말씀 보기</Link>
        </Empty>
      ) : (
        <Empty>
          <strong>최근 말씀이 없습니다.</strong>
        </Empty>
      )}
      <PageUnderGlowClip>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </Page>
  );
}
