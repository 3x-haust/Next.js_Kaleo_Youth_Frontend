'use client';

import Link from 'next/link';
import styled from 'styled-components';

export const Identity = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const Slogan = styled.p`
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #f7f9fc;
  font-size: 12px;
  line-height: normal;

  br {
    display: none;
  }

  strong {
    color: #1677ff;
    font-size: 16px;
    font-weight: 500;
    line-height: 19px;
  }

`;

export const SloganLead = styled.span`
  font-size: 14px;
  font-weight: 200;
  line-height: 16px;

`;

export const AccentRule = styled.span`
  position: relative;
  display: block;
  width: 25px;
  height: 0;
  margin-top: 14px;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 25px;
    height: 1px;
    background: #1677ff;
  }
`;

export const SloganKo = styled.p`
  margin-top: 14px;
  color: #f7f9fc;
  font-size: 12px;
  font-weight: 200;
  line-height: 19px;

`;

export const Wordmark = styled(Link)`
  width: 149px;
  height: 92px;
  display: block;
  margin-bottom: 10px;

  img {
    display: block;
    width: 149px;
    height: 92px;
  }

  @media (max-width: 640px) {
    width: 115px;
    height: 71px;

    img {
      width: 115px;
      height: 71px;
    }
  }
`;
