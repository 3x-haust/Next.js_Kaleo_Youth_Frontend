'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { Reveal } from '@/components/motion/Motion';

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

export const Page = styled.div`
  --home-bg: #000;
  --home-ink: #f7f9fc;
  --home-copy: #f0f0ee;
  --home-accent: #1677ff;
  --home-scale: 1;

  overflow: hidden;
  color: var(--home-ink);
  background: var(--home-bg);

  @media (min-width: 1024px) and (max-width: 1919px) {
    --home-scale: calc(100vw / 1920px);
  }
`;

export const Eyebrow = styled.p`
  margin-bottom: 18px;
  color: var(--home-accent);
  font-size: clamp(18px, 1.25vw, 24px);
  font-weight: 400;
  letter-spacing: 0.02em;

  @media (min-width: 1024px) {
    font-size: calc(28px * var(--home-scale));
    font-weight: 600;
    line-height: calc(33px * var(--home-scale));
    letter-spacing: 2px;
    white-space: nowrap;
    margin-bottom: calc(16px * var(--home-scale));
  }
`;

export const SectionTitle = styled.h2`
  font-size: clamp(56px, 4.15vw, 80px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.045em;

  @media (min-width: 1024px) {
    font-size: calc(80px * var(--home-scale));
    font-weight: 900;
    line-height: calc(80px * var(--home-scale));
    letter-spacing: 2px;
  }

  @media (max-width: 639px) {
    font-size: 42px;
    line-height: 0.98;
  }
`;

export const Button = styled(Link)`
  min-height: 66px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0px 30px;
  white-space: nowrap;
  border: 1px solid var(--home-accent);
  border-radius: 10px;
  color: var(--home-ink);
  font-size: clamp(16px, 1.25vw, 24px);
  line-height: 1.18;
  font-weight: 500;
  font-family: 'Paperlogy', sans-serif;
  transition: background-color 180ms ease, transform 180ms ease;

  &:hover {
    background: var(--home-accent);
    transform: translateY(-2px);
  }

  @media (min-width: 1024px) {
    min-height: calc(66px * var(--home-scale));
    gap: calc(10px * var(--home-scale));
    padding: 0 calc(30px * var(--home-scale));
    border-radius: calc(10px * var(--home-scale));
    font-size: calc(24px * var(--home-scale));
  }

  @media (max-width: 639px) {
    min-height: 52px;
    padding: 13px 18px;
    font-size: 15px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const ButtonArrow = styled(Image)`
  width: 24px;
  height: 24px;
  flex: none;

  @media (min-width: 1024px) {
    width: calc(24px * var(--home-scale));
    height: calc(24px * var(--home-scale));
  }
`;

export const HeroVideo = styled.video`
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.84;
  pointer-events: none;

  @media (max-width: 639px) {
    object-position: 55% center;
  }
`;

export const HeroShade = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(180deg, rgba(8, 8, 30, 0.16), rgba(8, 8, 30, 0.04));
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 42px;
  animation: ${rise} 800ms ease-out both;

  @media (min-width: 1024px) {
    position: absolute;
    left: calc(92px * var(--home-scale));
    top: calc(271px * var(--home-scale));
    display: block;
    width: calc(1009px * var(--home-scale));
    height: calc(526px * var(--home-scale));

    > ${Button} {
      width: calc(295px * var(--home-scale));
      height: calc(66px * var(--home-scale));
      min-height: calc(66px * var(--home-scale));
      margin-top: calc(60px * var(--home-scale));
    }
  }

  @media (max-width: 639px) {
    gap: 26px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const HeroTitle = styled.h1`
  font-size: clamp(74px, 6.35vw, 122px);
  font-weight: 700;
  line-height: 1.04;
  letter-spacing: -0.04em;

  span {
    display: block;
    color: #1677ff;
  }

  @media (min-width: 1024px) {
    width: calc(759px * var(--home-scale));
    height: calc(280px * var(--home-scale));
    font-size: calc(120px * var(--home-scale));
    font-weight: 600;
    line-height: calc(140px * var(--home-scale));
    letter-spacing: -1px;
  }

  @media (max-width: 639px) {
    font-size: 50px;
  }
