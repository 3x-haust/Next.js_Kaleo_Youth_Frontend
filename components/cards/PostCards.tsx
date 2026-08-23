'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { formatDateRange, toFileUrl } from '@/lib/format';
import type { Post } from '@/lib/types';
import { Card } from '../ui/primitives';

const GalleryWrap = styled(Card)`
  a {
    display: block;
  }
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.colors.bgSoft};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${GalleryWrap}:hover & img {
    transform: scale(1.04);
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

const GalleryBody = styled.div`
  padding: 14px 16px 16px;

  h3 {
    font-size: 15.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  div {
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.faint};
  }
`;

export function GalleryCard({ post }: { post: Post }) {
  const cover = post.thumbnailUrl ?? post.attachments?.[0]?.fileUrl ?? null;

  return (
    <GalleryWrap>
      <Link href={`/share/gallery/${post.id}`}>
        <Thumb>
          {cover ? (
            <Image
              src={toFileUrl(cover)}
              alt=""
              fill
              sizes="(max-width: 639px) calc(100vw - 32px), 400px"
            />
          ) : (
            <NoThumb>사진 없음</NoThumb>
          )}
        </Thumb>
        <GalleryBody>
          <h3>{post.title}</h3>
          <div>
            <span>{formatDateRange(post.startDate, post.endDate)}</span>
            {post.attachments?.length ? <span>사진 {post.attachments.length}장</span> : null}
          </div>
        </GalleryBody>
      </Link>
    </GalleryWrap>
  );
}
