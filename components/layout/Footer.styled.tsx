'use client';

import styled from 'styled-components';

export const FooterRoot = styled.footer`
  position: relative;
  overflow: hidden;
  height: 351px;
  margin-top: auto;
  padding: 62px 100px;
  color: var(--ky-ink);
  background: #000;

  &::before {
    position: absolute;
    z-index: 2;
    top: -964px;
    left: 0;
    width: 100%;
    height: 965px;
    content: '';
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 72vw 58% at 0% 100%,
        rgba(2, 36, 89, 0.42) 0%,
        rgba(2, 36, 89, 0.2) 42%,
        rgba(0, 0, 0, 0) 78%
      ),
      #000;
  }

  @media (max-width: 1100px) and (min-width: 641px) {
    padding-inline: 40px;
  }

  @media (max-width: 640px) {
    height: auto;
    min-height: 0;
    padding: 64px 32px 54px;
  }
`;

export const Background = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    url('/images/effects/footer-glow-right.svg') right -262px top -62px / 782.221px
      865.96px no-repeat,
    url('/images/effects/footer-glow-left-bottom.svg') -385px 120px / 762.08px 907.531px
      no-repeat,
    url('/images/effects/footer-glow-left-top.svg') -294px -277px / 619.524px 670.823px
      no-repeat;
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 80px;

  @media (max-width: 1100px) and (min-width: 641px) {
    gap: 24px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 56px;
  }
`;

export const MobileNav = styled.nav`
  display: none;

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border-top: 1px solid rgba(247, 249, 252, 0.16);

    a {
      min-height: 52px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      border-bottom: 1px solid rgba(247, 249, 252, 0.16);
      color: rgba(247, 249, 252, 0.64);
    }
  }
`;
