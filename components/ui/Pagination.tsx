'use client';

import Link from 'next/link';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 40px;
  flex-wrap: wrap;
`;

const Item = styled(Link)<{ $active?: boolean }>`
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.line)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.white)};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.body)};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Gap = styled.span`
  color: ${({ theme }) => theme.colors.faint};
  padding: 0 2px;
`;

interface Props {
  page: number;
  totalPages: number;

  basePath: string;

  params?: Record<string, string | undefined>;
}

export function Pagination({ page, totalPages, basePath, params = {} }: Props) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    if (target > 1) search.set('page', String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const numbers = pageWindow(page, totalPages);

  return (
    <Nav aria-label="페이지 이동">
      {page > 1 ? <Item href={href(page - 1)}>이전</Item> : null}
      {numbers.map((entry, index) =>
        entry === null ? (
          <Gap key={`gap-${index}`}>…</Gap>
        ) : (
          <Item
            key={entry}
            href={href(entry)}
            $active={entry === page}
            aria-current={entry === page ? 'page' : undefined}
          >
            {entry}
          </Item>
        ),
      )}
      {page < totalPages ? <Item href={href(page + 1)}>다음</Item> : null}
    </Nav>
  );
}

function pageWindow(page: number, totalPages: number): (number | null)[] {
  const span = 2;
  const pages = new Set<number>([1, totalPages]);
  for (let index = page - span; index <= page + span; index += 1) {
    if (index >= 1 && index <= totalPages) pages.add(index);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) result.push(null);
    result.push(value);
    previous = value;
  }
  return result;
}
