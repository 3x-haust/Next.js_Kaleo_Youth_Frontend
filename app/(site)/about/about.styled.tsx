'use client';

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
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #f7f9fc;
  background: #000;
  border-bottom: 2px solid #1677ff;

  &::before {
    position: absolute;
    top: 1130px;
    right: -110px;
    width: 650px;
    height: 520px;
    background: radial-gradient(circle, rgba(0, 190, 255, 0.34) 0%, rgba(22, 119, 255, 0.2) 30%, transparent 66%);
    content: '';
    pointer-events: none;
  }

  @media (min-width: 1024px) {
    height: auto;
    min-height: ${frame(3290)};
    overflow: hidden;
    border-bottom: 0;
    background: linear-gradient(
      to bottom,
      #000 0,
      #000 ${frame(1360)},
      #07071d ${frame(2830)},
      #000 ${frame(2830)}
    );

    &::before {
      top: 0;
      right: auto;
      left: 0;
      width: ${frame(1920)};
      height: ${frame(2830)};
      background:
        radial-gradient(
          ellipse ${frame(300)} ${frame(500)} at ${frame(24)} ${frame(795)},
          rgba(0, 200, 240, 0.38) 0%,
          rgba(44, 50, 254, 0.08) 70%,
          transparent 100%
        ),
        radial-gradient(
          ellipse ${frame(300)} ${frame(500)} at ${frame(1947)} ${frame(1299)},
          rgba(0, 200, 240, 0.38) 0%,
          rgba(44, 50, 254, 0.08) 70%,
          transparent 100%
        );
    }
  }
`;

export const Eyebrow = styled.p`
  color: #1677ff;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.08em;
  white-space: nowrap;
`;

const baseHeading = `
  margin-top: 16px;
  font-size: 80px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.025em;
`;

export const IntroCopy = styled.div`
  h1 {
    ${baseHeading}
  }

  > p:last-child {
    max-width: 650px;
    margin-top: 28px;
    font-size: 22px;
    line-height: 1.7;
  }

  @media (min-width: 1024px) {
    ${Eyebrow} {
      width: ${frame(166)};
      height: ${frame(33)};
      margin-bottom: ${frame(16)};
      font-size: ${frame(28)};
      font-weight: 600;
      line-height: ${frame(33)};
      letter-spacing: ${frame(2)};
    }

    h1 {
      width: ${frame(617)};
      height: ${frame(80)};
      font-size: ${frame(80)};
      font-weight: 900;
      line-height: ${frame(80)};
      letter-spacing: ${frame(2)};
      white-space: nowrap;
    }

    > p:last-child {
      width: ${frame(794)};
      height: ${frame(26)};
      max-width: none;
      margin-top: ${frame(40)};
      padding-left: ${frame(20)};
      border-left: ${frame(3)} solid #1677ff;
      color: #f7f9fc;
      font-size: ${frame(22)};
      font-weight: 400;
      line-height: ${frame(26)};
      white-space: nowrap;

      > span {
        display: block;
        width: ${frame(771)};
        height: ${frame(26)};
      }
    }
  }

  @media (max-width: 639px) {
    h1 {
      font-size: 48px;
    }
  }
`;

export const Intro = styled.section`
  height: 600px;
  padding: 230px 100px 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.28)), url('/images/effects/about-gradient.svg') center/cover;

  @media (min-width: 1024px) {
    position: relative;
    height: ${frame(600)};
    display: grid;
    grid-template-columns: ${frame(900)} 1fr;
    align-items: center;
    padding: ${frame(160)} ${frame(100)} 0;
    background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.02)), url('/images/effects/about-gradient.svg');

    ${IntroCopy} {
      position: absolute;
      top: ${frame(231)};
      left: ${frame(100)};
      width: ${frame(794)};
      height: ${frame(195)};
    }
  }

  @media (max-width: 1023px) {
    height: auto;
    min-height: unset;
    padding: 140px var(--ky-gutter) 80px;
  }

