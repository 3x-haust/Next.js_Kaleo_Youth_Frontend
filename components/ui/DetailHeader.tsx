'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import styled from 'styled-components';

const Wrap = styled.header`
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  margin-bottom: 32px;
`;

const Back = styled(Link)`
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 18px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Title = styled.h1`
  font-size: 30px;
  line-height: 1.4;

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    font-size: 23px;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
`;

interface Props {
  backHref: string;
  backLabel: string;
  title: string;
  meta?: ReactNode;
}

export function DetailHeader({ backHref, backLabel, title, meta }: Props) {
  return (
    <Wrap>
      <Back href={backHref}>← {backLabel}</Back>
      <Title>{title}</Title>
      {meta ? <Meta>{meta}</Meta> : null}
    </Wrap>
  );
}