`;

export const HeroLead = styled.p`
  color: rgba(238, 242, 247, 0.65);
  font-size: clamp(21px, 1.35vw, 26px);
  line-height: 1.38;

  @media (min-width: 1024px) {
    width: calc(463px * var(--home-scale));
    height: calc(80px * var(--home-scale));
    margin-top: calc(40px * var(--home-scale));
    font-size: calc(34px * var(--home-scale));
    line-height: normal;
  }

  @media (max-width: 639px) {
    font-size: 17px;
  }
`;

export const Hero = styled.section`
  position: relative;
  min-height: min(100vh, 1080px);
  display: flex;
  align-items: center;
  padding: 104px 92px 100px;
  border-bottom: 0;
  background: #fff;

  &::before {
    position: absolute;
    inset: 0;
    z-index: 2;
    content: '';
    background: transparent;
    pointer-events: none;
  }

  @media (min-width: 1024px) {
    display: block;
    padding: 0;
    height: calc(1080px * var(--home-scale));
    min-height: calc(1080px * var(--home-scale));
  }

  @media (max-width: 1200px) {
    padding-inline: 56px;
  }

  @media (max-width: 639px) {
    min-height: 720px;
    padding-top: 120px;
    padding-inline: 20px;
  }
`;

export const HeroUnderGlow = styled.div`
  position: absolute;
  z-index: 4;
  bottom: 0;
  left: 1px;
  width: 100%;
  height: 3px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0) 0%,
    #3b82f6 50%,
    rgba(59, 130, 246, 0) 100%
  );
`;

export const Section = styled.section`
  position: relative;
  padding-inline: 100px;

  @media (min-width: 1024px) {
    padding-inline: calc(100px * var(--home-scale));
  }

  @media (max-width: 1023px) {
    padding-inline: 56px;
  }

  @media (max-width: 639px) {
    padding-inline: 20px;
  }
`;

export const AboutEffect = styled.div`
  position: absolute;
  inset: 0;
  background: #000;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/images/sections/about-bg.jpg') center / cover no-repeat;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 1) 50%, rgba(59, 130, 246, 0) 100%);
  }

  @media (min-width: 640px) and (max-width: 1023px) {
    &::before {
      background-position: 72% center;
    }
  }
`;

export const GrowArtwork = styled.span`
  position: absolute;
  left: 183px;
  top: 179px;
  z-index: 1;
  width: 769px;
  height: 369px;
  background-image: image-set(url('/images/exact/we-grow-cal.png') 1x, url('/images/exact/we-grow-cal@2x.png') 2x);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 770px 370px;

  @media (min-width: 1024px) {
    left: calc(183px * var(--home-scale));
    top: calc(179px * var(--home-scale));
    width: calc(769px * var(--home-scale));
    height: calc(369px * var(--home-scale));
    background-size: calc(770px * var(--home-scale)) calc(370px * var(--home-scale));
  }

  @media (min-width: 640px) and (max-width: 1023px) {
    display: none;
  }

  @media (max-width: 639px) {
    top: auto;
    bottom: 72px;
    left: 20px;
    width: calc(100% - 40px);
    height: 164px;
    background-position: center;
    background-size: contain;
  }
`;

export const SrOnlyText = styled.span`
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

export const GrowMark = styled(Reveal)`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: max-content;
  margin-left: 95px;
  transform: translateY(-34px) rotate(-9deg);
  color: #f7f9fc;
  font-size: clamp(78px, 6.65vw, 128px);
  font-weight: 700;
  line-height: 0.72;
  letter-spacing: -0.065em;

  span:nth-child(2) {
    margin-left: 12%;
  }

  span:last-child {
    margin-left: 20%;
    color: transparent;
    background-image: linear-gradient(104deg, #1677ff 8%, #08b8ff 52%, #3ce7ff 92%);
    background-clip: text;
  }

  @media (min-width: 1024px) {
    position: absolute;
    left: calc(183px * var(--home-scale));
    top: calc(179px * var(--home-scale));
    margin: 0;
    transform: none;
    font-weight: 900;
    letter-spacing: -1px;
    line-height: calc(145px * var(--home-scale));
    width: calc(600px * var(--home-scale));
    height: calc(400px * var(--home-scale));
    font-family: ${({ theme }) => theme.font.display};

    img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: contain;
      transform: rotate(-6deg);
      transform-origin: left center;
    }
  }

  @media (min-width: 640px) {
    > p:not(${Eyebrow}),
    blockquote {
      white-space: nowrap;
    }
  }

  @media (max-width: 1200px) {
    margin-left: 0;
  }

  @media (max-width: 639px) {
    width: 100%;
    margin: 0;
    transform: rotate(-6deg);
    font-size: clamp(58px, 17.5vw, 76px);
  }
`;

