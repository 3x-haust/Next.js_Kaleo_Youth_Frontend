'use client';

import Image from 'next/image';
import styled from 'styled-components';

export const MapCanvas = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &:focus-visible {
    outline: 2px solid #d98a2b;
    outline-offset: -3px;
  }
`;

export const TileLayer = styled.div`
  position: absolute;
  inset: 0;
  filter:
    grayscale(1)
    invert(0.88)
    sepia(0.28)
    saturate(1.45)
    hue-rotate(174deg)
    brightness(0.68)
    contrast(1.12);
  pointer-events: none;
`;

export const MapTile = styled(Image)`
  position: absolute;
  width: 256px;
  max-width: none;
  height: 256px;
  pointer-events: none;
  user-select: none;
`;

export const MarkerAnchor = styled.div`
  --marker-size: 56px;
  --marker-height: 72px;

  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  width: var(--marker-size);
  height: var(--marker-height);
  margin-top: calc(var(--marker-height) * -1);
  margin-left: calc(var(--marker-size) / -2);
  pointer-events: none;

  @media (max-width: 639px) {
    --marker-size: 44px;
    --marker-height: 57px;
  }
`;

export const MarkerPin = styled.span`
  position: absolute;
  top: 3px;
  left: 0;
  width: var(--marker-size);
  height: var(--marker-size);
  border: 3px solid #fff;
  border-radius: 50% 50% 50% 0;
  background: #ef5848;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.5);
  transform: rotate(-45deg);

  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 18px;
    height: 18px;
    border: 3px solid #fff;
    border-radius: 50%;
    background: #242424;
    box-sizing: border-box;
    content: '';
    transform: translate(-50%, -50%);

    @media (max-width: 639px) {
      width: 15px;
      height: 15px;
      border-width: 2px;
    }
  }
`;

export const MapControls = styled.div`
  position: absolute;
  z-index: 4;
  top: 18px;
  right: 18px;
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(247, 249, 252, 0.24);
  border-radius: 10px;
  background: rgba(1, 7, 22, 0.86);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(12px);
`;

export const MapControlButton = styled.button`
  width: 42px;
  height: 42px;
  border: 0;
  background: transparent;
  color: #f7f9fc;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;

  & + & {
    border-top: 1px solid rgba(247, 249, 252, 0.18);
  }

  &:hover:not(:disabled),
  &:focus-visible {
    background: #d98a2b;
    outline: 0;
  }

  &:disabled {
    color: rgba(247, 249, 252, 0.28);
    cursor: default;
  }
`;

export const Attribution = styled.a`
  position: absolute;
  z-index: 4;
  right: 8px;
  bottom: 5px;
  color: rgba(247, 249, 252, 0.5);
  font-size: 10px;
  line-height: 1;

  &:hover,
  &:focus-visible {
    color: #f7f9fc;
  }
`;
