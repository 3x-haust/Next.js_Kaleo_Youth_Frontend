import type { Metadata } from 'next';
import Link from 'next/link';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { apiGetSafe } from '@/lib/api';
import { formatDateRange, toFileUrl } from '@/lib/format';
import { toPage, toText, type SearchParams } from '@/lib/search-params';
import type { PaginatedResult, Post } from '@/lib/types';
import {
  ActivePage,
  AuthoredSpacer,
  Caption,
  Card,
  Count,
  Empty,
  Eyebrow,
  Grid,
  Header,
  ImageCard,
  ImagePlaceholder,
  Page,
  Pagination,
  Search,
  SrOnly,
  Title,
} from './gallery.styled';

export const metadata: Metadata = {
  title: '갤러리',
  description: '수도교회 청소년부의 예배와 일정 사진입니다.',
};

const EMPTY: PaginatedResult<Post> = { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function GalleryPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = toPage(params.page);
  const keyword = toText(params.keyword);
  const result = await apiGetSafe<PaginatedResult<Post>>('/posts', EMPTY, {
    query: { page, limit: 9, keyword, boardType: 'gallery' },
    revalidate: 60,
  });

  const hasFilter = !!keyword;
  const visiblePosts = result.items;
  const authoredFrame = page === 1 && !hasFilter && visiblePosts.length > 0;

  return (
    <Page data-authored-frame={authoredFrame ? 'true' : undefined}>
      <Header>
        <div>
          <Eyebrow>GALLERY</Eyebrow>
          <Title>
            우리의 이야기를
            <br />
            담았습니다
          </Title>
        </div>

        <Search action="/share/gallery" method="get" role="search" data-visual-extra>
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

      {visiblePosts.length > 0 && <Count data-visual-extra>앨범 {result.total || visiblePosts.length}개</Count>}
      {authoredFrame && <AuthoredSpacer aria-hidden="true" />}

      {visiblePosts.length > 0 ? (
        <>
          <Grid data-zone="gallery-grid">
            {visiblePosts.map((post, index) => {
              const formattedDate = formatDateRange(post.startDate, post.endDate);
              const thumbnail = post.thumbnailUrl ? toFileUrl(post.thumbnailUrl) : null;
              return (
                <Card
                  key={post.id}
                  href={`/share/gallery/${post.id}`}
                  aria-label={`${post.title} ${formattedDate}`}
                  data-gallery-card={index + 1}
                >
                  {thumbnail ? (
                    <ImageCard
                      src={thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 32px), (max-width: 1919px) 29vw, 554px"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                  ) : (
                    <ImagePlaceholder aria-hidden="true" />
                  )}
                  <Caption data-gallery-caption={index + 1}>
                    <h2 data-gallery-title={index + 1}>{post.title}</h2>
                    <time
                      data-gallery-date={index + 1}
                      dateTime={post.startDate ?? undefined}
                    >
                      {formattedDate}
                    </time>
                  </Caption>
                </Card>
              );
            })}
          </Grid>

          {result.totalPages > 1 && (
            <Pagination aria-label="페이지 이동">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
                const href = `/share/gallery?page=${p}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
                return p === result.page ? (
                  <ActivePage key={p} href={href} aria-current="page">
                    {p}
                  </ActivePage>
                ) : (
                  <Link key={p} href={href}>
                    {p}
                  </Link>
                );
              })}
            </Pagination>
          )}
        </>
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