export const AboutCopy = styled(Reveal)`
  position: relative;
  z-index: 1;
  justify-self: end;
  width: min(100%, 646px);
  padding-right: 72px;
  transform: translateY(-34px);

  > p:not(${Eyebrow}) {
    margin-top: 42px;
    color: var(--home-copy);
    font-size: clamp(17px, 1.1vw, 21px);
    line-height: 1.52;

    > span {
      display: block;
    }
  }

  strong {
    color: var(--home-accent);
    font-weight: inherit;
  }

  blockquote {
    margin-top: 42px;
    padding-left: 20px;
    border-left: 3px solid var(--home-accent);
    font-size: clamp(15px, 0.9vw, 18px);
    line-height: 1.55;

    > span {
      display: block;
    }
  }

  @media (min-width: 640px) {
    > p:not(${Eyebrow}) > span,
    blockquote > span {
      white-space: nowrap;
    }
  }

  @media (min-width: 1024px) {
    position: absolute;
    left: calc(1173px * var(--home-scale));
    top: calc(135px * var(--home-scale));
    width: calc(483px * var(--home-scale));
    height: calc(427px * var(--home-scale));
    padding: 0;
    transform: none;

    > p:not(${Eyebrow}) {
      translate: 0 -2px;
    }

    ${Eyebrow} {
      width: calc(166px * var(--home-scale));
      font-size: calc(28px * var(--home-scale));
      line-height: normal;
    }

    ${SectionTitle} {
      width: calc(360px * var(--home-scale));
      height: calc(160px * var(--home-scale));
      white-space: nowrap;
    }

    blockquote {
      width: calc(348px * var(--home-scale));
      height: calc(42px * var(--home-scale));
      margin-top: calc(38.281px * var(--home-scale));
      line-height: calc(21px * var(--home-scale));
    }
  }

  @media (max-width: 1200px) {
    padding-right: 0;
  }

  @media (max-width: 900px) {
    justify-self: start;
  }

  @media (min-width: 640px) and (max-width: 900px) {
    > p:not(${Eyebrow}) {
      font-size: clamp(14px, 2.15vw, 17px);
    }

    blockquote {
      font-size: 14px;
    }
  }

  @media (max-width: 639px) {
    > p {
      font-size: 15px;
    }
  }
`;

export const About = styled(Section)`
  min-height: 727px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  overflow: hidden;
  border-bottom: 0;

  @media (min-width: 1024px) {
    position: relative;
    display: block;
    min-height: calc(727px * var(--home-scale));
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 639px) {
    min-height: 727px;
    align-content: center;
    gap: 56px;
  }
`;

export const SectionIntro = styled(Reveal)`
  align-self: start;
  padding-top: 134px;

  > p:last-child {
    margin-top: 42px;
    padding-left: 20px;
    border-left: 3px solid var(--home-accent);
    color: #f7f9fc;
    font-size: clamp(17px, 1.05vw, 20px);
    line-height: 1.5;
  }

  @media (min-width: 1024px) {
    position: absolute;
    left: calc(100px * var(--home-scale));
    top: calc(135px * var(--home-scale));
    width: calc(527px * var(--home-scale));
    padding-top: 0;

    ${Eyebrow} {
      width: calc(154px * var(--home-scale));
      margin-top: 0;
    }

    ${SectionTitle} {
      width: calc(525px * var(--home-scale));
      height: calc(160px * var(--home-scale));
      margin-top: calc(16px * var(--home-scale));
      font-size: calc(80px * var(--home-scale));
      font-weight: 900;
      line-height: calc(80px * var(--home-scale));
      letter-spacing: 2px;
      white-space: nowrap;
    }

    > p:last-child {
      width: calc(465px * var(--home-scale));
      height: calc(26px * var(--home-scale));
      margin-top: calc(40px * var(--home-scale));
      margin-left: 0;
      padding-left: calc(20px * var(--home-scale));
      border-left-width: calc(3px * var(--home-scale));
      font-size: calc(22px * var(--home-scale));
      line-height: calc(26px * var(--home-scale));
    }
  }

  @media (max-width: 639px) {
    padding-top: 0;
  }
`;

