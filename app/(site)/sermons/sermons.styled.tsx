'use client';

import Link from 'next/link';
import styled from 'styled-components';

export const Page = styled.div`
  --accent: #1677ff;
  --sermon-frame-scale: 1;
  --sermon-frame-gutter: var(--ky-gutter);

  min-height: 100vh;
  padding: clamp(9rem, 12vw, 14.375rem) var(--sermon-frame-gutter) 0;
  color: #f7f9fc;
  background: var(--ky-listing-field);
  border-bottom: 3px solid transparent;
  border-image: var(--ky-listing-edge) 1;

  @media (max-width: 639px) {
    padding-top: 8rem;
  }

  @media (min-width: 1024px) {
    --sermon-frame-scale: clamp(0.533333, calc(100vw / 1920px), 1);
    --sermon-frame-gutter: calc(100px * var(--sermon-frame-scale));

    padding: calc(230px * var(--sermon-frame-scale)) var(--sermon-frame-gutter) 0;

    &[data-authored-frame='true'] {
      height: calc(2160px * var(--sermon-frame-scale));
      overflow: hidden;
      padding: calc(230px * var(--sermon-frame-scale)) var(--sermon-frame-gutter) 0;

      [data-visual-extra] {
        display: none;
      }
    }
  }
`;

export const Eyebrow = styled.p`
  color: var(--accent);
  font-size: clamp(0.875rem, 1.45vw, 1.75rem);
  letter-spacing: 0.08em;
  line-height: 1;
  margin-bottom: var(--ky-sp-2);
  white-space: nowrap;
`;

export const Hero = styled.header`
  max-width: 52rem;

  h1 {
    font-size: clamp(2.75rem, 4.2vw, 5rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.045em;
  }

  h1 {
    font-weight: 400;
  }

  @media (max-width: 639px) {
    h1 {
      font-size: 2.75rem;
    }
  }

  @media (min-width: 1024px) {
    width: calc(525px * var(--sermon-frame-scale));
    height: calc(275px * var(--sermon-frame-scale));
    max-width: none;

    ${Eyebrow} {
      width: calc(154px * var(--sermon-frame-scale));
      height: calc(33px * var(--sermon-frame-scale));
      margin-bottom: calc(16px * var(--sermon-frame-scale));
      font-size: calc(28px * var(--sermon-frame-scale));
      font-weight: 600;
      line-height: calc(33px * var(--sermon-frame-scale));
      letter-spacing: calc(2px * var(--sermon-frame-scale));
    }

    h1 {
      width: calc(525px * var(--sermon-frame-scale));
      height: calc(160px * var(--sermon-frame-scale));
      font-size: calc(80px * var(--sermon-frame-scale));
      font-weight: 900;
      line-height: calc(80px * var(--sermon-frame-scale));
      letter-spacing: calc(2px * var(--sermon-frame-scale));
      white-space: nowrap;
    }
  }
`;

export const Top = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ky-sp-6);

  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--ky-sp-4);
  }
`;

export const Count = styled.p`
  margin-top: var(--ky-sp-6);
  color: rgba(247, 249, 252, 0.65);
  font-size: var(--ky-meta);

  @media (max-width: 639px) {
    margin-top: var(--ky-sp-5);
  }
`;

export const Thumbnail = styled.span`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid rgba(247, 249, 252, 0.85);
  background: #111;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: 1024px) {
    width: calc(544px * var(--sermon-frame-scale));
    height: calc(304px * var(--sermon-frame-scale));
    aspect-ratio: auto;
    border: 0;
    box-shadow: 0 0 0 1px var(--ky-ink);

    > img {
      object-fit: none;
    }
  }
`;

export const CardDate = styled.time`
  font-size: var(--ky-meta);
  text-transform: uppercase;

  @media (min-width: 1024px) {
    font-size: calc(16px * var(--sermon-frame-scale));
    font-weight: 600;
  }
`;

export const CardTitle = styled.strong`
  font-size: clamp(1.25rem, 2vw, 2.25rem);
  line-height: 1.25;
  letter-spacing: -0.02em;

  @media (min-width: 1024px) {
    font-size: calc(36px * var(--sermon-frame-scale));
    font-weight: 900;
    line-height: calc(45px * var(--sermon-frame-scale));
    letter-spacing: calc(2px * var(--sermon-frame-scale));
    position: relative;
    top: calc(-3px * var(--sermon-frame-scale));
  }
`;

export const Quote = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border-left: 3px solid var(--accent);
  padding-left: var(--ky-sp-2);
  color: #f0f0ee;
  font-size: var(--ky-table);
`;

export const CardCopy = styled.span`
  display: flex;
  flex-direction: column;
  gap: var(--ky-sp-1);
  min-width: 0;
`;

