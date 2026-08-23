'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { IMAGES } from '@/lib/images';
import { SITE } from '@/lib/site';
import { ButtonLink, Container } from '../ui/primitives';

const Wrap = styled.section`
  position: relative;
  min-height: 560px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgDeep};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    min-height: 460px;
  }
`;

const Photo = styled(Image)`
  object-fit: cover;
  object-position: center 40%;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.overlay.hero};
`;

const Inner = styled(Container)`
  position: relative;
  padding-top: 60px;
  padding-bottom: 60px;
  color: ${({ theme }) => theme.colors.white};
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
`;

const Eyebrow = styled.p`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 15px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 20px;
`;

const Slogan = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  color: ${({ theme }) => theme.colors.white};
  font-size: 50px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: 0.01em;
  text-shadow: 0 3px 22px rgba(0, 0, 0, 0.45);

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    font-size: 31px;
  }
`;

const Korean = styled.p`
  margin-top: 20px;
  font-size: 17px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.45);

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    font-size: 15px;
  }
`;

const WorshipInfo = styled.p`
  margin-top: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10px 20px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  font-size: 15px;
  color: ${({ theme }) => theme.colors.white};
  backdrop-filter: blur(4px);

  b {
    font-weight: 700;
  }
`;

const Actions = styled.div`
  margin-top: 32px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Ghost = styled(ButtonLink)`
  background: rgba(255, 255, 255, 0.12);
  color: ${({ theme }) => theme.colors.white};
  border-color: rgba(255, 255, 255, 0.45);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.22);
  }
`;

export function Hero() {
  return (
    <Wrap>
      <Photo src={IMAGES.home} alt="" fill sizes="100vw" priority quality={82} />
      <Overlay />
      <Inner>
        <Eyebrow>{SITE.church} 청소년부</Eyebrow>
        <Slogan>{SITE.slogan}</Slogan>
        <Korean>{SITE.sloganKo}</Korean>
        <WorshipInfo>
          <b>{SITE.worship.time}</b>
          <span aria-hidden>·</span>
          <span>{SITE.worship.place}</span>
        </WorshipInfo>
        <Actions>
          <ButtonLink href="/about" $variant="accent">
            KALEO YOUTH 소개
          </ButtonLink>
          <Ghost href="/sermons" $variant="outline">
            지난 말씀 보기
          </Ghost>
        </Actions>
      </Inner>
    </Wrap>
  );
}