export const FeatureFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;

  @media (min-width: 1024px) {
    height: calc(558px * var(--home-scale));
    aspect-ratio: auto;
  }
`;

export const DateLine = styled.p`
  font-size: clamp(16px, 1vw, 20px);

  @media (min-width: 1024px) {
    font-size: calc(22px * var(--home-scale));
    font-weight: 600;
    line-height: calc(32px * var(--home-scale));
    color: #ffffff;
  }
`;

export const FeatureDetail = styled.div`
  margin-top: 42px;
  padding-left: 22px;
  font-size: clamp(15px, 0.9vw, 18px);
  line-height: 1.55;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: calc(10px * var(--home-scale));
    margin-top: 0;
    padding-left: calc(20px * var(--home-scale));
    border-left: calc(3px * var(--home-scale)) solid var(--home-accent);
    font-size: calc(20px * var(--home-scale));
    line-height: calc(32px * var(--home-scale));
    transform: translateY(2px);

    p:first-child {
      font-size: calc(30px * var(--home-scale));
      font-weight: 600;
    }

    p:last-child {
      font-size: calc(20px * var(--home-scale));
      font-weight: 500;
    }
  }
`;

export const FeatureHeading = styled.div`
  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: calc(10px * var(--home-scale));
  }
`;

export const FeatureText = styled.div`
  @media (min-width: 1024px) {
    display: flex;
    width: calc(700px * var(--home-scale));
    flex-direction: column;
    gap: calc(30px * var(--home-scale));
  }
`;

export const FeatureMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 28px;
  margin-top: 42px;

  h3 {
    margin-top: 12px;
    font-size: clamp(38px, 2.6vw, 50px);
    font-weight: 700;
    line-height: 1.14;
  }

  @media (min-width: 1024px) {
    margin-top: calc(40px * var(--home-scale));

    h3 {
      margin-top: 0;
      font-size: calc(50px * var(--home-scale));
      font-weight: 900;
      line-height: normal;
      letter-spacing: 2px;
      transform: translateY(1px);
    }

    ${Button} {
      position: absolute;
      right: -1px;
      top: calc(668px * var(--home-scale));
      width: calc(260px * var(--home-scale));
      height: calc(66px * var(--home-scale));
      min-height: calc(66px * var(--home-scale));
      border-radius: calc(10px * var(--home-scale));
      font-size: calc(24px * var(--home-scale));
      font-weight: 500;
    }
  }

  @media (max-width: 639px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const Feature = styled(Reveal)`
  width: min(100%, 1010px);

  @media (min-width: 1024px) {
    position: absolute;
    left: calc(820px * var(--home-scale));
    top: calc(135px * var(--home-scale));
    width: calc(1000px * var(--home-scale));
  }

  @media (min-width: 1024px) {
    height: calc(803px * var(--home-scale));

    > img {
      width: calc(1000px * var(--home-scale));
      height: calc(558px * var(--home-scale));
      max-width: none;
      aspect-ratio: auto;
      object-fit: none;
      object-position: center;
      border: 0;
    }
  }
`;

export const MessageEmptyCopy = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  max-width: 640px;
  flex-direction: column;
  gap: 14px;

  > p:first-child {
    color: var(--home-accent);
    font-size: clamp(14px, 1vw, 18px);
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  h3 {
    max-width: 11em;
    font-size: clamp(34px, 3vw, 58px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.035em;
    text-wrap: balance;
  }

  > p:last-child {
    color: rgba(247, 249, 252, 0.7);
    font-size: clamp(16px, 1.15vw, 21px);
    line-height: 1.65;
  }
`;

