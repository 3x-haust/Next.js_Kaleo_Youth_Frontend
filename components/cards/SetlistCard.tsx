'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { formatDateWithWeekday } from '@/lib/format';
import type { Setlist } from '@/lib/types';
import { Badge, Card } from '../ui/primitives';

const Wrap = styled(Card)`
  a {
    display: block;
    padding: 22px 24px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  time {
    font-size: 13.5px;
    color: ${({ theme }) => theme.colors.muted};
  }

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;

const Songs = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14.5px;
  color: ${({ theme }) => theme.colors.body};

  li {
    display: flex;
    gap: 9px;
    align-items: baseline;
    overflow: hidden;

    span:first-child {
      color: ${({ theme }) => theme.colors.faint};
      font-size: 12.5px;
      width: 16px;
      flex-shrink: 0;
    }

    span:nth-child(2) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      font-style: normal;
      color: ${({ theme }) => theme.colors.faint};
      font-size: 13px;
      flex-shrink: 0;
    }
  }
`;

const More = styled.p`
  margin-top: 10px;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.primarySoft};
  font-weight: 600;
`;

export function SetlistCard({ setlist }: { setlist: Setlist }) {
  const songs = setlist.songs ?? [];
  const preview = songs.slice(0, 4);

  return (
    <Wrap>
      <Link href={`/jteen/setlists/${setlist.id}`}>
        <header>
          <time dateTime={setlist.serviceDate}>
            {formatDateWithWeekday(setlist.serviceDate)}
          </time>
          {setlist.youtubePlaylistId ? <Badge $tone="primary">플레이리스트</Badge> : null}
          <Badge>{songs.length}곡</Badge>
        </header>
        <h3>{setlist.title}</h3>
        <Songs>
          {preview.map((song, index) => (
            <li key={song.id}>
              <span>{index + 1}</span>
              <span>{song.songTitle}</span>
              {song.artist ? <em>{song.artist}</em> : null}
            </li>
          ))}
        </Songs>
        {songs.length > preview.length ? (
          <More>외 {songs.length - preview.length}곡 →</More>
        ) : null}
      </Link>
    </Wrap>
  );
}
