'use client';

import type { DragEvent, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { RouteTransition } from '@/components/motion/Motion';
import { Footer } from './Footer';
import { Header } from './Header';

const Frame = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  -webkit-user-select: none;

  img {
    -webkit-user-drag: none;
  }

  input,
  textarea,
  select,
  [contenteditable='true'] {
    user-select: text;
    -webkit-user-select: text;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: inherit;
  }
`;

const Viewport = styled.div`
  min-height: 100vh;
`;

const Application = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  position: relative;
`;

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const preventImageDrag = (event: DragEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('img')) {
      event.preventDefault();
    }
  };

  return (
    <Frame data-zone="public-shell" onDragStart={preventImageDrag}>
      <a href="#main-content" className="ky-skip-link">
        본문으로 건너뛰기
      </a>
      <Viewport data-route={pathname}>
        <Application data-route={pathname}>
          <Header />
          <Main id="main-content">
            <RouteTransition key={pathname}>{children}</RouteTransition>
          </Main>
          <Footer />
        </Application>
      </Viewport>
    </Frame>
  );
}