export const MessageEmpty = styled(Reveal)`
  position: relative;
  min-height: 480px;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
  padding: clamp(32px, 4vw, 64px);
  border: 1px solid rgba(96, 165, 250, 0.34);
  border-radius: 16px;
  background:
    radial-gradient(circle at 88% 12%, rgba(22, 119, 255, 0.28), transparent 38%),
    linear-gradient(145deg, rgba(8, 19, 45, 0.96), rgba(2, 8, 22, 0.88));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);

  &::before {
    position: absolute;
    right: -0.05em;
    bottom: -0.22em;
    content: 'MESSAGE';
    color: transparent;
    font-size: clamp(74px, 9vw, 150px);
    font-weight: 900;
    letter-spacing: -0.07em;
    line-height: 1;
    -webkit-text-stroke: 1px rgba(96, 165, 250, 0.16);
    pointer-events: none;
  }

  &::after {
    position: absolute;
    top: 0;
    left: clamp(32px, 4vw, 64px);
    width: min(220px, 30%);
    height: 3px;
    content: '';
    background: linear-gradient(90deg, var(--home-accent), rgba(22, 119, 255, 0));
  }

  > span {
    position: relative;
    z-index: 1;
    color: rgba(247, 249, 252, 0.56);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.2em;
  }

  ${Button} {
    position: relative;
    z-index: 1;
  }

  @media (min-width: 1024px) {
    position: absolute;
    left: calc(820px * var(--home-scale));
    top: calc(135px * var(--home-scale));
    width: calc(1000px * var(--home-scale));
    height: calc(803px * var(--home-scale));
    min-height: calc(803px * var(--home-scale));
    padding: calc(64px * var(--home-scale));
    border-radius: calc(16px * var(--home-scale));

    ${MessageEmptyCopy} {
      gap: calc(14px * var(--home-scale));

      > p:first-child {
        font-size: calc(18px * var(--home-scale));
      }

      h3 {
        font-size: calc(58px * var(--home-scale));
      }

      > p:last-child {
        font-size: calc(21px * var(--home-scale));
      }
    }

    ${Button} {
      min-height: calc(66px * var(--home-scale));
      padding-inline: calc(30px * var(--home-scale));
      border-radius: calc(10px * var(--home-scale));
      font-size: calc(24px * var(--home-scale));
    }
  }

  @media (max-width: 639px) {
    min-height: 420px;
    gap: 32px;
    padding: 32px 24px;

    &::after {
      left: 24px;
    }

    ${MessageEmptyCopy} h3 {
      font-size: 34px;
    }
  }
`;

export const Message = styled(Section)`
  min-height: 1073px;
  display: grid;
  grid-template-columns: 0.72fr 1.28fr;
  align-items: center;
  gap: 86px;
  background: linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(2, 36, 89) 65.38%);

  @media (min-width: 1024px) {
    display: block;
    min-height: calc(1073px * var(--home-scale));
    padding: 0;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 639px) {
    min-height: 939px;
    gap: 64px;
    padding-block: 80px;
  }
`;

export const WorshipShade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to left,
    #000 0%,
    rgba(8, 8, 30, 0.4) 55%,
    rgba(8, 8, 30, 0.2) 100%
  );

  @media (max-width: 900px) {
    background: rgba(0, 0, 0, 0.62);
  }
