'use client';

import Link from 'next/link';
import styled from 'styled-components';

export const LoginScreen = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: ${({ theme }) => theme.colors.bgSoft};
`;

export const LoginCard = styled.div`
  width: 100%;
  max-width: 380px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 34px 30px;

  header {
    margin-bottom: 24px;
    text-align: center;
  }

  h1 {
    font-family: ${({ theme }) => theme.font.display};
    font-size: 24px;
    letter-spacing: 0.04em;
  }

  p {
    margin-top: 8px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

export const BackLink = styled(Link)`
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  margin-top: 22px;
  text-align: center;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.muted};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
