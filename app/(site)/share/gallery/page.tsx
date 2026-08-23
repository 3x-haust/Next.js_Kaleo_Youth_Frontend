import type { Metadata } from 'next';
import Link from 'next/link';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { apiGetSafe } from '@/lib/api';
import { toText, type SearchParams } from '@/lib/search-params';
import type { PaginatedResult, Post } from '@/lib/types';
import {
  Count,
  Empty,
  Eyebrow,
  Header,
  Page,
  Search,
  SrOnly,
  Title,
} from './gallery.styled';
import { GalleryArchive } from './GalleryArchive';

export const metadata: Metadata = {
  title: '갤러리',
  description: '수도교회 청소년부의 예배와 일정 사진입니다.',
};

const EMPTY: PaginatedResult<Post> = { items: [], total: 0, page: 1, limit: 6, totalPages: 1 };

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function GalleryPage({ searchParams }: Props) {
  const params = await searchParams;
  const keyword = toText(params.keyword);
  const result = await apiGetSafe<PaginatedResult<Post>>('/posts', EMPTY, {
    query: { page: 1, limit: 6, keyword, boardType: 'gallery' },
    revalidate: 60,
  });

  const hasFilter = !!keyword;
  const visiblePosts = result.items;

  return (
    <Page>
      <Header>
        <div>
          <Eyebrow>GALLERY</Eyebrow>
          <Title>
            우리의 이야기를
            <br />
            담았습니다
          </Title>
        </div>

        <Search action="/share/gallery" method="get" role="search">
          <SrOnly htmlFor="gallery-keyword">앨범 제목 검색</SrOnly>
          <input
            id="gallery-keyword"
            type="search"
            name="keyword"
            defaultValue={keyword}
            placeholder="앨범 제목 검색"
          />
          <button type="submit">검색</button>
        </Search>
      </Header>

      {visiblePosts.length > 0 && <Count>앨범 {result.total || visiblePosts.length}개</Count>}

      {visiblePosts.length > 0 ? (
        <GalleryArchive
          key={keyword}
          initialResult={result}
          keyword={keyword}
        />
      ) : (
        <Empty>
          <p>{hasFilter ? '검색 결과가 없습니다.' : '아직 등록된 사진이 없습니다.'}</p>
          {hasFilter && <Link href="/share/gallery">전체 갤러리 보기</Link>}
        </Empty>
      )}
      <PageUnderGlowClip>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </Page>
  );
}
