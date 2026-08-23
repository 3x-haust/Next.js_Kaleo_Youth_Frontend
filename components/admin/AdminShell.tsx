'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { clientAuthPost, errorMessage } from '@/lib/client-api';
import { SITE } from '@/lib/site';
import type { AdminProfile } from '@/lib/types';
import { useAdminSession } from '@/store/admin-session';

const MENU = [
  { href: '/admin', label: '대시보드', exact: true },
  { href: '/admin/about', label: '소개 관리' },
  { href: '/admin/gallery', label: '갤러리' },
  { href: '/admin/sermons', label: '말씀' },
  { href: '/admin/events', label: '일정' },
  { href: '/admin/setlists', label: 'J-Teen 콘티' },
  { href: '/admin/team', label: '찬양팀 관리' },
  { href: '/admin/audit-logs', label: '감사 로그' },
] as const;

const SUPER_MENU = [{ href: '/admin/accounts', label: '관리자 계정' }] as const;

export function AdminShell({
  admin,
  children,
}: {
  admin: AdminProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const setProfile = useAdminSession((state) => state.setProfile);
  const clear = useAdminSession((state) => state.clear);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setProfile(admin);
  }, [admin, setProfile]);

  const menu = admin.isSuperAdmin ? [...MENU, ...SUPER_MENU] : MENU;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  async function logout() {
    setPending(true);
    try {
      await clientAuthPost('/auth/logout');
    } catch (error) {
      console.error(errorMessage(error));
    } finally {
      clear();
      setPending(false);
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <Layout>
      <Bar>
        <BarInner>
          <Brand href="/admin">
            {SITE.name}
            <small>관리자</small>
          </Brand>
          <BarRight>
            <Who>
              <strong>{admin.name}</strong>
              <span>{admin.isSuperAdmin ? '슈퍼관리자' : (admin.positionLabel ?? '관리자')}</span>
            </Who>
            <TextButton as={Link} href="/" target="_blank" rel="noopener noreferrer">
              사이트 보기 ↗
            </TextButton>
            <TextButton type="button" onClick={logout} disabled={pending}>
              {pending ? '로그아웃 중…' : '로그아웃'}
            </TextButton>
            <MenuToggle
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="admin-navigation"
            >
              {open ? '닫기' : '메뉴'}
            </MenuToggle>
          </BarRight>
        </BarInner>
      </Bar>

      <Body>
        <Side $open={open}>
          <nav id="admin-navigation" aria-label="관리자 메뉴">
            {menu.map((item) => (
              <SideLink
                key={item.href}
                href={item.href}
                $active={isActive(item.href, 'exact' in item ? item.exact : false)}
                aria-current={isActive(item.href, 'exact' in item ? item.exact : false) ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </SideLink>
            ))}
            <SideDivider />
            <SideLink href="/admin/password" $active={isActive('/admin/password')} onClick={() => setOpen(false)}>
              내 비밀번호 변경
            </SideLink>
            <MobileActions>
              <SideLink href="/" target="_blank" rel="noopener noreferrer">사이트 보기 ↗</SideLink>
              <SideAction type="button" onClick={logout} disabled={pending}>
                {pending ? '로그아웃 중…' : '로그아웃'}
              </SideAction>
            </MobileActions>
          </nav>
        </Side>
        <Main>{children}</Main>
      </Body>
    </Layout>
  );
}

const Layout = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bgSoft};
  display: flex;
  flex-direction: column;
`;

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  background: ${({ theme }) => theme.colors.bgDeep};
  color: ${({ theme }) => theme.colors.white};
`;

const BarInner = styled.div`
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: ${({ theme }) => theme.font.display};
  font-size: 19px;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.white};

  small {
    font-family: ${({ theme }) => theme.font.sans};
    font-size: 12px;
    letter-spacing: 0;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const BarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Who = styled.div`
  display: flex;
  align-items: baseline;
  gap: 7px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.85);

  span {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    display: none;
  }
`;

const TextButton = styled.button`
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.8);
  background: none;
  border: 0;
  padding: 0;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    opacity: 0.5;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    display: none;
  }
`;

const MenuToggle = styled.button`
  display: none;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.white};
  background: rgba(255, 255, 255, 0.14);
  border: 0;
  border-radius: ${({ theme }) => theme.radius.pill};
  padding: 7px 14px;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    display: inline-flex;
  }
`;

const Body = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 26px 20px 60px;
  display: grid;
  grid-template-columns: 208px minmax(0, 1fr);
  gap: 26px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Side = styled.aside<{ $open: boolean }>`
  position: sticky;
  top: 86px;

  nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    position: static;
    display: ${({ $open }) => ($open ? 'block' : 'none')};

    nav {
      background: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.line};
      border-radius: ${({ theme }) => theme.radius.lg};
      padding: 8px;
    }
  }
`;

const SideLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  min-height: 44px;
  align-items: center;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14.5px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.body)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primaryTint : 'transparent')};

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.colors.primaryTint : theme.colors.white)};
  }
`;

const SideDivider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  margin: 10px 6px;
`;

const MobileActions = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-top: 8px;
  }
`;

const SideAction = styled.button`
  display: flex;
  min-height: 44px;
  align-items: center;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.body};
  font-size: 14.5px;
  text-align: left;
`;

const Main = styled.main`
  min-width: 0;
`;