`;

export const ValueIcon = styled.span`
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  width: 80px;
  height: 80px;
  place-items: center;
  border: 2px solid #1677ff;
  border-radius: 50%;
  color: #1677ff;
  font-size: 34px;

  @media (min-width: 1024px) {
    position: relative;
    margin: 0 auto ${frame(15)};
    border: 0;
    border-radius: 0;

    svg {
      width: ${frame(58)};
      height: ${frame(58)};
      fill: none;
      stroke: #6ab9eb;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }
`;

export const Values = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
  margin-top: 64px;

  article {
    position: relative;
    padding-left: 98px;
  }

  small {
    color: #1677ff;
    letter-spacing: 0.08em;
  }

  h2 {
    margin-top: 8px;
    font-size: 26px;
  }

  p {
    margin-top: 10px;
    color: #f0f0ee;
    line-height: 1.6;
  }

  @media (min-width: 1024px) {
    position: absolute;
    top: ${frame(245)};
    left: ${frame(1038)};
    display: flex;
    width: ${frame(780)};
    height: ${frame(167)};
    margin-top: 0;
    grid-template-columns: none;
    gap: ${frame(50)};

    article {
      height: ${frame(167)};
      padding: 0;
      text-align: center;

      &:nth-of-type(1) { width: ${frame(163)}; flex-basis: ${frame(163)}; }
      &:nth-of-type(2) { width: ${frame(191)}; flex-basis: ${frame(191)}; }
      &:nth-of-type(3) { width: ${frame(226)}; flex-basis: ${frame(226)}; }
    }

    small {
      display: block;
      height: ${frame(33)};
      font-size: ${frame(28)};
      font-weight: 600;
      line-height: ${frame(33)};
      letter-spacing: 0;
    }

    h2 {
      height: ${frame(24)};
      margin-top: ${frame(15)};
      font-size: ${frame(20)};
      font-weight: 600;
      line-height: ${frame(24)};
      letter-spacing: 0;
      white-space: nowrap;
    }

    p {
      display: none;
    }
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`;

export const ValueDivider = styled.span`
  @media (min-width: 1024px) {
    position: relative;
    width: 0;
    height: ${frame(146)};
    flex: 0 0 0;
    align-self: center;

    &::before {
      position: absolute;
      inset: 0 auto 0 0;
      width: ${frame(1)};
      background: #3b3b3b;
      content: '';
    }
  }
`;

export const Leader = styled.section`
  position: relative;
  height: 660px;
  display: grid;
  grid-template-columns: 312px 735px;
  justify-content: center;
  align-items: center;
  gap: 72px;
  background: #08081e;

  h2 {
    margin-top: 16px;
    font-size: 80px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.025em;
  }

  small {
    font-size: 26px;
    font-weight: 400;
    letter-spacing: 0;
  }

  @media (min-width: 1024px) {
    height: auto;
    min-height: ${frame(660)};
    grid-template-columns: ${frame(312)} ${frame(735)};
    justify-content: start;
    padding: ${frame(135)} ${frame(100)};
    column-gap: ${frame(100)};
    background: transparent;
    align-items: start;
    gap: ${frame(100)};
    padding-bottom: ${frame(7)};

    > div:last-child {
      width: ${frame(735)};
      min-height: ${frame(390)};

      > ${Eyebrow} {
        width: ${frame(210)};
        height: ${frame(33)};
        margin-bottom: ${frame(16)};
        font-size: ${frame(28)};
        font-weight: 600;
        line-height: ${frame(33)};
        letter-spacing: ${frame(2)};
      }
    }

    h2 {
      position: relative;
      display: flex;
      width: ${frame(735)};
      height: ${frame(80)};
      align-items: center;
      margin: 0;
      font-size: inherit;
      line-height: ${frame(80)};

      > span {
        display: block;
        width: ${frame(380)};
        height: ${frame(80)};
        font-size: ${frame(80)};
        font-weight: 900;
        line-height: ${frame(80)};
        letter-spacing: ${frame(2)};
        white-space: nowrap;
      }

      > small {
        display: block;
        width: ${frame(177)};
        height: ${frame(80)};
        margin-left: ${frame(30)};
        font-size: ${frame(30)};
        font-weight: 500;
        line-height: ${frame(80)};
        letter-spacing: ${frame(2)};
        white-space: nowrap;
      }

      &::after {
        content: '';
        position: absolute;
        top: ${frame(118)};
        left: 0;
        display: block;
        width: ${frame(130)};
        height: ${frame(5)};
        margin: 0;
        background: #1677ff;
      }
    }

    blockquote {
      width: ${frame(735)};
      min-height: ${frame(180)};
      height: auto;
      margin-top: ${frame(80)};
      color: #f0f0ee;
      font-size: ${frame(30)};
      font-weight: 400;
      line-height: ${frame(45)};
    }
  }

  @media (max-width: 1023px) {
    height: auto;
    min-height: unset;
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 80px var(--ky-gutter);

    > div:last-child {
      width: min(735px, 100%);
    }
  }

  @media (max-width: 639px) {
    h2 {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px 12px;
      font-size: 48px;
    }

    h2 small {
      white-space: nowrap;
    }

    blockquote br {
      display: none;
    }
  }
`;

export const LeaderPortrait = styled.div`
  position: relative;
  width: 160px;
  height: 200px;
  overflow: hidden;
  border: 1px solid #f7f9fc;
  border-radius: 10px;
  background: #000;

  img {
    object-fit: cover;
    transform: scale(1.01);
  }

  @media (min-width: 1024px) {
    width: ${frame(312)};
    height: ${frame(390)};
    border-width: ${frame(1)};
    border-radius: ${frame(14)};

    img {
      object-position: 55% 50%;
      transform: scale(1.0064516, 1.0051546);
    }
  }
`;

export const MemberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 560px);
  gap: 28px 20px;
  margin-top: 70px;

  @media (min-width: 1024px) {
    position: absolute;
    top: ${frame(305)};
    left: ${frame(70)};
    width: ${frame(1780)};
    height: ${frame(1054)};
    margin: 0;
    grid-template-columns: repeat(3, ${frame(560)});
    column-gap: ${frame(50)};
    row-gap: ${frame(50)};
  }

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 639px) {
    grid-template-columns: 1fr;
  }
