'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { Container } from './primitives';

const Wrap = styled.div`
  position: relative;
  height: 280px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgDeep};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    height: 210px;
  }
`;

const Photo = styled(Image)`
  object-fit: cover;
  object-position: center 42%;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.overlay.banner};
`;

const Inner = styled(Container)`
  position: relative;
  color: ${({ theme }) => theme.colors.white};

  small {
    display: block;
    font-family: ${({ theme }) => theme.font.display};
    font-size: 14px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.85;
    margin-bottom: 10px;
  }

  h1 {
    color: ${({ theme }) => theme.colors.white};
    font-size: 36px;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);

    @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
      font-size: 26px;
    }
  }

  p {
    margin-top: 12px;
    max-width: 640px;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.4);

    @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
      font-size: 14.5px;
    }
  }
`;

interface Props {
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageBanner({ image, eyebrow, title, description }: Props) {
  return (
    <Wrap>
      <Photo src={image} alt="" fill sizes="100vw" priority />
      <Overlay />
      <Inner>
        {eyebrow ? <small>{eyebrow}</small> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </Inner>
    </Wrap>
  );
}
