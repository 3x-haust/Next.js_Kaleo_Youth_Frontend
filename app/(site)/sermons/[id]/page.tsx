import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ApiError, apiGet } from '@/lib/api';
import { YouTubeFacade } from '@/components/media/YouTubeFacade';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import { excerpt, toFileUrl, youtubeWatchUrl } from '@/lib/format';
import type { Sermon } from '@/lib/types';
import {
  BottomBack,
  DetailBack,
  DetailIntro,
  DetailPage,
  Eyebrow,
  Feature,
  FeatureDate,
  FeatureQuote,
  Quote,
  Recent,
  RecentCard,
  RecentGrid,
  RecentImage,
  RecentInner,
  Summary,
  Video,
  WatchLink,
} from '../sermons.styled';

interface Props { params: Promise<{ id: string }>; }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function authoredDate(value: string) {
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
async function load(id: string): Promise<Sermon | null> {
  if (!UUID.test(id)) return null;
  try { return await apiGet<Sermon>(`/sermons/${id}`, { revalidate: 60 }); }
  catch (error) { if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null; throw error; }
}
async function loadRecent(current: Sermon): Promise<Sermon[]> {
  const sermons = await apiGet<Sermon[]>('/sermons/latest', { revalidate: 60 });
  return sermons.filter((sermon) => sermon.id !== current.id).slice(0, 3);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sermon = await load((await params).id);
  if (!sermon) return { title: '말씀을 찾을 수 없습니다' };
  return { title: sermon.title, description: excerpt(sermon.summary, 120) || `${sermon.preacherName}의 말씀입니다.` };
}
export default async function SermonDetailPage({ params }: Props) {
  const sermon = await load((await params).id);
  if (!sermon) notFound();
  const recent = await loadRecent(sermon);
  const poster = toFileUrl(sermon.posterUrl ?? sermon.thumbnailUrl);
  return (
    <DetailPage>
      <DetailIntro><Eyebrow>SERMON</Eyebrow><h1>설교보기</h1></DetailIntro>
      <DetailBack href="/sermons">
        <svg aria-hidden viewBox="0 0 40 40" width="40" height="40">
          <path d="M32 20H8M17 11l-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        돌아가기
      </DetailBack>
      <Feature>
        {sermon.youtubeVideoId ? (
          <Video>
            <YouTubeFacade
              authoredPoster={Boolean(poster)}
              posterSrc={poster || undefined}
              videoId={sermon.youtubeVideoId}
              title={sermon.title}
            />
          </Video>
        ) : null}
        <FeatureDate dateTime={sermon.publishedAt}>{authoredDate(sermon.publishedAt)} · SUNDAY WORSHIP</FeatureDate>
        <h2>{sermon.title}</h2>
        <FeatureQuote>{sermon.bibleReference && <p>{sermon.bibleReference.replaceAll('-', '–')}</p>}<p>{sermon.preacherName}</p></FeatureQuote>
        {sermon.youtubeVideoId && <WatchLink href={youtubeWatchUrl(sermon.youtubeVideoId)} target="_blank" rel="noopener noreferrer">영상으로 보기 ↗</WatchLink>}
        {sermon.summary && <Summary>{sermon.summary}</Summary>}
      </Feature>
      <Recent aria-labelledby="recent-sermons-title">
        <RecentInner>
          <h2 id="recent-sermons-title">최근 설교 보기</h2>
          <RecentGrid>
          {recent.map((item, index) => (
            <RecentCard key={item.id} href={`/sermons/${item.id}`}>
              <RecentImage aria-hidden="true" data-recent-image={index + 1}>
                {toFileUrl(
                  item.recentThumbnailUrl ?? item.posterUrl ?? item.thumbnailUrl,
                ) ? (
                  <Image
                    src={toFileUrl(
                      item.recentThumbnailUrl ??
                        item.posterUrl ??
                        item.thumbnailUrl,
                    )}
                    alt=""
                    fill
                    sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 544px"
                  />
                ) : null}
              </RecentImage>
              <time dateTime={item.publishedAt}>{authoredDate(item.publishedAt)} · SUNDAY WORSHIP</time>
              <strong>{item.title}</strong>
              <Quote>
                {item.bibleReference && <span>{item.bibleReference.replaceAll('-', '–')}</span>}
                <span>{item.preacherName}</span>
              </Quote>
            </RecentCard>
          ))}
          </RecentGrid>
        </RecentInner>
      </Recent>
      <BottomBack href="/sermons" data-visual-extra>목록으로 돌아가기</BottomBack>
      <PageUnderGlowClip>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </DetailPage>
  );
}
