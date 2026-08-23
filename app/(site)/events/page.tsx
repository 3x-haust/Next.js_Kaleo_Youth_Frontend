import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/motion/Motion';
import { redirect } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { formatDateRange } from '@/lib/format';
import { toPage, toText, type SearchParams } from '@/lib/search-params';
import type { ChurchEvent, PaginatedResult } from '@/lib/types';
import { PageUnderGlow, PageUnderGlowClip } from '@/components/ui/primitives';
import {
  ClockIcon,
  Count,
  CurrentPage,
  DateBlock,
  DateContent,
  Empty,
  EventCard,
  EventCopy,
  EventFacts,
  EventList,
  Eyebrow,
  Filters,
  Hero,
  Page,
  Pagination,
  PinIcon,
} from './events.styled';

export const metadata: Metadata = { title: '일정', description: '수도교회 청소년부의 다가오는 일정입니다.' };
interface Props { searchParams: Promise<SearchParams>; }

function dateParts(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', weekday: 'short', timeZone: 'Asia/Seoul' }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { day: get('day'), month: get('month').toUpperCase(), weekday: get('weekday').toUpperCase() };
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = toPage(params.page);
  const keyword = toText(params.keyword);
  const result = await apiGet<PaginatedResult<ChurchEvent>>('/events', {
    query: { page, limit: 12, keyword, scope: 'upcoming' },
    revalidate: 60,
  });
  if (result.total > 0 && page > result.totalPages) {
    const query = new URLSearchParams();
    query.set('page', String(result.totalPages));
    if (keyword) query.set('keyword', keyword);
    redirect(`/events?${query.toString()}`);
  }
  const visibleEvents = result.items;
  const authoredFrame =
    page === 1 &&
    !keyword &&
    visibleEvents.length === 4;
  const authoredTimes = ['11:00 AM', '1:00 PM', '7:30 PM', '8:00 PM'] as const;
  const hero = { eyebrow: 'UPCOMING', title: '다가오는 일정', copy: 'Kaleo가 함께할 다음 일정을 확인하세요.' };
  return (
    <Page data-authored-frame={authoredFrame ? 'true' : undefined}>
      <Hero>
        <Eyebrow>{hero.eyebrow}</Eyebrow>
        <h1>{hero.title}</h1>
        <p>
          <span>{hero.copy}</span>
        </p>
      </Hero>

      {visibleEvents.length > 0 && <Count data-visual-extra>일정 {result.total || visibleEvents.length}개</Count>}
      {visibleEvents.length > 0 ? <>
        <EventList
          data-zone="event-list"
          aria-label="일정 목록"
        >
          {visibleEvents.map((event, index) => {
            const date = dateParts(event.startDate);
            return (
              <Reveal key={event.id} delay={index * 70}>
                <EventCard data-zone="event-card">
                  <DateBlock>
                    <DateContent>
                      <span>{date.month}</span>
                      <strong>{date.day}</strong>
                      <small>{date.weekday}</small>
                    </DateContent>
                  </DateBlock>
                  <EventCopy>
                    <small>{['WORSHIP', 'FELLOWSHIP', 'BIBLE STUDY', 'PRAYER'][index % 4]}</small>
                    <strong>{event.title}</strong>
                    <span>{event.description || formatDateRange(event.startDate, event.endDate)}</span>
                  </EventCopy>
                  <EventFacts data-zone="event-facts">
                    <span><ClockIcon src="/images/events/time.svg" alt="" width={36} height={36} aria-hidden /><span>{authoredFrame ? authoredTimes[index] : timeLabel(event.startDate)}</span></span>
                    {event.location && <span><PinIcon src="/images/events/location.svg" alt="" width={36} height={36} aria-hidden /><span>{event.location}</span></span>}
                  </EventFacts>
                </EventCard>
              </Reveal>
            );
          })}
        </EventList>
        {result.totalPages > 1 && <Pagination aria-label="페이지 이동">
          {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((number) => {
            const href = `/events?page=${number}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
            return number === result.page
              ? <CurrentPage key={number} href={href} aria-current="page">{number}</CurrentPage>
              : <Link key={number} href={href}>{number}</Link>;
          })}
        </Pagination>}
      </> : keyword ? <Empty><p>조건에 맞는 일정이 없습니다.</p><Link href="/events">예정된 일정 전체 보기</Link></Empty> : <Empty><p>예정된 일정이 없습니다.</p></Empty>}
      <Filters action="/events" method="get" data-visual-extra>
        <label htmlFor="event-keyword">일정 검색</label>
        <input id="event-keyword" name="keyword" defaultValue={keyword} placeholder="일정 이름·장소 검색" />
        <button type="submit">검색</button>
      </Filters>
      <PageUnderGlowClip>
        <PageUnderGlow aria-hidden="true" data-zone="page-under-glow" />
      </PageUnderGlowClip>
    </Page>
  );
}
