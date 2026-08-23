'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled, { css } from 'styled-components';

export const Brand = styled(Link)`
  width: 115px;
  height: 60px;
  display: block;
  text-decoration: none;

  @media (min-width: 1024px) {
    width: calc(var(--header-scale) * 115px);
    height: calc(var(--header-scale) * 60px);
  }

  @media (max-width: 1023px) {
    width: 92px;
    height: 48px;
  }
`;

export const BrandImage = styled(Image)`
  display: block;
  width: 115px;
  height: 60px;
  object-fit: contain;
  filter:
    drop-shadow(0 1px 4px rgba(0, 0, 0, 0.72))
    drop-shadow(0 0 10px rgba(22, 119, 255, 0.06));

  @media (min-width: 1024px) {
    width: calc(var(--header-scale) * 115px);
    height: calc(var(--header-scale) * 60px);
  }

  @media (max-width: 1023px) {
    width: 92px;
    height: 48px;
  }
`;

export const Nav = styled.nav<{ $open?: boolean }>`
  justify-self: center;
  display: flex;
  align-items: center;
  gap: var(--nav-gap);
  color: #f7f9fc;
  font-family: var(--ky-font-sans);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.816px;
  line-height: 20.4px;

  @media (min-width: 1024px) {
    width: max(calc(var(--header-scale) * 418px), 340px);
    gap: clamp(16px, calc(var(--header-scale) * 40px), 40px);
    font-size: max(15px, calc(var(--header-scale) * 22px));
    letter-spacing: calc(var(--header-scale) * 0.816px);
    line-height: calc(var(--header-scale) * 20.4px);
  }

  @media (max-width: 1023px) {
    position: fixed;
    top: 72px;
    right: 0;
    left: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    display: none;
    padding: var(--ky-sp-2) 0 var(--ky-sp-3);
    background-color: var(--glass-fill-scrolled);
    background-image: none;
    backdrop-filter: blur(var(--glass-blur-scrolled)) saturate(var(--glass-saturation-scrolled)) brightness(0.9);
    -webkit-backdrop-filter: blur(var(--glass-blur-scrolled)) saturate(var(--glass-saturation-scrolled)) brightness(0.9);
    border-bottom: 1px solid var(--glass-line);
    box-shadow:
      inset 0 1px 0 var(--glass-highlight),
      inset 0 -1px 0 var(--glass-lowlight),
      0 18px 42px -28px var(--glass-shadow);

    ${({ $open }) => $open && 'display: flex;'}
  }
`;

export const NavItem = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 21px;
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
  color: #f7f9fc;
  text-decoration: none;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.74),
    0 0 12px rgba(4, 8, 28, 0.36);
  white-space: nowrap;

  &::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: max(44px, 100%);
    height: 44px;
    content: '';
    transform: translate(-50%, -50%);
  }

  @media (min-width: 1024px) {
    min-width: calc(var(--header-scale) * 44px);
    min-height: calc(var(--header-scale) * 21px);
  }

  @media (max-width: 1023px) {
    padding: 12px var(--ky-gutter);
    font-size: var(--ky-body);
  }
`;

export const Toggle = styled.button`
  display: none;
  grid-column: 3;
  width: 44px;
  height: 44px;
  padding: 10px 7px;
  position: relative;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  justify-self: end;

  @media (max-width: 1023px) {
    display: inline-flex;
  }
`;

export const ToggleLine = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 26px;
  height: 1px;
  background: currentColor;
  transform: translate(-50%, -50%);
  transition: transform 160ms ease, opacity 160ms ease;

  &:nth-child(1) {
    transform: translate(-50%, calc(-50% - 7px));
  }

  &:nth-child(3) {
    transform: translate(-50%, calc(-50% + 7px));
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Inner = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: grid;
  grid-template-columns: var(--nav-logo-w) 1fr var(--nav-logo-w);
  align-items: center;
  padding: 0 var(--nav-edge);

  @media (min-width: 1024px) {
    grid-template-columns: calc(var(--header-scale) * 115px) 1fr calc(var(--header-scale) * 115px);
    padding: 0 calc(var(--header-scale) * 32px);
  }

  @media (max-width: 1023px) {
    height: 72px;
    padding: 0 var(--ky-gutter);
  }
`;