`;

export const MemberPortrait = styled.span<{ $hasPhoto: boolean }>`
  @media (min-width: 1024px) {
    position: absolute;
    left: ${frame(21)};
    top: ${frame(21)};
    width: ${frame(215)};
    height: ${frame(272)};
    overflow: hidden;
    border-radius: ${frame(13.965)};
    background-color: #f3f3f3;
    background-image: ${({ $hasPhoto }) =>
      $hasPhoto
        ? 'none'
        : 'conic-gradient(#e5e5e5 25%, #fff 0 50%, #e5e5e5 0 75%, #fff 0)'};
    background-position: center;
    background-size: ${frame(24)} ${frame(24)};
    background-repeat: repeat;

    img {
      object-fit: cover;
    }
  }
`;

export type TeamInstrument =
  | 'electric-guitar'
  | 'drums'
  | 'main-keyboard'
  | 'second-keyboard'
  | 'bass'
  | 'vocal';

const instrumentGeometry: Record<
  TeamInstrument,
  { left: number; top: number; width: number; height: number }
> = {
  'electric-guitar': { left: 418, top: 22, width: 122, height: 108 },
  drums: { left: 421, top: 3, width: 125, height: 125 },
  'main-keyboard': { left: 422, top: 18, width: 121, height: 111 },
  'second-keyboard': { left: 411, top: 18, width: 135, height: 100 },
  bass: { left: 407, top: 12, width: 138, height: 126 },
  vocal: { left: 433, top: 24, width: 115, height: 100 },
};

export const MemberIcon = styled.span<{ $instrument: TeamInstrument }>`
  position: absolute;
  top: 26px;
  right: 26px;
  width: 78px;
  height: 78px;
  color: #62b9f3;
  pointer-events: none;

  svg,
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    overflow: visible;
    fill: none;
    stroke: currentColor;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (min-width: 1024px) {
    left: ${({ $instrument }) => frame(instrumentGeometry[$instrument].left)};
    top: ${({ $instrument }) => frame(instrumentGeometry[$instrument].top)};
    width: ${({ $instrument }) => frame(instrumentGeometry[$instrument].width)};
    height: ${({ $instrument }) => frame(instrumentGeometry[$instrument].height)};
  }
