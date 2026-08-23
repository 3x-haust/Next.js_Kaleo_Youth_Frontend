'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { excerpt, formatDateRange, isUpcoming, toFileUrl } from '@/lib/format';
import type { ChurchEvent } from '@/lib/types';
import { Badge, Card } from '../ui/primitives';

const Wrap = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const Cover = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.bgSoft};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Body = styled.div`
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;

  h3 {
    font-size: 17.5px;
  }

  p {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.muted};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Facts = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 4px 10px;
  font-size: 13.5px;

  dt {
    color: ${({ theme }) => theme.colors.faint};
  }
  dd {
    margin: 0;
    color: ${({ theme }) => theme.colors.body};
  }
`;

export function EventCard({ event }: { event: ChurchEvent }) {
  const upcoming = isUpcoming(event.startDate, event.endDate);

  return (
    <Wrap>
      <Link href={`/events/${event.id}`}>
        {event.coverImageUrl ? (
          <Cover>
            <Image
              src={toFileUrl(event.coverImageUrl)}
              alt=""
              fill
              sizes="(max-width: 639px) calc(100vw - 32px), 400px"
            />
          </Cover>
        ) : null}
        <Body>
          <div>
            <Badge $tone={upcoming ? 'accent' : 'muted'}>{upcoming ? '예정' : '종료'}</Badge>
          </div>
          <h3>{event.title}</h3>
          <Facts>
            <dt>일정</dt>
            <dd>{formatDateRange(event.startDate, event.endDate)}</dd>
            {event.location ? (
              <>
                <dt>장소</dt>
                <dd>{event.location}</dd>
              </>
            ) : null}
          </Facts>
          {event.description ? <p>{excerpt(event.description, 80)}</p> : null}
        </Body>
      </Link>
    </Wrap>
  );
}
