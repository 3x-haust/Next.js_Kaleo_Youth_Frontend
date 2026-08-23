'use client';

import Link from 'next/link';
import styled from 'styled-components';

export const PageHeader = styled.div`
  padding: 180px var(--ky-gutter) 88px;
  border-bottom: 1px solid var(--ky-line);
  background:
    radial-gradient(circle at 70% 0%, rgba(17, 85, 230, 0.22), transparent 36rem),
    var(--ky-ground);
`;

export const PageTitle = styled.h1`
  font-family: var(--ky-expressive);
  font-size: var(--ky-display);
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: -0.04em;
  color: var(--ky-ink);
`;

export const PageSubtitle = styled.p`
  font-size: var(--ky-meta);
  color: var(--ky-blue-soft);
  margin-top: var(--ky-sp-2);
`;

export const CountLine = styled.p`
  font-size: var(--ky-meta);
  color: var(--ky-ink-57);
  padding: var(--ky-sp-3) var(--ky-gutter) var(--ky-sp-2);
`;

export const Content = styled.div`
  padding: 0 var(--ky-gutter) 120px;
`;

export const RecordList = styled.div`
  list-style: none;
`;

export const RecordRow = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--ky-sp-2);
  padding: var(--ky-sp-2) 0;
  border-bottom: 1px solid var(--ky-line);
  text-decoration: none;
  color: var(--ky-ink);
  min-height: 44px;

  &:first-child {
    border-top: 1px solid var(--ky-line);
  }

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 639px) {
    flex-direction: column;
    gap: 4px;
  }
`;

export const RecordPin = styled.span`
  font-size: var(--ky-meta);
  color: var(--ky-ink-57);
  margin-right: var(--ky-sp-1);
`;

export const RecordTitle = styled.span`
  font-size: var(--ky-body);
  flex: 1;
  min-width: 0;
`;

export const RecordDate = styled.span`
  font-size: var(--ky-meta);
  color: var(--ky-ink-57);
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 639px) {
    order: -1;
  }
`;

export const RecordSpeaker = styled.span`
  font-size: var(--ky-meta);
  color: var(--ky-ink-57);
  white-space: nowrap;
  margin-left: var(--ky-sp-2);
  flex-shrink: 0;
`;

export const SearchBar = styled.form`
  padding: var(--ky-sp-2) var(--ky-gutter);
  display: flex;
  gap: var(--ky-sp-2);
  align-items: center;
  flex-wrap: wrap;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: var(--ky-sp-1) var(--ky-sp-2);
  background: rgba(245, 244, 241, 0.08);
  border: 1px solid var(--ky-ink-57);
  color: var(--ky-ink);
  font-size: var(--ky-table);
  min-height: 44px;

  &::placeholder {
    color: var(--ky-ink-57);
  }

  &:focus {
    outline: none;
    border-color: var(--ky-ink);
  }
`;

export const SearchButton = styled.button`
  padding: var(--ky-sp-1) var(--ky-sp-2);
  background: var(--ky-blue);
  color: var(--ky-ink);
  font-size: var(--ky-table);
  cursor: pointer;
  min-height: 44px;

  &:hover {
    opacity: 0.88;
  }
`;

export const Pagination = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--ky-sp-1);
  padding: var(--ky-sp-4) var(--ky-gutter) var(--ky-sp-2);
`;

export const PageLink = styled(Link)`
  display: grid;
  min-width: 44px;
  min-height: 44px;
  place-items: center;
  padding: var(--ky-sp-1) 12px;
  font-size: var(--ky-table);
  color: var(--ky-ink-57);
  text-decoration: none;

  &:hover {
    color: var(--ky-ink);
  }
`;

export const PageLinkActive = styled(PageLink)`
  color: var(--ky-ink);
  border-bottom: 1px solid var(--ky-ink);
`;

export const Empty = styled.div`
  padding: var(--ky-sp-5) var(--ky-gutter);
  font-size: var(--ky-body);
  color: var(--ky-ink-57);
`;

export const EmptyRecovery = styled.p`
  margin-top: var(--ky-sp-2);
  font-size: var(--ky-table);

  a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    color: var(--ky-ink);
    text-decoration: underline;
  }
`;

export const Tabs = styled.div`
  display: flex;
  gap: var(--ky-sp-3);
  padding: 0 var(--ky-gutter);
  margin-bottom: var(--ky-sp-2);
`;

export const Tab = styled(Link)`
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  font-size: var(--ky-table);
  color: var(--ky-ink-57);
  padding-bottom: var(--ky-sp-1);
  text-decoration: none;
`;

export const TabActive = styled(Tab)`
  color: var(--ky-ink);
  border-bottom: 1px solid var(--ky-blue-soft);
`;

export const DetailHeader = styled.div`
  padding: 132px var(--ky-gutter) var(--ky-sp-3);
  max-width: var(--ky-body-measure);
`;

export const DetailTitle = styled.h1`
  font-size: var(--ky-fact);
  color: var(--ky-ink);
  font-weight: 400;
  line-height: 1.4;
`;

export const DetailMeta = styled.p`
  font-size: var(--ky-meta);
  color: var(--ky-ink-57);
  margin-top: var(--ky-sp-1);
`;

export const DetailBody = styled.div`
  padding: var(--ky-sp-3) var(--ky-gutter) var(--ky-sp-5);
  max-width: var(--ky-body-measure);
  font-size: var(--ky-body);
  line-height: 1.85;
  white-space: pre-wrap;
  text-wrap: pretty;
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: var(--ky-sp-3) var(--ky-gutter);
  font-size: var(--ky-table);
  color: var(--ky-ink-57);
  text-decoration: none;

  &:hover {
    color: var(--ky-ink);
  }
`;

export const FactBlock = styled.div`
  padding: var(--ky-sp-3) var(--ky-gutter);
  max-width: var(--ky-body-measure);
`;

export const FactRowLabel = styled.p`
  font-size: var(--ky-meta);
  color: var(--ky-ink-57);
  letter-spacing: 0.06em;
  margin-bottom: var(--ky-sp-1);
`;

export const Roster = styled.div`
  padding: 0 var(--ky-gutter) var(--ky-sp-5);
`;

export const RosterEntry = styled.div`
  padding: var(--ky-sp-3) 0;
  border-bottom: 1px solid var(--ky-ink-57);

  &:first-child {
    border-top: 1px solid var(--ky-ink-57);
  }
`;

export const RosterName = styled.p`
  font-size: var(--ky-fact);
  color: var(--ky-ink);
`;

export const RosterPart = styled.p`
  font-size: var(--ky-body);
  color: var(--ky-ink-57);
  margin-top: 4px;
`;

export const VideoWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: var(--ky-body-measure);
  aspect-ratio: 16 / 9;
  margin: var(--ky-sp-3) 0;
  background: #000;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export const StandingLine = styled.p`
  padding: var(--ky-sp-2) var(--ky-gutter);
  font-size: var(--ky-table);
  color: var(--ky-ink-57);
  line-height: 1.7;
`;