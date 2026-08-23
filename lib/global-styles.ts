'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.font.sans};
    font-size: 16px;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.body};
    background: ${({ theme }) => theme.colors.bg};
    -webkit-font-smoothing: antialiased;
    word-break: keep-all;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    color: ${({ theme }) => theme.colors.ink};
    line-height: 1.35;
    letter-spacing: -0.01em;
    font-weight: 700;
  }

  p { margin: 0; }
  ul, ol { margin: 0; padding: 0; list-style: none; }

  a {
    color: inherit;
    text-decoration: none;
  }

  img, svg, video { max-width: 100%; display: block; }

  button, input, select, textarea {
    font: inherit;
    color: inherit;
  }

  button { cursor: pointer; }

  /* 키보드 사용자를 위한 포커스 표시는 지우지 않습니다. */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
