'use client';

import styled, { keyframes } from 'styled-components';

const heroFade = keyframes`
  from {
    opacity: 0.2;
  }
  to {
    opacity: 1;
  }
`;

export const Gallery = styled.div`
  width: 100%;
`;

export const Hero = styled.button`
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1720 / 960;
  overflow: hidden;
  border: 1px solid rgba(247, 249, 252, 0.75);
  background: #050510;
  cursor: zoom-in;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: ${heroFade} 220ms ease-out both;
    transition: opacity 220ms ease-out;
  }

  @media (min-width: 1024px) {
    width: clamp(917.333px, 89.5833vw, 1720px);
    height: clamp(512px, 50vw, 960px);
    aspect-ratio: auto;
    border: 0;
    outline: 1px solid var(--ky-ink);
    outline-offset: 0;
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      animation: none;
      transition: none;
    }
  }
`;

export const Rail = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  margin-top: 60px;

  @media (min-width: 1024px) {
    width: clamp(917.333px, 89.5833vw, 1720px);
    gap: clamp(12.8px, 1.25vw, 24px);
    margin-top: clamp(32px, 3.125vw, 60px);
  }

  @media (max-width: 1023px) {
    gap: 12px;
    margin-top: 28px;
  }
`;

export const RailArrow = styled.button`
  flex: 0 0 56px;
  height: 80px;
  color: #f7f9fc;
  font-size: 64px;
  font-weight: 200;
  line-height: 1;

  &:disabled {
    cursor: default;
    opacity: 0.28;
  }

  @media (min-width: 1024px) {
    flex-basis: clamp(42.667px, 4.1667vw, 80px);
    width: clamp(42.667px, 4.1667vw, 80px);
    height: clamp(42.667px, 4.1667vw, 80px);

    span {
      display: block;
      width: clamp(18.133px, 1.7708vw, 34px);
      height: clamp(18.133px, 1.7708vw, 34px);
      margin: auto;
      border-style: solid;
      border-color: currentColor;
      font-size: 0;
    }

    &:first-child span {
      border-width: 0 0 clamp(2.667px, 0.2604vw, 5px) clamp(2.667px, 0.2604vw, 5px);
      transform: rotate(45deg);
    }

    &:last-child span {
      border-width: clamp(2.667px, 0.2604vw, 5px) clamp(2.667px, 0.2604vw, 5px) 0 0;
      transform: rotate(45deg);
    }
  }

  @media (max-width: 1023px) {
    flex-basis: 40px;
    height: 56px;
    font-size: 46px;
  }

  @media (max-width: 639px) {
    flex-basis: 40px;
    height: 56px;
    font-size: 46px;
  }

`;

export const ThumbButton = styled.button<{ $selected?: boolean }>`
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 360 / 201;
  overflow: hidden;
  border: 0;
  opacity: 1;

  &::after {
    position: absolute;
    z-index: 1;
    inset: 0;
    border: ${({ $selected }) =>
      $selected
        ? '3px solid var(--ky-blue)'
        : '1px solid rgba(247, 249, 252, 0.62)'};
    content: '';
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: 1024px) {
    width: clamp(192px, 18.75vw, 360px);
    height: clamp(107.2px, 10.4688vw, 201px);
    aspect-ratio: auto;
    box-shadow: none;
  }
`;

export const Thumbnails = styled.ul`
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  overflow: hidden;

  @media (min-width: 1024px) {
    gap: clamp(12.8px, 1.25vw, 24px);

    ${ThumbButton} {
      width: 100%;
      height: auto;
      aspect-ratio: 360 / 201;
    }
  }

  @media (max-width: 1023px) {
    gap: 8px;

    ${ThumbButton} {
      min-height: 44px;
    }
  }

  @media (max-width: 639px) {
    gap: 6px;
  }


`;

export const Backdrop = styled.div`
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 88px;
  background: rgba(0, 0, 0, 0.92);

  > img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  @media (max-width: 639px) {
    padding: 64px 12px;
  }
`;

export const LightboxButton = styled.button`
  position: absolute;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.48);
  color: #fff;
  font-size: 30px;

  &:disabled {
    cursor: default;
    opacity: 0.28;
  }
`;

export const CloseButton = styled(LightboxButton)`
  top: 20px;
  right: 20px;
`;

export const Arrow = styled(LightboxButton)`
  top: 50%;
  transform: translateY(-50%);
`;

export const ArrowLeft = styled(Arrow)`
  left: 20px;
`;

export const ArrowRight = styled(Arrow)`
  right: 20px;
`;

export const Counter = styled.p`
  position: absolute;
  right: 0;
  bottom: 18px;
  left: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  text-align: center;
`;
