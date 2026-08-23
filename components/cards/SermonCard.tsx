'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { excerpt, formatDate, youtubeThumbnail } from '@/lib/format';
import type { Sermon } from '@/lib/types';
import { Badge, Card } from '../ui/primitives';

const Wrap = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.primaryTint};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NoThumb = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.faint};
  font-size: 13px;
`;

const PlayMark = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    margin-left: 3px;
    border-left: 13px solid #fff;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
  }
`;

const Body = styled.div`
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;

  h3 {
    font-size: 17px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

const Meta = styled.div`
  margin-top: auto;
  padding-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.faint};
`;

export function SermonCard({ sermon }: { sermon: Sermon }) {
  return (
    <Wrap>
      <Link href={`/sermons/${sermon.id}`}>
        <Thumb>
          {sermon.youtubeVideoId ? (
            <>
              <Image
                src={youtubeThumbnail(sermon.youtubeVideoId)}
                alt=""
                fill
                sizes="(max-width: 639px) calc(100vw - 32px), 400px"
              />
              <PlayMark aria-hidden />
            </>
          ) : (
            <NoThumb>영상 없음</NoThumb>
          )}
        </Thumb>
        <Body>
          <h3>{sermon.title}</h3>
          {sermon.summary ? <p>{excerpt(sermon.summary, 70)}</p> : null}
          <Meta>
            <Badge $tone="primary">{sermon.preacherName}</Badge>
            {sermon.bibleReference ? <span>{sermon.bibleReference}</span> : null}
            <span style={{ marginLeft: 'auto' }}>{formatDate(sermon.publishedAt)}</span>
          </Meta>
        </Body>
      </Link>
    </Wrap>
  );
}
