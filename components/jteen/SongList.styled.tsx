'use client';

import styled, { css } from 'styled-components';

export const PlayIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 54px;
  height: 38px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.7);
  opacity: 1;
  transform: translate(-50%, -50%);

  &::after {
    position: absolute;
    top: 50%;
    left: 52%;
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-left: 12px solid #fff;
    content: '';
    transform: translate(-50%, -50%);
  }

`;

export const Facade = styled.button`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 180ms ease;
  }

  &:hover img,
  &:focus-visible img {
    opacity: 0.82;
  }

  &:hover ${PlayIcon},
  &:focus-visible ${PlayIcon} {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }
`;

export const List = styled.ol<{ $variant?: 'three' | 'four' }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 28px;

  ${({ $variant }) =>
    $variant === 'three' &&
    css`
      grid-template-columns: repeat(3, clamp(290.133px, 28.3333vw, 544px));
      gap: clamp(23.467px, 2.2917vw, 44px);

      @media (max-width: 1023px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      @media (max-width: 639px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    `}

  ${({ $variant }) =>
    $variant === 'four' &&
    css`
      grid-template-columns: repeat(4, clamp(221.867px, 21.6667vw, 416px));
      gap: clamp(9.961px, 0.9728vw, 18.6771px);

      @media (max-width: 1023px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      @media (max-width: 639px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    `}

  @media (max-width: 639px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const Tile = styled.li`
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: #050510;
`;

export const Media = styled.div<{ $variant?: 'three' | 'four' }>`
  width: 100%;
  aspect-ratio: 720 / 404;

  @media (min-width: 1024px) {
    height: ${({ $variant }) => $variant === 'three' ? 'clamp(162.667px, 15.8854vw, 305px)' : $variant === 'four' ? 'clamp(124.267px, 12.1354vw, 233px)' : 'auto'};
    aspect-ratio: auto;
  }
`;

export const VideoWrap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export const NoVideo = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(247, 249, 252, 0.35);
  color: rgba(247, 249, 252, 0.62);
  font-size: var(--ky-meta);
  text-align: center;
`;

export const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-top: 1px solid rgba(247, 249, 252, 0.14);

  a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    color: #f7f9fc;
    font-size: var(--ky-meta);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;
