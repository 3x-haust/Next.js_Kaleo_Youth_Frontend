'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';

export const DetailPage = styled.article`
  min-height: 1080px;
  padding: 230px max(var(--ky-gutter), calc((100vw - 1720px) / 2)) 0;
  background: linear-gradient(180deg, #07071d 0%, #000 50%, #07071d 100%);
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, transparent, #3b82f6, transparent) 1;

  @media (min-width: 1024px) {
    min-height: clamp(576px, 56.25vw, 1080px);
    height: auto;
    overflow: visible;
    padding: clamp(122.667px, 11.9792vw, 230px) clamp(53.333px, 5.2083vw, 100px)
      clamp(64px, 6.25vw, 120px);
  }

  @media (max-width: 639px) {
    padding-top: 112px;
    padding-bottom: 80px;
  }
`;

export const Hero = styled.header`
  width: min(100%, 439px);
  height: 275px;
  max-width: 100%;
  color: #f7f9fc;
  font-size: 26px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 30.62px;

  @media (min-width: 1024px) {
    width: clamp(234.133px, 22.8646vw, 439px);
    height: clamp(146.667px, 14.3229vw, 275px);
    font-size: clamp(13.867px, 1.3542vw, 26px);
    line-height: clamp(16.331px, 1.5948vw, 30.62px);
  }
`;

export const Eyebrow = styled.p`
  width: 133px;
  height: 33px;
  color: #1677ff;
  font-size: clamp(16px, 1.46vw, 28px);
  line-height: 33px;
  letter-spacing: 2px;
  font-weight: 600;
  white-space: nowrap;

  @media (min-width: 1024px) {
    width: clamp(70.933px, 6.9271vw, 133px);
    height: clamp(17.6px, 1.7188vw, 33px);
    font-size: clamp(16px, 1.4583vw, 28px);
    line-height: clamp(17.6px, 1.7188vw, 33px);
    letter-spacing: clamp(1.067px, 0.1042vw, 2px);
  }
`;

export const Title = styled.h1`
  margin-top: 16px;
  color: #f7f9fc;
  font-size: clamp(44px, 4.17vw, 80px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.025em;

  > span {
    display: block;
    height: 160px;
    white-space: nowrap;
  }

  @media (min-width: 1024px) {
    margin-top: clamp(8.533px, 0.8333vw, 16px);
    font-size: clamp(42.667px, 4.1667vw, 80px);
    letter-spacing: clamp(1.067px, 0.1042vw, 2px);

    > span {
      height: clamp(85.333px, 8.3333vw, 160px);
    }
  }

  @media (max-width: 639px) {
    font-size: 48px;

    > span {
      height: auto;
      white-space: normal;
    }
  }
`;

export const ChevronNav = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: min(100%, 468px);
  height: 31px;
  margin-top: 40px;

  @media (min-width: 1024px) {
    gap: clamp(10.667px, 1.0417vw, 20px);
    width: clamp(249.6px, 24.375vw, 468px);
    height: clamp(16.533px, 1.6146vw, 31px);
    margin-top: clamp(21.333px, 2.0833vw, 40px);
  }

  @media (max-width: 639px) {
    width: auto;
    height: auto;
    margin-top: 24px;
  }
`;

export const ChevronBtn = styled(Link)<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  opacity: ${({ $disabled }) => ($disabled ? 0.35 : 1)};

  img {
    width: 28px;
    height: 28px;
  }

  @media (min-width: 1024px) {
    width: clamp(14.933px, 1.4583vw, 28px);
    height: clamp(14.933px, 1.4583vw, 28px);

    img {
      width: clamp(14.933px, 1.4583vw, 28px);
      height: clamp(14.933px, 1.4583vw, 28px);
    }
  }
`;

export const MetaQuote = styled.span`
  flex: 0 0 372px;
  height: 31px;
  color: #f7f9fc;
  font-size: 26px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 30.62px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 1024px) {
    flex-basis: clamp(198.4px, 19.375vw, 372px);
    height: clamp(16.533px, 1.6146vw, 31px);
    font-size: clamp(13.867px, 1.3542vw, 26px);
    line-height: clamp(16.331px, 1.5948vw, 30.62px);
  }

  @media (max-width: 639px) {
    flex: 1 1 auto;
    min-width: 0;
    height: auto;
    display: -webkit-box;
    overflow: hidden;
    white-space: normal;
    text-overflow: clip;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

export const SrOnly = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const Notice = styled.p`
  max-width: 760px;
  margin-top: 24px;
  color: rgba(247, 249, 252, 0.68);
  font-size: var(--ky-meta);
`;

export const Songs = styled.div`
  margin-top: 95px;

  @media (min-width: 1024px) {
    margin-top: clamp(50.667px, 4.9479vw, 95px);
  }
`;

export const AttachmentSection = styled.section`
  width: min(100%, 1280px);
  margin-top: clamp(64px, 7vw, 120px);
`;

export const AttachmentHeading = styled.h2`
  color: #f7f9fc;
  font-size: clamp(24px, 2.4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.02em;
`;

export const AttachmentImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 2vw, 28px);
  margin-top: 28px;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const AttachmentFigure = styled.figure`
  overflow: hidden;
  border: 1px solid rgba(247, 249, 252, 0.14);
  background: #02030e;
`;

export const AttachmentImage = styled(Image)`
  display: block;
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
`;

export const AttachmentCaption = styled.figcaption`
  padding: 12px 16px;
  border-top: 1px solid rgba(247, 249, 252, 0.1);
  color: rgba(247, 249, 252, 0.72);
  font-size: var(--ky-meta);
  overflow-wrap: anywhere;
`;

export const AttachmentDownloads = styled.ul`
  display: grid;
  gap: 10px;
  margin-top: 24px;

  a {
    display: flex;
    min-height: 48px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 16px;
    border: 1px solid rgba(247, 249, 252, 0.28);
    color: #f7f9fc;
    font-size: var(--ky-table);
  }

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  small {
    flex-shrink: 0;
    color: rgba(247, 249, 252, 0.58);
    font-size: var(--ky-meta);
  }
`;
