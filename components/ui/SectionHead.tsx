'use client';

import Link from 'next/link';
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const Titles = styled.div`
  small {
    display: block;
    font-family: ${({ theme }) => theme.font.display};
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: 8px;
  }

  h2 {
    font-size: 28px;

    @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
      font-size: 22px;
    }
  }

  p {
    margin-top: 8px;
    font-size: 15px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const MoreLink = styled(Link)`
  font-size: 14.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primarySoft};
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  moreHref?: string;
  moreLabel?: string;
}

export function SectionHead({ eyebrow, title, description, moreHref, moreLabel }: Props) {
  return (
    <Wrap>
      <Titles>
        {eyebrow ? <small>{eyebrow}</small> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Titles>
      {moreHref ? <MoreLink href={moreHref}>{moreLabel ?? '전체 보기'} →</MoreLink> : null}
    </Wrap>
  );
}
