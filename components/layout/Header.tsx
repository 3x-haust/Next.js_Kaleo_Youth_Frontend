'use client';

import { usePathname } from 'next/navigation';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  Bar,
  Brand,
  BrandImage,
  Inner,
  Nav,
  NavItem,
  Toggle,
  ToggleLine,
} from './Header.styled';

const NAV_ITEMS = [
  { href: '/about', label: '소개' },
  { href: '/sermons', label: '말씀' },
  { href: '/jteen', label: 'J-Teen' },
  { href: '/events', label: '일정' },
  { href: '/share/gallery', label: '갤러리' },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const compact = scrolled;

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24));

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setScrolled(window.scrollY > 24);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <Bar
      $scrolled={compact}
      $menuOpen={open}
      data-zone="global-nav"
      data-glass="true"
      data-scrolled={compact ? 'true' : 'false'}
    >
      <Inner>
        <Brand href="/" aria-label="KALEO YOUTH 홈">
          <BrandImage
            src={compact ? '/images/logo/kaleo-logo-after.svg' : '/images/logo/kaleo-logo.svg'}
            alt=""
            width={115}
            height={60}
            priority
          />
        </Brand>

        <Nav
          $open={open}
          id="global-nav"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <NavItem
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavItem>
            );
          })}
        </Nav>

        <Toggle
          type="button"
          aria-label={open ? '닫기' : '메뉴'}
          aria-expanded={open}
          aria-controls="global-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <ToggleLine />
          <ToggleLine />
          <ToggleLine />
        </Toggle>
      </Inner>
    </Bar>
  );
}
