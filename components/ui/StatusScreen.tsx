'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { ButtonLink, Container } from './primitives';

const Wrap = styled.div`
  padding: 110px 0 130px;
  text-align: center;

  b {
    display: block;
    font-family: ${({ theme }) => theme.font.display};
    font-size: 64px;
    color: ${({ theme }) => theme.colors.primaryTint};
    line-height: 1;
    margin-bottom: 18px;
  }

  h1 {
    font-size: 26px;
    margin-bottom: 12px;
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 15.5px;
  }
`;

const Actions = styled.div`
  margin-top: 32px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

interface Props {
  code: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function StatusScreen({ code, title, description, children }: Props) {
  return (
    <Container>
      <Wrap>
        <b aria-hidden>{code}</b>
        <h1>{title}</h1>
        <p>{description}</p>
        <Actions>
          <ButtonLink href="/">홈으로</ButtonLink>
          {children}
        </Actions>
      </Wrap>
    </Container>
  );
}
