import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/motion/Motion';
import { PhotoGrid } from '@/components/share/PhotoGrid';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { ApiError, apiGet } from '@/lib/api';
import { excerpt, formatDateRange, toFileUrl } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import type { Post } from '@/lib/types';
import {
  BackLink,
  Description,
  Empty,
  GalleryContainer,
  Header,
  Page,
  SrOnly,
} from '../gallery-detail.styled';

interface Props {
  params: Promise<{ id: string }>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function load(id: string): Promise<Post | null> {
  if (!UUID.test(id)) return null;
  try {
    return await apiGet<Post>(`/posts/${id}`, { query: { view: 'public' } });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await load(id);
  if (!post) return { title: '앨범을 찾을 수 없습니다' };
  return pageMetadata({
    title: post.title,
    description:
      excerpt(post.content, 120) ||
      `${formatDateRange(post.startDate, post.endDate)} 수도교회 청소년부 갤러리`,
    path: `/share/gallery/${post.id}`,
    image:
      toFileUrl(post.thumbnailUrl ?? post.attachments?.[0]?.fileUrl) ||
      '/images/seo/home-share.png',
  });
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await load(id);
  if (!post || post.boardType !== 'gallery') notFound();

  const photos = (post.attachments ?? []).filter((attachment) =>
    (attachment.fileType ?? '').startsWith('image/'),
  );

  return (
    <Page>
      <Header>
        <time dateTime={post.startDate ?? undefined}>
          {formatDateRange(post.startDate, post.endDate)}
        </time>
        <h1>{post.title}</h1>
        <SrOnly>사진 {photos.length}장, 조회 {post.viewCount}</SrOnly>
      </Header>

      {post.content && <Description data-visual-extra>{post.content}</Description>}

      <GalleryContainer>
        <BackLink href="/share/gallery">
          <svg aria-hidden viewBox="0 0 40 40" width="40" height="40">
            <path d="M32 20H8M17 11l-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          돌아가기
        </BackLink>

        {photos.length > 0 ? (
          <Reveal threshold={0.08}>
            <PhotoGrid photos={photos} title={post.title} />
          </Reveal>
        ) : (
          <Empty>
            <p>등록된 사진이 없습니다.</p>
          </Empty>
        )}
      </GalleryContainer>
      <PageUnderGlowClip>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </Page>
  );
}
