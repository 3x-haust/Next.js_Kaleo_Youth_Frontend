'use client';

import styled from 'styled-components';

export const ContactRow = styled.a`
  display: flex;
  gap: 10px;
  align-items: center;
  color: #ebebeb;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;

  span {
    display: block;
    white-space: nowrap;
  }

  @media (max-width: 360px) {
    font-size: 10px;
  }
`;

export const ContactIcon = styled.span`
  width: 32px;
  height: 32px;
  display: flex;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  padding: 4px;
  box-sizing: border-box;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);

  img {
    display: block;
    width: 24px;
    height: 24px;
  }
`;

export const DesignBy = styled.p`
  > span {
    width: 67px;
    flex: 0 0 67px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
    letter-spacing: -0.56px;
    white-space: nowrap;
  }

  img {
    width: 151px;
    height: 56px;
    object-fit: cover;
    opacity: 1;
  }
`;

export const Contact = styled.div`
  width: 300px;
  height: 227px;
  display: flex;
  flex-direction: column;
  gap: 33px;
  align-items: flex-end;
  justify-content: center;
  color: #ebebeb;
  font-size: 12px;
  font-weight: 400;
  line-height: normal;

  > ${DesignBy} {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;

    @media (max-width: 640px) {
      justify-content: flex-start;
    }
  }

  @media (max-width: 640px) {
    width: 100%;
    height: auto;
    align-items: flex-start;
  }
`;

export const ContactDetails = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 13px;

  > p {
    color: #ebebeb;
    font-size: 12px;
    font-weight: 400;
    line-height: normal;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    width: 100%;
  }

  @media (max-width: 360px) {
    > p {
      font-size: 10px;
    }
  }
`;

export const Rule = styled.div`
  position: relative;
  width: 300px;
  height: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 1px;
    background: #f7f9fc;
    transform: translateY(-0.5px);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;
