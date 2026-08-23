'use client';

import Image from 'next/image';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import { youtubeEmbedUrl, youtubeThumbnail } from '@/lib/format';

interface YouTubeFacadeProps {
  authoredPoster?: boolean;
  posterSrc?: string;
  title: string;
  videoId: string;
}

const Shade = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.72));
  transition: background-color 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Play = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(64px, 7vw, 104px);
  aspect-ratio: 1;
  padding-left: 6px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  font-size: clamp(22px, 2.4vw, 36px);
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Label = styled.span`
  position: absolute;
  right: 24px;
  bottom: 20px;
  color: #fff;
  font-size: var(--ky-meta);

  @media (max-width: 639px) {
    right: 16px;
    bottom: 12px;
  }
`;

const Facade = styled.button<{ $authored?: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;

  img {
    object-fit: cover;
  }

  &:hover ${Play}, &:focus-visible ${Play} {
    transform: scale(1.08);
    background: var(--ky-blue);
  }

  ${({ $authored }) =>
    $authored &&
    css`
      ${Shade}, ${Play}, ${Label} {
        display: none;
      }

      img {
        object-fit: fill;
      }

      @media (max-width: 900px) {
        ${Shade}, ${Play}, ${Label} {
          display: grid;
        }
      }
    `}
`;

export function YouTubeFacade({
  authoredPoster = false,
  posterSrc,
  title,
  videoId,
}: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        data-testid="youtube-player"
        src={`${youtubeEmbedUrl(videoId)}&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    );
  }

  return (
    <Facade
      type="button"
      $authored={authoredPoster}
      aria-label={`${title} 영상 재생`}
      onClick={() => setPlaying(true)}
    >
      <Image
        src={posterSrc ?? youtubeThumbnail(videoId)}
        alt=""
        fill
        sizes="(max-width: 900px) 100vw, (max-width: 1919px) 52vw, 1000px"
      />
      <Shade />
      <Play aria-hidden="true">▶</Play>
      <Label>사이트에서 영상 재생</Label>
    </Facade>
  );
}
