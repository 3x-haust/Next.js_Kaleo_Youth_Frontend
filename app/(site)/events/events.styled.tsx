'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';

const frame = (px: number) => {
  const at1024 = px * 1024 / 1920;
  const vw = px / 19.2;
  const fmt = (value: number) => Number(value.toFixed(8)).toString();

  if (px < 0) {
    return `clamp(${fmt(px)}px, ${fmt(vw)}vw, ${fmt(at1024)}px)`;
  }

  return `clamp(${fmt(at1024)}px, ${fmt(vw)}vw, ${fmt(px)}px)`;
};

export const Page = styled.div`
  --accent: #1677ff;

  min-height: 100vh;
  padding: clamp(9rem, 12vw, 14.375rem) var(--ky-gutter) var(--ky-sp-6);
  color: #f7f9fc;
  background: var(--ky-listing-field);
  border-bottom: 3px solid transparent;
  border-image: var(--ky-listing-edge) 1;

  @media (max-width: 639px) {
    padding-top: 8rem;
  }

  @media (min-width: 1024px) {
    &[data-authored-frame='true'] {
      height: ${frame(2160)};
      overflow: hidden;
      padding: ${frame(230)} ${frame(100)} 0;

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

  @media (min-width: 1024px) {
    margin-bottom: ${frame(24)};
  }
`;

export const DateBlock = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding-right: var(--ky-sp-4);
  border-right: 1px solid rgba(247, 249, 252, 0.45);
  line-height: 1;

  span,
  small {
    color: var(--accent);
    font-size: var(--ky-meta);
  }

  strong {
    font-size: clamp(2.5rem, 3.2vw, 3.75rem);
    font-weight: 600;
  }

  small {
    font-size: var(--ky-meta);
  }

  @media (max-width: 800px) {
    padding-right: var(--ky-sp-2);
  }

  @media (min-width: 1024px) {
    width: ${frame(205)};
    padding-right: 0;
  align-items: center;
    border-right-color: rgba(247, 249, 252, 0.14);

    span,
    small {
      font-size: ${frame(22)};
    }

    strong {
      font-weight: 600;
    }
  }
`;

export const DateContent = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  text-align: center;

  > span,
  > strong,
  > small {
    text-align: center;
  }

  @media (min-width: 1024px) {
    display: flex;
    width: ${frame(109)};
    height: ${frame(143)};
    flex-direction: column;
    align-items: center;
    gap: ${frame(10)};

    > span,
    > small {
      height: ${frame(26)};
      font-size: ${frame(22)};
      font-weight: 600;
      line-height: ${frame(26)};
    }

    > small {
      width: ${frame(50)};
      color: #f0f0ee;
    }

    > strong {
      width: ${frame(109)};
      color: #f7f9fc;
      height: ${frame(71)};
      font-size: ${frame(60)};
      font-weight: 700;
      line-height: ${frame(71)};
      letter-spacing: ${frame(2)};
    }
  }
`;

const EventIcon = styled(Image)`
  display: block;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;

  @media (min-width: 1024px) {
    width: ${frame(36)};
    height: ${frame(36)};
    flex-basis: ${frame(36)};
  }
`;

export const ClockIcon = styled(EventIcon)``;
export const PinIcon = styled(EventIcon)``;

export const Hero = styled.header`
  max-width: 48rem;

  h1 {
    font-size: clamp(2.75rem, 4.2vw, 5rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.045em;
  }

  h1 {
    font-weight: 400;
  }

  > p:last-child {
    margin-top: var(--ky-sp-4);
    color: #f0f0ee;
    font-size: var(--ky-body);
  }

  @media (max-width: 639px) {
    h1 {
      font-size: 2.75rem;
    }
  }

  @media (min-width: 1024px) {
    width: ${frame(452)};
    height: ${frame(195)};
    max-width: none;

    ${Eyebrow} {
      width: ${frame(181)};
      height: ${frame(33)};
      margin-bottom: ${frame(16)};
      font-size: ${frame(28)};
      font-weight: 600;
      line-height: normal;
      letter-spacing: ${frame(2)};
    }

    h1 {
      width: ${frame(452)};
      height: ${frame(80)};
      font-size: ${frame(80)};
      font-weight: 900;
      line-height: ${frame(80)};
      letter-spacing: ${frame(2)};
      white-space: nowrap;
    }

    > p:last-child {
      width: ${frame(380)};
      height: ${frame(26)};
      margin-top: ${frame(40)};
      color: #f7f9fc;
      font-size: ${frame(22)};
      line-height: normal;
      border-left: ${frame(3)} solid var(--accent);
      padding-left: ${frame(20)};

      > span {
        display: block;
        width: ${frame(357)};
        height: ${frame(26)};
      }
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
  margin-top: var(--ky-sp-5);
  color: rgba(247, 249, 252, 0.65);
  font-size: var(--ky-meta);

  @media (max-width: 639px) {
    margin-top: var(--ky-sp-5);
  }
`;

export const EventList = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--ky-sp-3);
  margin-top: var(--ky-sp-3);

  @media (min-width: 1024px) {
    gap: ${frame(40)};
    margin-top: ${frame(96)};
  }