export const Card = styled(Link)`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--ky-sp-3);

  &:hover ${CardTitle} {
    color: var(--accent);
  }

  ${Quote} {
    font-size: var(--ky-table);
  }

  @media (min-width: 1024px) {
    width: calc(544px * var(--sermon-frame-scale));
    height: calc(487px * var(--sermon-frame-scale));
    gap: calc(36px * var(--sermon-frame-scale));

    ${Quote} {
      padding-left: calc(20px * var(--sermon-frame-scale));
      font-size: calc(22px * var(--sermon-frame-scale));
      line-height: calc(26px * var(--sermon-frame-scale));
      position: relative;
      top: calc(7px * var(--sermon-frame-scale));
    }
  }
`;

export const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ky-sp-5) var(--ky-sp-3);
  margin-top: var(--ky-sp-3);

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, calc(544px * var(--sermon-frame-scale)));
    column-gap: calc(44px * var(--sermon-frame-scale));
    row-gap: calc(60px * var(--sermon-frame-scale));
    margin-top: calc(90px * var(--sermon-frame-scale));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 639px) {
    grid-template-columns: 1fr;
  }
`;

export const Search = styled.form`
  display: flex;
  align-items: end;
  width: min(35rem, 42vw);
  border-bottom: 1px solid rgba(247, 249, 252, 0.55);

  label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  input {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    padding: 12px 4px;
  }

  button {
    min-height: 44px;
    padding: 12px 4px 12px 20px;
  }

  @media (max-width: 767px) {
    align-items: stretch;
    width: 100%;
  }
`;

export const Pagination = styled.nav`
  display: flex;
  gap: var(--ky-sp-1);
  justify-content: center;
  margin-top: var(--ky-sp-5);

  a {
    min-width: 44px;
    min-height: 44px;
    padding: var(--ky-sp-1);
    text-align: center;
    display: grid;
    place-items: center;
  }
`;

export const CurrentPage = styled(Link)`
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
`;

export const Empty = styled.div`
  display: flex;
  min-height: 24rem;
  margin-top: var(--ky-sp-6);
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  border-top: 1px solid rgba(247, 249, 252, 0.16);
  color: rgba(247, 249, 252, 0.66);

  strong {
    color: #f7f9fc;
    font-size: clamp(1.5rem, 2.2vw, 2.25rem);
    font-weight: 500;
  }

  a {
    margin-top: var(--ky-sp-2);
    color: #fff;
    text-decoration: underline;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
`;

export const InfiniteStatus = styled.div`
  display: grid;
  min-height: 7rem;
  place-items: center;
  color: rgba(247, 249, 252, 0.64);

  button {
    min-height: 44px;
    padding: var(--ky-sp-1) var(--ky-sp-2);
    border: 1px solid rgba(247, 249, 252, 0.45);
  }
`;

export const DetailBack = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--ky-sp-1);
  margin: var(--ky-sp-5) 0 var(--ky-sp-3);
  font-size: clamp(1.125rem, 2vw, 2rem);
  min-height: 44px;
`;

export const Video = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(247, 249, 252, 0.85);
  background: #000;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  img {
    object-fit: cover;
  }
`;

export const FeatureDate = styled.time`
  display: block;
  margin-top: var(--ky-sp-3);
  font-size: var(--ky-table);

  @media (min-width: 1024px) {
    font-size: calc(26px * var(--sermon-frame-scale));
    font-weight: 600;
  }
`;

export const FeatureQuote = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border-left: 3px solid var(--accent);
  padding-left: var(--ky-sp-2);
  color: #f0f0ee;
  font-size: var(--ky-body);
  margin-top: var(--ky-sp-3);

  @media (min-width: 1024px) {
    font-size: calc(28px * var(--sermon-frame-scale));
    line-height: 1.35;
  }
`;

export const WatchLink = styled.a`
  display: inline-block;
  margin-top: var(--ky-sp-3);
  color: var(--accent);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
`;

export const Summary = styled.div`
  max-width: var(--ky-body-measure);
  margin-top: var(--ky-sp-5);
  white-space: pre-wrap;
  font-size: var(--ky-body);
  line-height: 1.9;
`;

export const BottomBack = styled(Link)`
  display: inline-block;
  margin-top: var(--ky-sp-5);
  color: rgba(247, 249, 252, 0.7);
  text-decoration: underline;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
`;

export const Feature = styled.article`
  max-width: 107.5rem;

  h2 {
    margin-top: var(--ky-sp-1);
    font-size: clamp(2rem, 3.25vw, 3.875rem);
    line-height: 1.2;
  }

  @media (min-width: 1024px) {
    h2 {
      font-weight: 900;
    }
  }
`;