`;

export const Member = styled.article`
  position: relative;
  width: 560px;
  height: 318px;
  overflow: hidden;
  background: #111;

  > img {
    object-fit: cover;
    opacity: 0.48;
  }

  > div {
    position: absolute;
    inset: auto 0 0;
    padding: 34px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.94));
  }

  h3 {
    margin-top: 6px;
    font-size: 36px;
    font-weight: 500;
  }

  p {
    max-width: 370px;
    margin-top: 10px;
    font-size: 16px;
    line-height: 1.55;
  }

  small {
    color: #1677ff;
    letter-spacing: 0.08em;
  }

  &:last-child {
    grid-column: 2;
  }

  @media (max-width: 1023px) {
    width: 100%;
  }

  @media (min-width: 1024px) {
    width: ${frame(560)};
    height: ${frame(318)};
    border: ${frame(0.698)} solid #3b3b3b;
    border-radius: ${frame(13.965)};
    background: rgba(255, 255, 255, 0.1);

    > div {
      left: ${frame(259.444)};
      top: ${frame(97.452)};
      bottom: auto;
      display: block;
      padding: 0;
      background: none;
    }

    &:nth-child(1) > div,
    &:nth-child(2) > div { width: ${frame(166)}; }
    &:nth-child(3) > div { width: ${frame(180)}; }
    &:nth-child(4) > div { width: ${frame(155)}; }
    &:nth-child(5) > div { width: ${frame(212)}; }
    &:nth-child(6) > div { width: ${frame(152)}; }
    &:nth-child(7) > div { width: ${frame(135)}; }

    &:last-child {
      grid-column: 1;
    }

    small {
      display: block;
      height: ${frame(17)};
      font-size: ${frame(14.422)};
      font-weight: 600;
      line-height: ${frame(16.986)};
      letter-spacing: 0;
      white-space: nowrap;
    }

    h3 {
      width: max-content;
      height: ${frame(42)};
      margin-top: ${frame(7)};
      font-size: ${frame(36)};
      font-weight: 500;
      line-height: ${frame(42.4)};
      letter-spacing: ${frame(1.396)};
    }

    h3::after {
      content: '';
      display: block;
      width: ${frame(98)};
      height: ${frame(3)};
      margin-top: ${frame(8)};
      background: #1677ff;
    }

    p {
      width: 100%;
      margin-top: ${frame(15)};
      color: #bfbfbf;
      font-size: ${frame(16)};
      font-weight: 400;
      line-height: ${frame(18.844)};
    }

    p span {
      display: block;
    }
  }

  @media (max-width: 1023px) {
    width: 100%;

    &:last-child {
      grid-column: auto;
    }
  }

`;

export const Team = styled.section`
  height: 1495px;
  padding: 120px 100px 0;
  background: #000;

  > header {
    text-align: center;

    > p:last-child {
      margin-top: 24px;
      font-size: 22px;
    }
  }

  h2 {
    margin-top: 16px;
    font-size: 80px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.025em;
    white-space: nowrap;
  }

  @media (min-width: 1024px) {
    margin-top: ${frame(100)};
    height: auto;
    min-height: ${frame(1425)};
    padding: 0 ${frame(70)} ${frame(66)};
    position: relative;
    background: transparent;

    > header {
      position: relative;
      left: ${frame(357.5)};
      width: ${frame(1065)};
      height: ${frame(215)};
      text-align: center;

      ${Eyebrow} {
        width: ${frame(171)};
        height: ${frame(33)};
        margin-inline: auto;
        line-height: ${frame(33)};
        letter-spacing: ${frame(2)};
      }

      h2 {
        position: relative;
        width: ${frame(310)};
        height: ${frame(80)};
        margin: ${frame(16)} auto 0;
        font-size: ${frame(80)};
        font-weight: 900;
        line-height: ${frame(80)};
        letter-spacing: ${frame(2)};
      }

      h2::before,
      h2::after {
        content: '';
        position: absolute;
        top: ${frame(38)};
        width: ${frame(300)};
        height: ${frame(5)};
      }

      h2::before {
        right: calc(100% + ${frame(50)});
        background: linear-gradient(90deg, transparent 0%, #1677ff 100%);
      }

      h2::after {
        left: calc(100% + ${frame(50)});
        background: linear-gradient(90deg, #1677ff 0%, transparent 100%);
      }

      > p:last-child {
        width: ${frame(1400)};
        margin-left: ${frame(-167.5)};
        margin-top: ${frame(30)};
        color: #f5f5f5;
        font-size: ${frame(24)};
        font-weight: 500;
        line-height: ${frame(28.267)};
        letter-spacing: ${frame(2)};
        white-space: pre-line;
      }
    }

    ${MemberGrid} {
      position: relative;
      top: auto;
      left: auto;
      height: auto;
      margin-top: ${frame(90)};
    }
  }

  @media (max-width: 1023px) {
    height: auto;
    min-height: unset;
    padding: 80px var(--ky-gutter);
  }

  @media (max-width: 639px) {
    h2 {
      font-size: 48px;
    }
  }
`;

export const Closing = styled.section`
  position: relative;
  height: 460px;
  overflow: hidden;

  img {
    object-fit: cover;
    opacity: 0.45;
  }

  @media (min-width: 1024px) {
    margin-top: ${frame(45)};
    height: ${frame(460)};

    img {
      right: auto;
      width: ${frame(1220)};
      opacity: 0.72;
    }

  }

  @media (max-width: 1023px) {
    height: auto;
    min-height: unset;
    height: 360px;
  }
`;

export const ClosingMedia = styled.div`
  position: absolute;
  inset: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0) 45%, #000 100%);
  }

  @media (min-width: 1024px) {
    left: ${frame(2)};
    width: ${frame(1220)};
    height: ${frame(460)};
  }
