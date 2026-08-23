'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';

export const Page = styled.section`
  min-height: 100vh;
  padding: clamp(72px, 10vw, 150px) max(var(--ky-gutter), calc((100vw - 1720px) / 2)) 140px;
  background: var(--ky-listing-field);
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, transparent, #3b82f6, transparent) 1;

  @media (max-width: 639px) {
    padding-top: 112px;
    padding-bottom: 96px;
  }

  @media (min-width: 1024px) {
    &[data-authored-frame='true'] {
      height: clamp(1152px, 112.5vw, 2160px);
      overflow: hidden;
      padding: clamp(122.667px, 11.9792vw, 230px) clamp(53.333px, 5.2083vw, 100px) 0;

      [data-visual-extra] {
        display: none;
      }

      [data-gallery-caption] {
        background: transparent;
      }

      [data-zone='gallery-grid'] {
        grid-template-columns: repeat(3, clamp(295.467px, 28.8542vw, 554px));
        column-gap: clamp(15.467px, 1.5104vw, 29px);
        row-gap: clamp(26.667px, 2.6042vw, 50px);
        margin-top: clamp(13.867px, 1.3542vw, 26px);
      }

      [data-zone='gallery-grid'] a {
        width: clamp(295.467px, 28.8542vw, 554px);
        height: clamp(213.333px, 20.8333vw, 400px);
      }
    }
  }
`;

export const Eyebrow = styled.p`
  color: #1677ff;
  font-size: clamp(16px, 1.46vw, 28px);
  line-height: 1.2;
  letter-spacing: 0.08em;
  white-space: nowrap;
`;

export const Title = styled.h1`
  margin-top: 16px;
  color: #f7f9fc;
  font-size: clamp(42px, 4.17vw, 80px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.035em;

  @media (min-width: 1024px) {
    font-weight: 900;
    letter-spacing: 0.09em;
  }
`;

export const Header = styled.header`
  display: flex;
  gap: 40px;
  align-items: flex-end;
  justify-content: space-between;

  @media (min-width: 1024px) {
    > div {
      width: clamp(280px, 27.3438vw, 525px);
      height: clamp(111.467px, 10.8854vw, 209px);
    }

    ${Eyebrow} {
      width: clamp(77.867px, 7.6042vw, 146px);
      height: clamp(17.6px, 1.7188vw, 33px);
      margin-bottom: clamp(8.533px, 0.8333vw, 16px);
      font-size: clamp(16px, 1.4583vw, 28px);
      font-weight: 600;
      line-height: clamp(17.6px, 1.7188vw, 33px);
      letter-spacing: clamp(1.067px, 0.1042vw, 2px);
    }

    ${Title} {
      width: clamp(280px, 27.3438vw, 525px);
      height: clamp(85.333px, 8.3333vw, 160px);
      font-size: clamp(42.667px, 4.1667vw, 80px);
      font-weight: 900;
      line-height: clamp(42.667px, 4.1667vw, 80px);
      letter-spacing: clamp(1.067px, 0.1042vw, 2px);
      white-space: nowrap;
    }
  }

  @media (max-width: 1023px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const Search = styled.form`
  display: flex;
  width: min(420px, 100%);
  border-bottom: 1px solid rgba(247, 249, 252, 0.55);

  input {
    min-width: 0;
    flex: 1;
    padding: 12px 4px;
    color: #f7f9fc;
    font-size: var(--ky-table);

    &::placeholder {
      color: rgba(247, 249, 252, 0.48);
    }

    &::-webkit-search-cancel-button {
      filter: invert(1);
    }
  }

  button {
    padding: 12px 4px 12px 20px;
    color: #f7f9fc;
    font-size: var(--ky-table);
  }
`;

export const SrOnly = styled.label`
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

export const Count = styled.p`
  margin-top: 42px;
  color: rgba(247, 249, 252, 0.62);
  font-size: var(--ky-meta);
`;

export const ImageCard = styled(Image)`
  object-fit: cover;
  transition: opacity 240ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const ImagePlaceholder = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 25%, rgba(22, 119, 255, 0.24), transparent 45%),
    linear-gradient(135deg, #08081e, #02020a);
`;

export const Caption = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: clamp(14px, 1.55vw, 30px);
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;
  letter-spacing: 0.05em;

  h2 {
    color: #f7f9fc;
    font-size: clamp(16px, 1.56vw, 30px);
    line-height: 1.25;
  }

  time {
    color: #bfbfbf;
    font-size: clamp(13px, 1.04vw, 20px);
    line-height: 1.3;
  }

  @media (min-width: 1024px) {
    height: clamp(56px, 5.4688vw, 105px);
    padding: clamp(10.667px, 1.0417vw, 20px) clamp(16px, 1.5625vw, 30px);

    h2 {
      width: clamp(263.467px, 25.7292vw, 494px);
      height: clamp(18.667px, 1.8229vw, 35px);
      font-size: clamp(16px, 1.5625vw, 30px);
      font-weight: 400;
      line-height: clamp(18.667px, 1.8229vw, 35px);
      letter-spacing: clamp(1.067px, 0.1042vw, 2px);
    }

    time {
      width: clamp(263.467px, 25.7292vw, 494px);
      height: clamp(12.8px, 1.25vw, 24px);
      font-size: clamp(13px, 1.0417vw, 20px);
      font-weight: 400;
      line-height: clamp(12.8px, 1.25vw, 24px);
      letter-spacing: clamp(1.067px, 0.1042vw, 2px);
    }
  }
`;

export const Card = styled(Link)`
  position: relative;
  display: block;
  aspect-ratio: 554 / 400;
  overflow: hidden;
  border: 1px solid rgba(247, 249, 252, 0.74);
  background: #050510;

  &:hover ${ImageCard},
  &:focus-visible ${ImageCard} {
    opacity: 0.88;
  }

  @media (min-width: 1024px) {
    width: clamp(295.467px, 28.8542vw, 554px);
    height: clamp(213.333px, 20.8333vw, 400px);
    border: 0;
    outline: 1px solid #f7f9fc;
    box-shadow: none;
  }
`;

export const AuthoredSpacer = styled.div`
  margin-top: 24px;
  height: 40px;

  @media (min-width: 1024px) {
    margin-top: clamp(12.8px, 1.25vw, 24px);
    height: clamp(21.333px, 2.0833vw, 40px);
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 50px 44px;
  margin-top: 26px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, clamp(295.467px, 28.8542vw, 554px));
    column-gap: clamp(15.467px, 1.5104vw, 29px);
    row-gap: clamp(26.667px, 2.6042vw, 50px);
  }

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 639px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 20px;
  }
`;

export const Pagination = styled.nav`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 72px;

  a {
    display: grid;
    min-width: 44px;
    min-height: 44px;
    place-items: center;
    padding: 8px;
    color: rgba(247, 249, 252, 0.58);
    text-align: center;
  }
`;

export const ActivePage = styled(Link)`
  color: #f7f9fc;
  border-bottom: 1px solid #1677ff;
`;

export const Empty = styled.div`
  min-height: 360px;
  margin-top: 90px;
  color: rgba(247, 249, 252, 0.64);
  font-size: var(--ky-body);

  a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    margin-top: 16px;
    color: #f7f9fc;
    text-decoration: underline;
  }
`;