`;

export const WorshipCopy = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;

  > p:not(${Eyebrow}) {
    margin-top: 42px;
    color: #f7f9fc;
    font-size: clamp(17px, 1.05vw, 20px);
    line-height: 1.5;
  }

  ${Button} {
    margin-top: 94px;
  }

  @media (min-width: 1024px) {
    position: absolute;
    right: calc(77px * var(--home-scale));
    top: calc(129px * var(--home-scale));
    width: calc(590px * var(--home-scale));
    height: calc(361px * var(--home-scale));
    transform: none;

    ${Eyebrow} {
      width: calc(280px * var(--home-scale));
      margin-left: auto;
      transform: none;
      transform-origin: right center;
    }

    ${SectionTitle} {
      width: calc(590px * var(--home-scale));
      margin-left: auto;
      transform: none;
      transform-origin: right center;
      white-space: nowrap;
    }

    > p:not(${Eyebrow}) {
      margin-top: calc(40px * var(--home-scale));
      margin-right: calc(23px * var(--home-scale));
      padding-right: calc(20px * var(--home-scale));
      border-right: calc(3px * var(--home-scale)) solid var(--home-accent);
      font-size: calc(22px * var(--home-scale));
      line-height: normal;
      translate: 2px -1px;
      white-space: nowrap;
    }

    ${Button} {
      width: calc(255px * var(--home-scale));
      margin-top: calc(100px * var(--home-scale));
      translate: 1px -2px;
    }
  }

  @media (max-width: 639px) {
    align-items: flex-start;
    text-align: left;

    > p:not(.eyebrow) {
      padding: 0 0 0 16px;
      border-right: 0;
      border-left: 2px solid var(--home-accent);
    }

    ${Button} {
      margin-top: 48px;
    }
  }
`;

export const Worship = styled(Section)`
  min-height: 620px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 76px;
  background: #000;

  > img {
    position: absolute;
    inset: 0 auto 0 0;
    width: 64%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  @media (min-width: 1024px) {
    min-height: calc(620px * var(--home-scale));
    padding-right: calc(76px * var(--home-scale));

    > img {
      inset: 0 auto 0 2px;
      width: calc(1220px * var(--home-scale));
      height: calc(620px * var(--home-scale));
      object-position: 50% calc(50% - calc(0.5px * var(--home-scale)));
    }

    ${WorshipShade} {
      inset: 0 auto 0 2px;
      width: calc(1220px * var(--home-scale));
      height: calc(620px * var(--home-scale));
      background: linear-gradient(
        -89.259382deg,
        #000 1.6186%,
        rgba(8, 8, 30, 0.4) 54.092%,
        rgba(8, 8, 30, 0.2) 99.674%
      );
    }
  }

  @media (max-width: 900px) {
    > img {
      width: 100%;
    }
  }

  @media (max-width: 639px) {
    min-height: 620px;
    justify-content: flex-start;
    padding-right: 20px;
  }
`;

export const GalleryHeading = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;

  ${Eyebrow} {
    @media (min-width: 1024px) {
      width: calc(146px * var(--home-scale));
    }
  }

  ${SectionTitle} {
    @media (min-width: 1024px) {
      width: calc(590px * var(--home-scale));
      transform: none;
      transform-origin: left center;
    }
  }

  ${Button} {
    @media (min-width: 1024px) {
      width: calc(205px * var(--home-scale));
    }
  }

  @media (max-width: 639px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const StoryGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
  margin-top: 90px;

  > :nth-child(4) img {
    filter: none;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, calc(450px * var(--home-scale)));
    gap: calc(30px * var(--home-scale));
    margin-top: calc(90px * var(--home-scale));
    width: calc(1890px * var(--home-scale));
    height: calc(500px * var(--home-scale));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 639px) {
    grid-template-columns: 1fr;
    margin-top: 56px;
  }
`;

export const Story = styled(Link)`
  position: relative;
  min-height: 505px;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 395px;
    object-fit: fill;
    transition: transform 450ms ease;
  }

  &:hover img {
    transform: scale(1.04);
  }

  &[data-authored-visual='true']:hover img {
    transform: none;
  }

  > span {
    position: absolute;
    inset: auto 0 0;
    width: 100%;
    min-height: 105px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 4px;
    padding: 16px 28px 20px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5) 34%);
  }

  strong,
  small {
    display: block;
  }

  strong {
    font-size: 30px;
    font-weight: 400;
    letter-spacing: 2px;
    line-height: 1.07;
    color: #f7f9fc;
  }

  small {
    color: rgba(247, 249, 252, 0.65);
    font-size: 18px;
    letter-spacing: 2px;
    line-height: 24px;
  }

  &:nth-child(2) img,
  &:nth-child(3) img,
  &:nth-child(4) img {
    object-position: center center;
  }

  @media (min-width: 1024px) {
    width: calc(450px * var(--home-scale));
    height: calc(500px * var(--home-scale));
    min-height: calc(500px * var(--home-scale));
    box-sizing: border-box;
    border: 0;
    outline: 1px solid #ebebeb;

    > span {
      min-height: calc(105px * var(--home-scale));
      box-sizing: border-box;
      padding: calc(16px * var(--home-scale)) calc(30px * var(--home-scale)) calc(20px * var(--home-scale));
      background: rgba(0, 0, 0, 0.5);
    }

    strong {
      font-size: calc(30px * var(--home-scale));
      letter-spacing: 2px;
      translate: 0 0;
    }

    small {
      margin-top: 0;
      color: #bfbfbf;
      font-size: calc(20px * var(--home-scale));
      letter-spacing: 2px;
      translate: 0 0;
    }

    img {
      height: calc(500px * var(--home-scale));
      object-fit: cover;
    }

    &[data-authored-visual='true'] img {
      object-fit: fill;
    }
  }

  @media (max-width: 639px) {
    min-height: 365px;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }
