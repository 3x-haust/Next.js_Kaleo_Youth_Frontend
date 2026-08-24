'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toFileUrl } from '@/lib/format';
import type { Attachment } from '@/lib/types';
import {
  ArrowLeft,
  ArrowRight,
  Backdrop,
  CloseButton,
  Counter,
  Gallery,
  Hero,
  Rail,
  RailArrow,
  ThumbButton,
  Thumbnails,
} from './PhotoGrid.styled';

const THUMBNAIL_WINDOW_SIZE = 4;

export function PhotoGrid({ photos, title }: { photos: Attachment[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const lightboxRef = useRef<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const selectPhoto = useCallback((next: number) => {
    setSelected(next);
  }, []);
  const revealPhoto = useCallback(
    (next: number) => {
      const maximumStart = Math.max(
        0,
        photos.length - THUMBNAIL_WINDOW_SIZE,
      );
      setWindowStart((current) => {
        if (next < current) return next;
        if (next >= current + THUMBNAIL_WINDOW_SIZE) {
          return Math.min(
            maximumStart,
            next - THUMBNAIL_WINDOW_SIZE + 1,
          );
        }
        return current;
      });
    },
    [photos.length],
  );
  const moveSelected = useCallback((delta: number) => {
    const next = Math.max(
      0,
      Math.min(photos.length - 1, selected + delta),
    );
    if (next === selected) return;
    selectPhoto(next);
    revealPhoto(next);
  }, [photos.length, revealPhoto, selected, selectPhoto]);
  const setLightboxPhoto = useCallback((next: number | null) => {
    lightboxRef.current = next;
    setLightbox(next);
  }, []);
  const close = useCallback(() => setLightboxPhoto(null), [setLightboxPhoto]);
  const moveLightbox = useCallback(
    (delta: number) => {
      const current = lightboxRef.current;
      if (current === null) return;
      const next = Math.max(
        0,
        Math.min(photos.length - 1, current + delta),
      );
      if (next === current) return;
      selectPhoto(next);
      revealPhoto(next);
      setLightboxPhoto(next);
    },
    [photos.length, revealPhoto, selectPhoto, setLightboxPhoto],
  );
  const lightboxOpen = lightbox !== null;
  const visiblePhotos = photos.slice(
    windowStart,
    windowStart + THUMBNAIL_WINDOW_SIZE,
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveLightbox(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveLightbox(1);
      }
      if (event.key === 'Tab') {
        const focusables = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])') ?? [],
        ).filter((element) => !element.hasAttribute('disabled'));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKey);
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [lightboxOpen, close, moveLightbox]);

  return (
    <Gallery>
      <Hero
        ref={openerRef}
        type="button"
        onClick={() => setLightboxPhoto(selected)}
        aria-label={`${title} ${selected + 1}번째 사진 크게 보기`}
      >
        <Image
          key={photos[selected].id}
          src={toFileUrl(photos[selected].fileUrl)}
          alt={`${title} ${selected + 1}번째 사진`}
          fill
          sizes="(max-width: 1919px) calc(100vw - 32px), 1720px"
          loading="eager"
          fetchPriority="high"
          unoptimized
        />
      </Hero>

      {photos.length > 1 && (
        <Rail>
          <RailArrow
            type="button"
            onClick={() => moveSelected(-1)}
            aria-label="이전 사진 선택"
            disabled={selected === 0}
          >
            <span aria-hidden="true">‹</span>
          </RailArrow>

          <Thumbnails aria-label="사진 선택">
            {visiblePhotos.map((photo, offset) => {
              const position = windowStart + offset;
              return (
              <li key={photo.id}>
                <ThumbButton
                  type="button"
                  $selected={position === selected}
                  onClick={() => selectPhoto(position)}
                  aria-label={`${position + 1}번째 사진 선택`}
                  aria-current={position === selected ? 'true' : undefined}
                >
                  <Image
                    src={toFileUrl(photo.fileUrl)}
                    alt=""
                    fill
                    sizes="(max-width: 639px) 20vw, (max-width: 1023px) 21vw, 360px"
                    loading="eager"
                    unoptimized
                  />
                </ThumbButton>
              </li>
              );
            })}
          </Thumbnails>

          <RailArrow
            type="button"
            onClick={() => moveSelected(1)}
            aria-label="다음 사진 선택"
            disabled={selected === photos.length - 1}
          >
            <span aria-hidden="true">›</span>
          </RailArrow>
        </Rail>
      )}

      {lightbox !== null ? (
        <Backdrop ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${title} 사진 크게 보기`} onClick={close}>
          <Image
            src={toFileUrl(photos[lightbox].fileUrl)}
            alt={`${title} ${lightbox + 1}번째 사진`}
            width={1720}
            height={960}
            sizes="100vw"
            unoptimized
            onClick={(event) => event.stopPropagation()}
          />
          <CloseButton type="button" onClick={close} aria-label="닫기" autoFocus>
            <span aria-hidden="true">×</span>
          </CloseButton>
          {photos.length > 1 ? (
            <>
              <ArrowLeft type="button" aria-label="이전 사진" disabled={lightbox === 0} onClick={(event) => { event.stopPropagation(); moveLightbox(-1); }}>
                <span aria-hidden="true">‹</span>
              </ArrowLeft>
              <ArrowRight type="button" aria-label="다음 사진" disabled={lightbox === photos.length - 1} onClick={(event) => { event.stopPropagation(); moveLightbox(1); }}>
                <span aria-hidden="true">›</span>
              </ArrowRight>
            </>
          ) : null}
          <Counter>{lightbox + 1} / {photos.length}</Counter>
        </Backdrop>
      ) : null}
    </Gallery>
  );
}