export const DetailIntro = styled.header`
  max-width: 52rem;

  h1 {
    font-size: clamp(2.75rem, 4.2vw, 5rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.045em;
  }

  h1 {
    font-weight: 400;
  }

  @media (max-width: 639px) {
    h1 {
      font-size: 2.75rem;
    }
  }

  @media (min-width: 1024px) {
    width: calc(288px * var(--sermon-frame-scale));
    height: calc(129px * var(--sermon-frame-scale));
    max-width: none;

    ${Eyebrow} {
      width: calc(141px * var(--sermon-frame-scale));
      height: calc(33px * var(--sermon-frame-scale));
      margin-bottom: calc(16px * var(--sermon-frame-scale));
      font-size: calc(28px * var(--sermon-frame-scale));
      font-weight: 600;
      line-height: calc(33px * var(--sermon-frame-scale));
      letter-spacing: calc(2px * var(--sermon-frame-scale));
    }

    h1 {
      width: calc(288px * var(--sermon-frame-scale));
      height: calc(80px * var(--sermon-frame-scale));
      font-size: calc(80px * var(--sermon-frame-scale));
      font-weight: 900;
      line-height: calc(80px * var(--sermon-frame-scale));
      letter-spacing: calc(2px * var(--sermon-frame-scale));
      white-space: nowrap;
    }
  }
`;

export const RecentImage = styled.span`
  position: relative;
  display: block;
  flex: 0 0 auto;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: url('/images/sermons/sermon-placeholder.jpg') center/cover;

  img {
    object-fit: cover;
  }

  @media (min-width: 1024px) {
    width: calc(544px * var(--sermon-frame-scale));
    height: calc(304px * var(--sermon-frame-scale));
    aspect-ratio: auto;
    background-size: cover;
    box-shadow: 0 0 0 1px var(--ky-ink);
  }
`;

export const RecentCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  time {
    font-size: 16px;
  }

  strong {
    font-size: 28px;
  }

  ${Quote} {
    font-size: var(--ky-table);
  }

  @media (min-width: 1024px) {
    ${RecentImage} {
      margin-bottom: calc(24px * var(--sermon-frame-scale));
    }

    time {
      font-size: calc(16px * var(--sermon-frame-scale));
      font-weight: 600;
    }

    strong {
      font-size: calc(36px * var(--sermon-frame-scale));
      font-weight: 900;
      line-height: calc(43px * var(--sermon-frame-scale));
      letter-spacing: calc(2px * var(--sermon-frame-scale));
      position: relative;
      top: calc(-5px * var(--sermon-frame-scale));
    }

    ${Quote} {
      padding-left: calc(20px * var(--sermon-frame-scale));
      font-size: calc(22px * var(--sermon-frame-scale));
      line-height: calc(26px * var(--sermon-frame-scale));
      position: relative;
      top: calc(2px * var(--sermon-frame-scale));
    }
  }
`;

export const RecentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 44px;
  margin-top: 36px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, calc(544px * var(--sermon-frame-scale)));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  @media (max-width: 639px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const RecentInner = styled.div`
  @media (min-width: 1024px) {
    width: calc(1720px * var(--sermon-frame-scale));
    height: calc(562px * var(--sermon-frame-scale));

    > h2 {
      width: calc(218px * var(--sermon-frame-scale));
      height: calc(45px * var(--sermon-frame-scale));
      font-size: calc(38px * var(--sermon-frame-scale));
      font-weight: 500;
      line-height: calc(45px * var(--sermon-frame-scale));
      letter-spacing: 0;
      white-space: nowrap;
    }

    ${RecentGrid} {
      width: calc(1720px * var(--sermon-frame-scale));
      height: calc(487px * var(--sermon-frame-scale));
      gap: calc(44px * var(--sermon-frame-scale));
      margin-top: calc(31px * var(--sermon-frame-scale));
    }

    ${RecentCard} {
      width: calc(544px * var(--sermon-frame-scale));
      height: calc(487px * var(--sermon-frame-scale));
    }

    ${RecentImage} {
      width: calc(544px * var(--sermon-frame-scale));
      height: calc(304px * var(--sermon-frame-scale));
    }
  }
`;

export const Recent = styled.section`
  margin-top: 96px;
  border-top: 1px solid #f7f9fc;
  padding-top: 48px;

  h2 {
    font-size: 38px;
  }