`;

export const Gallery = styled(Section)`
  min-height: 1069px;
  padding-top: 104px;
  overflow: hidden;

  @media (min-width: 1024px) {
    min-height: calc(1069px * var(--home-scale));
    padding-top: calc(135px * var(--home-scale));
  }

  @media (max-width: 639px) {
    min-height: auto;
    padding-block: 80px;
  }
`;

export const GalleryBackground = styled(Image)`
  top: -225.194% !important;
  z-index: 0;
  width: 100% !important;
  height: 318% !important;
  pointer-events: none;
`;

export const Empty = styled.p`
  margin-top: 34px;
  color: var(--home-copy);
`;

export const ContactIcon = styled(Image)`
  width: 24px;
  height: 24px;
  flex: none;
`;

export const Social = styled.div`
  margin-bottom: 60px;
  font-size: clamp(17px, 1vw, 20px);
  line-height: 1.8;

  svg {
    width: 20px;
    height: 20px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  h3 {
    margin-bottom: 16px;
    font-size: 22px;
    font-weight: 700;
  }

  @media (min-width: 1024px) {
    margin-bottom: calc(61px * var(--home-scale));
    margin-top: 2px;
    font-size: calc(24px * var(--home-scale));
    line-height: calc(38px * var(--home-scale));

    h3 {
      margin-bottom: calc(20px * var(--home-scale));
      font-size: calc(24px * var(--home-scale));
      font-weight: 500;
      line-height: calc(28px * var(--home-scale));
    }
  }
`;

export const SocialLink = styled(Link)`
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 10px;
  color: inherit;
  transition: color 180ms ease;

  &:hover,
  &:focus-visible {
    color: var(--home-accent);
    outline: 0;
  }
`;

export const ContactActions = styled.div`
  display: flex;
  gap: 36px;

  ${Button} {
    @media (min-width: 1024px) {
      padding: calc(12px * var(--home-scale)) calc(29px * var(--home-scale));
      font-size: calc(24px * var(--home-scale));
      font-weight: 500;
    }
  }

  ${Button}:first-child {
    @media (min-width: 1024px) {
      width: calc(290px * var(--home-scale));
    }
  }

  ${Button}:last-child {
    @media (min-width: 1024px) {
      width: calc(220px * var(--home-scale));
    }
  }

  @media (max-width: 639px) {
    flex-wrap: wrap;
    gap: 14px;
  }
`;

export const ContactCopy = styled(Reveal)`
  align-self: start;
  padding-top: 140px;

  ${SectionTitle} {
    color: #f7f9fc;
  }

  dl {
    display: grid;
    gap: 22px;
    margin: 64px 0 100px;
    font-size: clamp(17px, 1vw, 20px);

    > div {
      display: grid;
      grid-template-columns: 132px 1fr;
      gap: 18px;
    }
  }

  dt {
    display: flex;
    align-items: center;
    color: #f7f9fc;
    white-space: nowrap;

    span {
      display: flex;
      align-items: center;
      color: var(--home-accent);
      margin-right: 10px;
    }

    svg {
      width: 20px;
      height: 20px;
      flex: none;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  @media (min-width: 1024px) {
    position: relative;
    top: calc(135px * var(--home-scale));
    padding-top: 0;

    ${Eyebrow} {
      transform: none;
    }

    ${SectionTitle} {
      color: rgb(196, 218, 244);
      transform: none;
      white-space: nowrap;
    }

    dl {
      gap: calc(25px * var(--home-scale));
      margin: calc(59px * var(--home-scale)) 0 calc(126px * var(--home-scale));
      translate: 1px calc(6px * var(--home-scale));

      > div {
        grid-template-columns: calc(132px * var(--home-scale)) 1fr;
        gap: calc(13px * var(--home-scale));
      }
    }

    dt,
    dd {
      font-size: calc(24px * var(--home-scale));
      line-height: calc(28px * var(--home-scale));
    }

    dt {
      font-weight: 300;
    }

    dd {
      font-weight: 500;
    }
  }

  @media (max-width: 639px) {
    padding-top: 0;

    dl > div {
      grid-template-columns: 1fr;
      gap: 2px;
    }
  }
`;

export const InteractiveMap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 697px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(22, 119, 255, 0.42);
  background: #071126;

  &::before,
  &::after {
    position: absolute;
    z-index: 1;
    inset: 0;
    content: '';
    pointer-events: none;
  }

  &::before {
    background:
      linear-gradient(135deg, rgba(22, 119, 255, 0.16), transparent 46%),
      radial-gradient(circle at 72% 18%, rgba(88, 166, 255, 0.16), transparent 38%);
    mix-blend-mode: screen;
  }

  &::after {
    box-shadow:
      inset 0 0 0 1px rgba(247, 249, 252, 0.1),
      inset 0 0 92px rgba(1, 8, 26, 0.72);
  }

  @media (max-width: 639px) {
    min-height: 430px;
  }
`;

export const ContactVisual = styled(Reveal)`
  min-height: 697px;

  @media (min-width: 1024px) {
    width: calc(847px * var(--home-scale));
    height: calc(695px * var(--home-scale));
    transform: none;
  }

  @media (max-width: 639px) {
    min-height: 430px;
  }
`;

export const Contact = styled(Section)`
  min-height: 965px;
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  align-items: center;
  gap: 99px;
  background:
    radial-gradient(
      ellipse 72vw 58% at 0% 100%,
      rgba(2, 36, 89, 0.42) 0%,
      rgba(2, 36, 89, 0.2) 42%,
      rgba(0, 0, 0, 0) 78%
    ),
    #000;

  &::before {
    position: absolute;
    top: -358px;
    left: -727px;
    width: 2406.276px;
    height: 884.195px;
    content: '';
    pointer-events: none;
    background: url('/images/effects/contact-background.svg') center / 100% 100% no-repeat;
  }

  @media (min-width: 1024px) {
    position: relative;
    min-height: calc(965px * var(--home-scale));
    grid-template-columns: calc(773px * var(--home-scale)) calc(847px * var(--home-scale));

    &::before {
      top: calc(-358px * var(--home-scale));
      left: calc(-727px * var(--home-scale));
      width: calc(2406.276px * var(--home-scale));
      height: calc(884.195px * var(--home-scale));
    }

    ${ContactCopy} {
      position: absolute;
      top: calc(135px * var(--home-scale));
      left: calc(100px * var(--home-scale));
      width: calc(724px * var(--home-scale));
      height: calc(695px * var(--home-scale));
    }

    ${ContactVisual} {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transform: none;
      pointer-events: none;

      > ${InteractiveMap} {
        position: absolute;
        top: calc(135px * var(--home-scale));
        left: calc(973px * var(--home-scale));
        width: calc(847px * var(--home-scale));
        height: calc(695px * var(--home-scale));
        min-height: 0;
        pointer-events: auto;
      }
    }
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 639px) {
    min-height: auto;
    gap: 70px;
    padding-block: 80px;
  }
`;

export const StoryPlaceholder = styled.div`
  width: 100%;
  height: 395px;
  background:
    radial-gradient(circle at 30% 25%, rgba(22, 119, 255, 0.24), transparent 45%),
    linear-gradient(135deg, #08081e, #02020a);
`;

export const StoryCell = styled(Reveal)`
  height: 100%;

  > a {
    display: block;
    height: 100%;
  }
`;