export const Bar = styled.header<{ $scrolled?: boolean; $menuOpen?: boolean }>`
  --header-scale: min(1, calc(100vw / 1920px));

  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  height: var(--nav-h-home);
  transform: translateX(-50%);
  z-index: 100;
  color: #f7f9fc;
  border: 1px solid transparent;
  background-color: var(--glass-fill-origin);
  background-image: none;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  transition:
    top var(--glass-transition),
    width var(--glass-transition),
    height var(--glass-transition),
    border-radius var(--glass-transition),
    background-color var(--glass-transition),
    box-shadow var(--glass-transition),
    backdrop-filter var(--glass-transition);

  @media (min-width: 1024px) {
    height: calc(var(--header-scale) * 100px);

    ${NavItem}:nth-child(1) {
      translate: calc(var(--header-scale) * -1.5px) calc(var(--header-scale) * -0.5px);
      transform: scale(1.005, 1.03);
    }

    ${NavItem}:nth-child(2) {
      translate: calc(var(--header-scale) * -5.25px) calc(var(--header-scale) * -1.5px);
      transform: scale(1, 1.01);
    }

    ${NavItem}:nth-child(3) {
      translate: calc(var(--header-scale) * -4px) calc(var(--header-scale) * -0.5px);
      transform: scale(1.005, 1.04);
    }

    ${NavItem}:nth-child(4) {
      translate: calc(var(--header-scale) * -2.5px) calc(var(--header-scale) * -1.5px);
      transform: scale(1.015, 1);
    }

    ${NavItem}:nth-child(5) {
      translate: calc(var(--header-scale) * -2px) calc(var(--header-scale) * -0.5px);
      transform: scale(0.995, 1.035);
    }
  }

  ${({ $scrolled }) =>
    $scrolled &&
    css`
      top: calc(var(--header-scale) * 30px);
      width: min(calc(100% - calc(var(--header-scale) * 64px)), calc(var(--header-scale) * 1500px));
      height: calc(var(--header-scale) * 100px);
      border-radius: var(--nav-radius);
      border-color: var(--glass-line);
      background-color: var(--glass-fill-scrolled);
      background-image: none;
      box-shadow:
        inset 0 1px 0 var(--glass-highlight),
        inset 0 -1px 0 var(--glass-lowlight),
        0 20px 50px -20px var(--glass-shadow);
      -webkit-backdrop-filter: blur(var(--glass-blur-scrolled)) saturate(var(--glass-saturation-scrolled)) brightness(0.9);
      backdrop-filter: blur(var(--glass-blur-scrolled)) saturate(var(--glass-saturation-scrolled)) brightness(0.9);

      ${Inner} {
        padding-inline: calc(var(--header-scale) * 31px);
      }
    `}

  ${({ $menuOpen }) =>
    $menuOpen &&
    css`
      @media (max-width: 1023px) {
        ${ToggleLine}:nth-child(1) {
          transform: translate(-50%, -50%) rotate(45deg);
        }

        ${ToggleLine}:nth-child(2) {
          opacity: 0;
        }

        ${ToggleLine}:nth-child(3) {
          transform: translate(-50%, -50%) rotate(-45deg);
        }
      }
    `}

  @media (max-width: 1023px) {
    --header-scale: 1;

    top: 0;
    width: 100%;
    height: 72px;
    border-radius: 0;

    ${({ $scrolled }) =>
      $scrolled &&
      css`
        top: 10px;
        width: calc(100% - 20px);
        height: 72px;
        border-radius: 999px;

        ${Nav} {
          top: 82px;
          right: 10px;
          left: 10px;
          border-radius: 24px;
        }
      `}
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
