import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SongList } from '@/components/jteen/SongList';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { ApiError, apiGet } from '@/lib/api';
import {
  formatDateDot,
  formatDateWithWeekday,
  formatFileSize,
  toFileUrl,
} from '@/lib/format';
import { SITE } from '@/lib/site';
import type { Setlist } from '@/lib/types';
import { Empty } from '@/styles/editorial.styled';
import {
  AttachmentCaption,
  AttachmentDownloads,
  AttachmentFigure,
  AttachmentHeading,
  AttachmentImage,
  AttachmentImageGrid,
  AttachmentSection,
  ChevronBtn,
  ChevronNav,
  DetailPage,
  Eyebrow,
  Hero,
  MetaQuote,
  Notice,
  Songs,
  SrOnly,
  Title,
} from '../setlist-detail.styled';

const SETLIST_ORDER = [
  '44444444-4444-4444-8444-444444444441',
  '44444444-4444-4444-8444-444444444442',
] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface Props {
  params: Promise<{ id: string }>;
}

async function load(id: string): Promise<Setlist | null> {
  if (!UUID.test(id)) return null;
  try {
    return await apiGet<Setlist>(`/setlists/${id}`, { revalidate: 60 });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const setlist = await load(id);
  if (!setlist) return { title: '콘티를 찾을 수 없습니다' };

  return {
    title: setlist.title,
    description: `${formatDateWithWeekday(setlist.serviceDate)} ${SITE.team.label} 찬양 콘티 (${setlist.songs.length}곡)`,
  };
}

export default async function SetlistDetailPage({ params }: Props) {
  const { id } = await params;
  const setlist = await load(id);
  if (!setlist) notFound();

  const currentIndex = SETLIST_ORDER.indexOf(id as (typeof SETLIST_ORDER)[number]);
  const hasNeighbor = currentIndex >= 0 && SETLIST_ORDER.length > 1;
  const prevId = hasNeighbor
    ? SETLIST_ORDER[(currentIndex - 1 + SETLIST_ORDER.length) % SETLIST_ORDER.length]
    : null;
  const nextId = hasNeighbor
    ? SETLIST_ORDER[(currentIndex + 1) % SETLIST_ORDER.length]
    : null;
  const attachments = setlist.attachments ?? [];
  const imageAttachments = attachments.filter(
    (attachment) => attachment.fileType?.startsWith('image/') ?? false,
  );
  const downloadAttachments = attachments.filter(
    (attachment) => !(attachment.fileType?.startsWith('image/') ?? false),
  );

  return (
    <DetailPage>
      <Hero>
        <Eyebrow>
          <span>SET LIST</span>
        </Eyebrow>
        <Title>
          <span>
            J-TEEN
            <br />
            WORSHIP
          </span>
        </Title>
        <ChevronNav>
          <ChevronBtn
            href={prevId ? `/jteen/setlists/${prevId}` : '#'}
            $disabled={!prevId}
            aria-label="이전 콘티"
          >
            <Image src="/images/icons/angle-left.svg" alt="" width={28} height={28} unoptimized />
          </ChevronBtn>
          <MetaQuote>
            <time dateTime={setlist.serviceDate}>{formatDateDot(setlist.serviceDate)}</time>
            {' '}&ndash;{' '}{setlist.title}
          </MetaQuote>
          <ChevronBtn
            href={nextId ? `/jteen/setlists/${nextId}` : '#'}
            $disabled={!nextId}
            aria-label="다음 콘티"
          >
            <Image src="/images/icons/angle-right.svg" alt="" width={28} height={28} unoptimized />
          </ChevronBtn>
        </ChevronNav>
        <SrOnly>
          {formatDateWithWeekday(setlist.serviceDate)}, {setlist.songs.length}곡
          {setlist.team?.name ? `, ${setlist.team.name}` : ''}
        </SrOnly>
      </Hero>

      {setlist.syncStatus === 'sync_failed' && (
        <Notice role="status">
          유튜브 플레이리스트와 마지막 동기화가 실패해 일부 정보가 최신이 아닐 수 있습니다.
        </Notice>
      )}

      {setlist.songs.length > 0 ? (
        <Songs>
          <SongList songs={setlist.songs} />
        </Songs>
      ) : (
        <Empty>
          <p>등록된 곡이 없습니다.</p>
        </Empty>
      )}

      {attachments.length > 0 ? (
        <AttachmentSection aria-labelledby="setlist-attachments-title">
          <AttachmentHeading id="setlist-attachments-title">콘티 이미지와 첨부 파일</AttachmentHeading>
          {imageAttachments.length > 0 ? (
            <AttachmentImageGrid>
              {imageAttachments.map((attachment, index) => (
                <AttachmentFigure key={attachment.id}>
                  <AttachmentImage
                    src={toFileUrl(attachment.fileUrl)}
                    alt={attachment.originalName ?? `${index + 1}번째 콘티 이미지`}
                    width={1600}
                    height={1200}
                    sizes="(max-width: 767px) 100vw, 50vw"
                    data-zone="setlist-attachment-image"
                  />
                  {attachment.originalName ? (
                    <AttachmentCaption>{attachment.originalName}</AttachmentCaption>
                  ) : null}
                </AttachmentFigure>
              ))}
            </AttachmentImageGrid>
          ) : null}
          {downloadAttachments.length > 0 ? (
            <AttachmentDownloads aria-label="콘티 첨부 파일">
              {downloadAttachments.map((attachment) => (
                <li key={attachment.id}>
                  <a
                    href={toFileUrl(attachment.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{attachment.originalName ?? '콘티 첨부 파일'} 내려받기</span>
                    <small>
                      {[attachment.fileType, formatFileSize(attachment.fileSize)]
                        .filter(Boolean)
                        .join(' · ')}
                    </small>
                  </a>
                </li>
              ))}
            </AttachmentDownloads>
          ) : null}
        </AttachmentSection>
      ) : null}

      <PageUnderGlowClip>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </DetailPage>
  );
}
