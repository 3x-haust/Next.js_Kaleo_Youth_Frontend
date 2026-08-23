'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

const Tab = styled(Link)<{ $active?: boolean }>`
  padding: 12px 20px;
  font-size: 15.5px;
  font-weight: 600;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.muted)};
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  margin-bottom: -1px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TABS = [{ href: '/share/gallery', label: '갤러리' }] as const;

export function ShareTabs() {
  const pathname = usePathname();

  return (
    <Nav aria-label="갤러리 메뉴">
      {TABS.map((tab) => (
        <Tab key={tab.href} href={tab.href} $active={pathname.startsWith(tab.href)}>
          {tab.label}
        </Tab>
      ))}
    </Nav>
  );
}
