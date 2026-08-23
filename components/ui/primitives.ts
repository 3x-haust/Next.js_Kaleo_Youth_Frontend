'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';

export const Container = styled.div<{ $narrow?: boolean }>`
  width: 100%;
  max-width: ${({ theme, $narrow }) =>
    $narrow ? theme.layout.narrowWidth : theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.layout.gutter};
`;

export const Section = styled.section<{ $soft?: boolean; $tight?: boolean }>`
  padding: ${({ $tight }) => ($tight ? '48px 0' : '76px 0')};
  background: ${({ theme, $soft }) => ($soft ? theme.colors.bgSoft : 'transparent')};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    padding: ${({ $tight }) => ($tight ? '36px 0' : '52px 0')};
  }
`;

export const PageUnderGlowClip = styled.div<{ $top?: number }>`
  position: absolute;
  top: ${({ $top }) => ($top === undefined ? 'auto' : `${$top}px`)};
  bottom: ${({ $top }) => ($top === undefined ? '0' : 'auto')};
  left: 0;
  width: 100%;
  height: 3px;
  overflow: hidden;
  pointer-events: none;

  @media (max-width: 1023px) {
    top: auto;
    bottom: 0;
  }
`;

export const PageUnderGlow = styled.div`
  position: absolute;
  top: 0;
  left: 2px;
  width: 1920px;
  height: 3px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0) 0%,
    #3b82f6 50%,
    rgba(59, 130, 246, 0) 100%
  );

  @media (max-width: 1023px) {
    left: 0;
    width: 100%;
  }
`;

export const SectionHeading = styled.div<{ $center?: boolean }>`
  margin-bottom: 32px;
  text-align: ${({ $center }) => ($center ? 'center' : 'left')};

  small {
    display: block;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: 10px;
  }

  h2 {
    font-size: 30px;

    @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
      font-size: 24px;
    }
  }

  p {
    margin-top: 10px;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 15px;
  }
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 15px;
  font-weight: 600;
  border: 1px solid transparent;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    opacity 0.16s ease;
  white-space: nowrap;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

type Variant = 'primary' | 'outline' | 'ghost' | 'accent' | 'danger';

const variantStyles = css<{ $variant?: Variant }>`
  ${({ theme, $variant = 'primary' }) => {
    switch ($variant) {
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.primary};
          border-color: ${theme.colors.line};
          &:hover:not(:disabled) {
            border-color: ${theme.colors.primary};
            background: ${theme.colors.primaryTint};
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.muted};
          &:hover:not(:disabled) {
            color: ${theme.colors.ink};
            background: ${theme.colors.bgSoft};
          }
        `;
      case 'accent':
        return css`
          background: ${theme.colors.accent};
          color: ${theme.colors.white};
          &:hover:not(:disabled) {
            background: #c2781f;
          }
        `;
      case 'danger':
        return css`
          background: ${theme.colors.white};
          color: ${theme.colors.danger};
          border-color: #f0cfcb;
          &:hover:not(:disabled) {
            background: #fdf1f0;
          }
        `;
      default:
        return css`
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
          &:hover:not(:disabled) {
            background: ${theme.colors.primarySoft};
          }
        `;
    }
  }}
`;

export const Button = styled.button<{ $variant?: Variant; $small?: boolean; $block?: boolean }>`
  ${buttonBase}
  ${variantStyles}
  ${({ $small }) =>
    $small &&
    css`
      padding: 8px 14px;
      font-size: 13.5px;
    `}
  ${({ $block }) =>
    $block &&
    css`
      width: 100%;
    `}
`;

export const ButtonLink = styled(Link)<{ $variant?: Variant; $small?: boolean }>`
  ${buttonBase}
  ${variantStyles}
  ${({ $small }) =>
    $small &&
    css`
      padding: 8px 14px;
      font-size: 13.5px;
    `}
`;

export const Card = styled.article`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
    transform: translateY(-2px);
  }
`;

export const Grid = styled.div<{ $min?: string; $gap?: string }>`
  display: grid;
  gap: ${({ $gap }) => $gap ?? '24px'};
  grid-template-columns: repeat(auto-fill, minmax(${({ $min }) => $min ?? '280px'}, 1fr));
`;

export const Badge = styled.span<{ $tone?: 'accent' | 'primary' | 'muted' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.6;

  ${({ theme, $tone = 'muted' }) => {
    switch ($tone) {
      case 'accent':
        return css`
          background: ${theme.colors.accentSoft};
          color: #a5661a;
        `;
      case 'primary':
        return css`
          background: ${theme.colors.primaryTint};
          color: ${theme.colors.primary};
        `;
      case 'danger':
        return css`
          background: #fdf1f0;
          color: ${theme.colors.danger};
        `;
      default:
        return css`
          background: ${theme.colors.bgSoft};
          color: ${theme.colors.muted};
        `;
    }
  }}
`;

export const Prose = styled.div`
  font-size: 16.5px;
  line-height: 1.85;
  color: ${({ theme }) => theme.colors.body};
  white-space: pre-wrap;

  h1,
  h2,
  h3 {
    margin: 28px 0 12px;
  }
  h2 {
    font-size: 22px;
  }
  h3 {
    font-size: 18px;
  }

  p {
    margin: 0 0 16px;
  }

  a {
    color: ${({ theme }) => theme.colors.primarySoft};
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  ul,
  ol {
    margin: 0 0 16px;
    padding-left: 20px;
    list-style: revert;
  }

  blockquote {
    margin: 20px 0;
    padding: 4px 0 4px 18px;
    border-left: 3px solid ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.muted};
  }

  img {
    border-radius: ${({ theme }) => theme.radius.md};
    margin: 12px 0;
  }
`;

export const EmptyState = styled.div`
  padding: 64px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.faint};
  font-size: 15px;
  background: ${({ theme }) => theme.colors.bgSoft};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

export const VideoFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
  background: #000;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  margin: 32px 0;
`;

export const Notice = styled.div<{ $tone?: 'info' | 'warn' }>`
  padding: 14px 18px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14.5px;
  line-height: 1.7;

  ${({ theme, $tone = 'info' }) =>
    $tone === 'warn'
      ? css`
          background: ${theme.colors.accentSoft};
          color: #8a5514;
          border: 1px solid #f0dcbb;
        `
      : css`
          background: ${theme.colors.primaryTint};
          color: ${theme.colors.primary};
          border: 1px solid #d9e4f0;
        `}
`;
