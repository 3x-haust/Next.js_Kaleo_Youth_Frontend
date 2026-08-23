'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { GALLERY_STRIP } from '@/lib/images';
import { SITE } from '@/lib/site';

const MEANING = [
  {
    letter: 'K',
    title: 'Called',
    body: '헬라어 καλέω(칼레오)는 "부르다"라는 뜻입니다. 우리는 스스로 모인 것이 아니라 하나님의 부르심으로 모였습니다.',
  },
  {
    letter: 'Y',
    title: 'Youth',
    body: '중·고등학생 시기를 신앙의 준비 기간이 아니라 지금 하나님과 동행하는 시간으로 살아갑니다.',
  },
  {
    letter: 'P',
    title: 'Purpose',
    body: '각자에게 주신 은사와 자리에서 그분의 목적을 위해 살아가는 청소년이 되기를 소망합니다.',
  },
];

export const Vision = styled.div`
  text-align: center;
  max-width: 720px;
  margin: 0 auto;

  blockquote {
    font-family: ${({ theme }) => theme.font.display};
    font-size: 32px;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.primary};

    @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
      font-size: 23px;
    }
  }

  p {
    margin-top: 18px;
    font-size: 16.5px;
    line-height: 1.85;
    color: ${({ theme }) => theme.colors.body};
  }
`;

const MeaningGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 48px;
`;

const MeaningItem = styled.div`
  padding: 28px 24px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.white};

  b {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.font.display};
    font-size: 20px;
    margin-bottom: 16px;
  }

  h3 {
    font-family: ${({ theme }) => theme.font.display};
    font-size: 19px;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
  }

  p {
    font-size: 15px;
    line-height: 1.8;
    color: ${({ theme }) => theme.colors.body};
  }
`;

export function KaleoMeaning() {
  return (
    <MeaningGrid>
      {MEANING.map((item) => (
        <MeaningItem key={item.letter}>
          <b aria-hidden>{item.letter}</b>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </MeaningItem>
      ))}
    </MeaningGrid>
  );
}

const InfoGrid = styled.dl`
  display: grid;
  gap: 1px;
  background: ${({ theme }) => theme.colors.line};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  grid-template-columns: 160px 1fr;

  dt,
  dd {
    background: ${({ theme }) => theme.colors.white};
    padding: 18px 22px;
    font-size: 15.5px;
    line-height: 1.7;
  }

  dt {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryTint};
  }

  dd {
    color: ${({ theme }) => theme.colors.body};
  }

  a {
    color: ${({ theme }) => theme.colors.primarySoft};
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr;

    dt {
      padding-bottom: 8px;
    }
  }
`;

export function WorshipInfo() {
  return (
    <InfoGrid>
      <dt>예배 시간</dt>
      <dd>{SITE.worship.time}</dd>

      <dt>예배 장소</dt>
      <dd>{SITE.worship.place}</dd>

      <dt>대상</dt>
      <dd>중학교 1학년 ~ 고등학교 3학년</dd>

      <dt>섬기는 분들</dt>
      <dd>
        {SITE.leaders.map((leader) => `${leader.name} (${leader.role})`).join(' · ')}
      </dd>

      <dt>하위 조직</dt>
      <dd>{SITE.team.label}</dd>

      <dt>교회 주소</dt>
      <dd>{SITE.contact.address}</dd>

      <dt>문의 전화</dt>
      <dd>
        {SITE.contact.phones.map((phone, index) => (
          <span key={phone}>
            {index > 0 ? ' · ' : ''}
            <a href={`tel:${phone.replace(/\./g, '')}`}>{phone}</a>
          </span>
        ))}
      </dd>
    </InfoGrid>
  );
}

const LeaderGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  max-width: 640px;
  margin: 0 auto;
`;

const LeaderCard = styled.div`
  padding: 30px 24px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.white};

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primaryTint};
    color: ${({ theme }) => theme.colors.primary};
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  strong {
    display: block;
    font-size: 18px;
    color: ${({ theme }) => theme.colors.ink};
  }

  em {
    display: block;
    margin-top: 6px;
    font-style: normal;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

export function Leaders() {
  return (
    <LeaderGrid>
      {SITE.leaders.map((leader) => (
        <LeaderCard key={leader.name}>
          <span aria-hidden>{leader.name.charAt(0)}</span>
          <strong>{leader.name}</strong>
          <em>{leader.role}</em>
        </LeaderCard>
      ))}
    </LeaderGrid>
  );
}

const Strip = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const Shot = styled.figure`
  position: relative;
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.colors.bgSoft};

  img {
    object-fit: cover;
  }

  figcaption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 32px 16px 14px;
    background: ${({ theme }) => theme.overlay.card};
    color: ${({ theme }) => theme.colors.white};
    font-size: 14px;
    font-weight: 600;
  }
`;

export function PhotoStrip() {
  return (
    <Strip>
      {GALLERY_STRIP.map((photo) => (
        <Shot key={photo.src}>
          <Image
            src={photo.src}
            alt={photo.caption}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <figcaption>{photo.caption}</figcaption>
        </Shot>
      ))}
    </Strip>
  );
}