`;

export const EventCard = styled.article`
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr) minmax(14rem, 24rem);
  align-items: center;
  gap: var(--ky-sp-5);
  padding: var(--ky-sp-3) clamp(var(--ky-sp-3), 5vw, var(--ky-sp-6));
  border: 1px solid #3b3b3b;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);

  @media (max-width: 800px) {
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: var(--ky-sp-3);
    padding: var(--ky-sp-3);
  }

  @media (max-width: 639px) {
    align-items: start;
  }

  @media (min-width: 1024px) {
    grid-template-columns: ${frame(205)} minmax(0, 1fr) ${frame(206)};
    column-gap: ${frame(95)};
    row-gap: 0;
    height: ${frame(200)};
    padding: ${frame(26)} ${frame(100)};
    border-color: #3b3b3b;
  }
`;

export const EventCopy = styled.span`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.35rem;

  small {
    color: var(--accent);
    font-size: var(--ky-meta);
  }

  strong {
    font-size: clamp(1.5rem, 2.7vw, 3.25rem);
    line-height: 1.2;
    text-wrap: balance;
  }

  > span {
    color: #bfbfbf;
    font-size: var(--ky-table);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 800px) {
    > span {
      white-space: normal;
    }
  }

  @media (max-width: 639px) {
    strong {
      font-size: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    width: max-content;
    height: ${frame(131)};
    align-items: flex-start;
    gap: ${frame(10)};
    translate: ${frame(-1)} 0;

    > small {
      height: ${frame(24)};
      font-size: ${frame(20)};
      font-weight: 600;
      line-height: ${frame(24)};
    }

    > strong {
      width: ${frame(360)};
      height: ${frame(61)};
      font-size: ${frame(52)};
      font-weight: 500;
      line-height: ${frame(61)};
      letter-spacing: ${frame(2)};
      white-space: nowrap;
    }

    > span {
      height: ${frame(26)};
      font-size: ${frame(22)};
      font-weight: 400;
      line-height: ${frame(26)};
    }
  }
`;

export const EventFacts = styled.span`
  display: flex;
  flex-direction: column;
  gap: var(--ky-sp-1);
  font-size: var(--ky-table);

  > span {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-wrap: balance;
  }

  i {
    flex: 0 0 auto;
  }

  @media (max-width: 800px) {
    grid-column: 2;
  }

  @media (min-width: 1024px) {
    width: ${frame(206)};
    height: ${frame(82)};
    gap: ${frame(10)};
    font-size: ${frame(22)};
    font-weight: 600;
    line-height: ${frame(26)};

    > span {
      display: grid;
      grid-template-columns: ${frame(36)} minmax(0, 1fr);
      height: ${frame(36)};
      align-items: center;
      column-gap: ${frame(10)};

      > span {
        display: flex;
        width: max-content;
        height: ${frame(26)};
        align-items: center;
        line-height: ${frame(26)};
        white-space: nowrap;
      }
    }

    > span:first-child > span {
      width: ${frame(108)};
    }

  }
`;

export const Filters = styled.form`
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
  justify-content: center;
  gap: var(--ky-sp-1);
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
  margin-top: var(--ky-sp-6);
  color: rgba(247, 249, 252, 0.7);

  a {
    display: inline-block;
    margin-top: var(--ky-sp-2);
    color: #fff;
    text-decoration: underline;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
`;

export const Notice = styled.p`
  max-width: 60rem;
  margin-top: var(--ky-sp-5);
  color: rgba(247, 249, 252, 0.6);
  font-size: var(--ky-meta);
`;

export const DetailHero = styled.header`
  max-width: 70rem;

  h1 {
    font-size: clamp(2.75rem, 4.2vw, 5rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.045em;
  }

  h1 {
    font-weight: 400;
  }

  > p:last-child {
    margin-top: var(--ky-sp-4);
    color: #f0f0ee;
    font-size: var(--ky-body);
  }

  @media (max-width: 639px) {
    h1 {
      font-size: 2.75rem;
    }
  }
`;

export const Back = styled(Link)`
  display: inline-flex;
  gap: var(--ky-sp-1);
  align-items: center;
  margin: var(--ky-sp-5) 0 var(--ky-sp-3);
  font-size: var(--ky-body);
  min-height: 44px;
`;

export const Cover = styled.div`
  position: relative;
  max-width: 90rem;
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(247, 249, 252, 0.7);
  overflow: hidden;

  img {
    object-fit: cover;
  }
`;

export const Facts = styled.section`
  max-width: var(--ky-body-measure);
  margin-top: var(--ky-sp-5);

  > div {
    margin-bottom: var(--ky-sp-4);
  }

  small {
    display: block;
    color: var(--accent);
    font-size: var(--ky-meta);
    letter-spacing: 0.08em;
  }

  p {
    margin-top: var(--ky-sp-1);
    white-space: pre-wrap;
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    line-height: 1.55;
  }
`;

export const Description = styled.div`
  max-width: var(--ky-body-measure);
  margin-top: var(--ky-sp-5);
  white-space: pre-wrap;
  font-size: var(--ky-body);
  line-height: 1.9;
`;

export const Offline = styled.p`
  max-width: var(--ky-body-measure);
  margin-top: var(--ky-sp-5);
  padding-top: var(--ky-sp-3);
  border-top: 1px solid rgba(247, 249, 252, 0.55);
  font-size: var(--ky-body);
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