`;

export const ClosingCopy = styled.div`
  position: absolute;
  inset: 0 0 0 auto;
  z-index: 1;
  display: flex;
  width: 700px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;

  > p {
    position: static;
    inset: auto;
    display: block;
    place-items: initial;
    font-family: 'KY Productive', 'Paperlogy', sans-serif;
    font-size: 52px;
    font-weight: 400;
    line-height: 1.45;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  @media (max-width: 1919px) {
    width: min(700px, 100%);
    padding-inline: var(--ky-gutter);

    > p {
      max-width: 100%;
      font-size: clamp(30px, 4vw, 52px);
      white-space: normal;
    }
  }

  @media (max-width: 1023px) {
    > p {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      column-gap: 8px;
    }
  }

  @media (min-width: 1024px) {
    position: absolute;
    inset: 0;
    width: ${frame(1920)};
    height: ${frame(460)};
    padding-inline: 0;

    > p {
      position: static;
      max-width: none;
      white-space: nowrap;

      > span {
        position: absolute;
        font-family: 'iceJaram', sans-serif;
        font-size: ${frame(90)};
        font-weight: 400;
        line-height: ${frame(70)};
        letter-spacing: ${frame(2)};
        text-align: right;
        transform: rotate(-4deg);
        transform-origin: center;
      }

      > span:first-child {
        top: 0;
        left: 0;
        width: ${frame(653.771)};
        height: ${frame(103.975)};
      }

      > span:last-child {
        top: ${frame(88.689)};
        left: ${frame(156.88)};
        width: ${frame(496.987)};
        height: ${frame(95.758)};
      }
    }

    > p[data-zone='about-closing-statement'] {
      position: absolute;
      top: ${frame(102)};
      left: ${frame(1151)};
      width: ${frame(653.8664)};
      height: ${frame(184.4474)};
    }
  }
`;

export const ClosingDivider = styled.div`
  display: flex;
  width: 560px;
  align-items: center;
  justify-content: space-between;
  margin-top: 42px;

  span {
    width: 130px;
    height: 3px;
    flex: none;
  }

  span:first-child {
    background: linear-gradient(90deg, transparent 0%, #1677ff 100%);
  }

  span:last-child {
    background: linear-gradient(90deg, #1677ff 0%, transparent 100%);
  }

  strong {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  @media (max-width: 1919px) {
    width: min(560px, 100%);

    span {
      width: clamp(50px, 12vw, 130px);
    }
  }

  @media (min-width: 1024px) {
    position: absolute;
    top: ${frame(318)};
    left: ${frame(1221)};
    width: ${frame(584)};
    height: ${frame(80)};
    margin: 0;

    span {
      width: ${frame(130)};
      height: ${frame(3)};
    }

    strong {
      font-size: ${frame(22)};
      font-weight: 500;
      line-height: ${frame(80)};
      letter-spacing: ${frame(2)};
    }
  }
`;
