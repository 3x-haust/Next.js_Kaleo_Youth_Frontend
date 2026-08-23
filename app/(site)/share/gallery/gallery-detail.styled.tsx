'use client';

import Link from 'next/link';
import styled from 'styled-components';

export const Page = styled.article`
  min-height: 100vh;
  padding: clamp(72px, 10vw, 150px) max(var(--ky-gutter), calc((100vw - 1720px) / 2)) 160px;
  background: var(--ky-listing-field);
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, transparent, #3b82f6, transparent) 1;

  @media (max-width: 639px) {
    padding-top: 112px;
    padding-bottom: 96px;
  }

  @media (min-width: 1024px) {
    height: clamp(1386.667px, 135.4167vw, 2600px);
    overflow: hidden;
    padding: clamp(122.667px, 11.9792vw, 230px) clamp(53.333px, 5.2083vw, 100px) 0;

    [data-visual-extra] {
      display: none;
    }
  }
`;

export const Header = styled.header`
  time {
    color: #1677ff;
    font-size: clamp(16px, 1.46vw, 28px);
    line-height: 1.2;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  h1 {
    margin-top: 16px;
    color: #f7f9fc;
    font-size: clamp(42px, 4.17vw, 80px);
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.035em;
  }

  @media (min-width: 1024px) {
    width: clamp(318.4px, 31.0938vw, 597px);
    height: clamp(68.8px, 6.7188vw, 129px);

    time {
      display: block;
      width: clamp(97.6px, 9.5313vw, 183px);
      height: clamp(17.6px, 1.7188vw, 33px);
      font-size: clamp(16px, 1.4583vw, 28px);
      font-weight: 600;
      line-height: clamp(17.6px, 1.7188vw, 33px);
      letter-spacing: clamp(1.067px, 0.1042vw, 2px);
    }

    h1 {
      width: clamp(318.4px, 31.0938vw, 597px);
      height: clamp(42.667px, 4.1667vw, 80px);
      margin-top: clamp(8.533px, 0.8333vw, 16px);
      font-size: clamp(42.667px, 4.1667vw, 80px);
      font-weight: 900;
      line-height: clamp(42.667px, 4.1667vw, 80px);
      letter-spacing: clamp(1.067px, 0.1042vw, 2px);
      white-space: nowrap;
    }
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

export const Description = styled.p`
  max-width: 720px;
  margin-top: 28px;
  color: rgba(247, 249, 252, 0.68);
  font-size: var(--ky-body);
  line-height: 1.75;
  white-space: pre-wrap;
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  min-height: 44px;
  gap: 10px;
  align-items: center;
  margin: clamp(48px, 6vw, 90px) 0 30px;
  color: #f7f9fc;
  font-size: clamp(18px, 1.98vw, 38px);
  line-height: 1.2;

  span {
    color: rgba(247, 249, 252, 0.8);
    font-size: 1.12em;
  }

  @media (max-width: 639px) {
    margin-top: 40px;
    margin-bottom: 20px;
  }
`;

export const GalleryContainer = styled.div`
  @media (min-width: 1024px) {
    width: clamp(917.333px, 89.5833vw, 1720px);
    height: clamp(691.2px, 67.5vw, 1296px);
    margin-top: clamp(48px, 4.6875vw, 90px);

    ${BackLink} {
      width: clamp(98.133px, 9.5833vw, 184px);
      height: clamp(24px, 2.3438vw, 45px);
      min-height: clamp(24px, 2.3438vw, 45px);
      gap: clamp(5.333px, 0.5208vw, 10px);
      margin: 0 0 clamp(16px, 1.5625vw, 30px);
      font-size: clamp(20.267px, 1.9792vw, 38px);
      font-weight: 500;
      line-height: clamp(24px, 2.3438vw, 45px);
      white-space: nowrap;
    }
  }
`;

export const Empty = styled.div`
  min-height: 420px;
  padding-top: 60px;
  color: rgba(247, 249, 252, 0.62);
  font-size: var(--ky-body);
`;
