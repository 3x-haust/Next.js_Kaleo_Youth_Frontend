'use client';

import Link from 'next/link';
import styled from 'styled-components';

const frame = (px: number) => {
  const at1024 = px * 1024 / 1920;
  const vw = px / 19.2;
  const format = (value: number) => Number(value.toFixed(8)).toString();
  return `clamp(${format(at1024)}px, ${format(vw)}vw, ${format(px)}px)`;
};

export const EmptyPage = styled.main`
  min-height: 100vh;
  padding: clamp(9rem, 12vw, 14.375rem) var(--ky-gutter) 8rem;
  color: var(--ky-ink);
  background:
    radial-gradient(circle at 82% 22%, rgba(22, 119, 255, 0.18), transparent 32%),
    var(--ky-listing-field);
  border-bottom: 3px solid transparent;
  border-image: var(--ky-listing-edge) 1;
`;

export const EmptyEyebrow = styled.p`
  color: var(--ky-blue);
  font-size: clamp(1rem, 1.45vw, 1.75rem);
  font-weight: 600;
  letter-spacing: 0.08em;
`;

export const EmptyTitle = styled.h1`
  margin-top: 1rem;
  font-size: clamp(2.75rem, 4.2vw, 5rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.035em;
`;

export const EmptyState = styled.div`
  display: flex;
  min-height: 30rem;
  align-items: center;
  gap: 1.25rem;
  border-top: 1px solid rgba(247, 249, 252, 0.16);
  margin-top: clamp(4rem, 8vw, 8rem);
  color: rgba(247, 249, 252, 0.74);

  span {
    width: 3rem;
    height: 3px;
    background: var(--ky-blue);
  }

  strong {
    color: #f7f9fc;
    font-size: clamp(1.5rem, 2.2vw, 2.25rem);
    font-weight: 500;
  }

  @media (max-width: 639px) {
    min-height: 20rem;
    margin-top: 4rem;
  }
`;

export const Setlists = styled.section`
  position: relative;
  min-height: 620px;
  padding: 100px;
  background: linear-gradient(180deg, rgba(7, 7, 29, 0.92), rgba(0, 0, 0, 0.98));

  header p {
    color: var(--ky-blue);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  h2 {
    margin-top: 16px;
    font-size: 80px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 2px;
  }

  @media (min-width: 1024px) {
    min-height: ${frame(620)};
    padding: ${frame(100)};

    header p {
      font-size: ${frame(28)};
    }

    h2 {
      font-size: ${frame(80)};
    }
  }

  @media (max-width: 639px) {
    min-height: auto;
    padding: 80px 20px;

    h2 {
      font-size: 48px;
    }
  }
`;

export const SetlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;
  margin-top: 64px;

  @media (min-width: 1024px) {
    gap: ${frame(30)};
    margin-top: ${frame(64)};
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const SetlistCard = styled(Link)`
  position: relative;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 34px 40px;
  border: 1px solid rgba(247, 249, 252, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--ky-ink);
  transition: border-color 220ms ease, background-color 220ms ease, transform 220ms ease;

  small {
    color: var(--ky-blue-soft);
    font-size: 17px;
    letter-spacing: 1px;
  }

  strong {
    margin-top: 12px;
    font-size: 34px;
    font-weight: 500;
  }

  span {
    margin-top: 18px;
    color: var(--ky-muted);
  }

  &:hover,
  &:focus-visible {
    border-color: var(--ky-blue);
    background: rgba(22, 119, 255, 0.12);
    transform: translateY(-3px);
  }

  @media (min-width: 1024px) {
    min-height: ${frame(190)};
    padding: ${frame(34)} ${frame(40)};
    border-radius: ${frame(14)};

    small {
      font-size: ${frame(17)};
    }

    strong {
      margin-top: ${frame(12)};
      font-size: ${frame(34)};
    }

    span {
      margin-top: ${frame(18)};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Empty = styled.p`
  margin-top: 56px;
  color: var(--ky-muted);
  font-size: 20px;
`;