`;

export const DetailPage = styled(Page)`
  @media (min-width: 1024px) {
    height: calc(2600px * var(--sermon-frame-scale));

    ${DetailBack} {
      margin: calc(88px * var(--sermon-frame-scale)) 0 calc(24px * var(--sermon-frame-scale));
    }

    ${Video} {
      width: calc(1720px * var(--sermon-frame-scale));
      height: calc(960px * var(--sermon-frame-scale));
      aspect-ratio: auto;
      border: 0;
      box-shadow: 0 0 0 1px var(--ky-ink);

      img {
        object-fit: cover;
      }
    }

    ${WatchLink},
    ${Summary},
    [data-visual-extra] {
      display: none;
    }

    ${FeatureDate} {
      font-size: calc(26px * var(--sermon-frame-scale));
      font-weight: 600;
    }

    ${FeatureQuote} {
      font-size: calc(28px * var(--sermon-frame-scale));
      line-height: 1.35;
    }

    ${Recent} {
      margin-top: calc(60px * var(--sermon-frame-scale));
      padding-top: calc(59px * var(--sermon-frame-scale));
    }

    ${RecentGrid} {
      position: relative;
      top: calc(-1px * var(--sermon-frame-scale));
    }
  }

  @media (min-width: 1024px) {
    ${DetailIntro} {
      width: calc(288px * var(--sermon-frame-scale));
      height: calc(129px * var(--sermon-frame-scale));
      max-width: none;

      ${Eyebrow} {
        width: calc(141px * var(--sermon-frame-scale));
        height: calc(33px * var(--sermon-frame-scale));
        margin-bottom: calc(16px * var(--sermon-frame-scale));
        font-size: calc(28px * var(--sermon-frame-scale));
        font-weight: 600;
        line-height: calc(33px * var(--sermon-frame-scale));
        letter-spacing: calc(2px * var(--sermon-frame-scale));
      }

      h1 {
        width: calc(288px * var(--sermon-frame-scale));
        height: calc(80px * var(--sermon-frame-scale));
        font-size: calc(80px * var(--sermon-frame-scale));
        font-weight: 900;
        line-height: calc(80px * var(--sermon-frame-scale));
        letter-spacing: calc(2px * var(--sermon-frame-scale));
        white-space: nowrap;
      }
    }

    ${DetailBack} {
      width: calc(184px * var(--sermon-frame-scale));
      height: calc(45px * var(--sermon-frame-scale));
      min-height: calc(45px * var(--sermon-frame-scale));
      gap: calc(10px * var(--sermon-frame-scale));
      margin: calc(90px * var(--sermon-frame-scale)) 0 calc(30px * var(--sermon-frame-scale));
      font-size: calc(38px * var(--sermon-frame-scale));
      font-weight: 500;
      line-height: calc(45px * var(--sermon-frame-scale));
      white-space: nowrap;
    }

    ${Feature} {
      width: calc(1720px * var(--sermon-frame-scale));
      height: calc(1249px * var(--sermon-frame-scale));
      max-width: none;
    }

    ${FeatureDate} {
      width: calc(507px * var(--sermon-frame-scale));
      height: calc(35px * var(--sermon-frame-scale));
      margin-top: calc(40px * var(--sermon-frame-scale));
      color: #fff;
      font-size: calc(30px * var(--sermon-frame-scale));
      font-weight: 600;
      line-height: calc(35px * var(--sermon-frame-scale));
      white-space: nowrap;
    }

    ${Feature} h2 {
      width: calc(576px * var(--sermon-frame-scale));
      height: calc(73px * var(--sermon-frame-scale));
      margin-top: calc(18px * var(--sermon-frame-scale));
      font-size: calc(62px * var(--sermon-frame-scale));
      font-weight: 900;
      line-height: calc(73px * var(--sermon-frame-scale));
      letter-spacing: calc(3.4491px * var(--sermon-frame-scale));
      white-space: nowrap;
    }

    ${FeatureQuote} {
      width: calc(308px * var(--sermon-frame-scale));
      height: calc(88px * var(--sermon-frame-scale));
      gap: calc(8px * var(--sermon-frame-scale));
      margin-top: calc(35px * var(--sermon-frame-scale));
      padding-left: calc(30px * var(--sermon-frame-scale));
      border-left-width: 5px;

      p:first-child {
        width: calc(273px * var(--sermon-frame-scale));
        height: calc(45px * var(--sermon-frame-scale));
        font-size: calc(38px * var(--sermon-frame-scale));
        font-weight: 600;
        line-height: calc(45px * var(--sermon-frame-scale));
        white-space: nowrap;
      }

      p:last-child {
        width: calc(192px * var(--sermon-frame-scale));
        height: calc(35px * var(--sermon-frame-scale));
        font-size: calc(30px * var(--sermon-frame-scale));
        font-weight: 500;
        line-height: calc(35px * var(--sermon-frame-scale));
        white-space: nowrap;
      }
    }
  }
`;
