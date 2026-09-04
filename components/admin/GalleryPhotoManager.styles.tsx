'use client';

import styled from 'styled-components';
import { Badge } from '@/components/ui/primitives';

export const Manager = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const SelectAllLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const BatchActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

export const BatchStatus = styled.strong`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
`;

export const StatusText = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-size: 14px;
`;

export const ProgressPanel = styled.div`
  width: 100%;
  display: grid;
  gap: 9px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bgSoft};

  progress {
    width: 100%;
    height: 7px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ProgressSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-variant-numeric: tabular-nums;
  }
`;

export const ProgressFiles = styled.ul`
  display: grid;
  gap: 6px;

  li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(90px, 28%);
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.muted};
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const PhotoList = styled.ul`
  width: 100%;
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
`;

export const PhotoCard = styled.li<{
  $selected: boolean;
  $thumbnail: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bgSoft};
  font-size: 14px;

  ${({ $thumbnail, theme }) =>
    $thumbnail
      ? `
        border-color: ${theme.colors.primarySoft};
        background: ${theme.colors.primaryTint};
      `
      : ''}

  ${({ $selected, theme }) =>
    $selected ? `outline: 2px solid ${theme.colors.primarySoft};` : ''}

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr) auto;
    gap: 8px;
  }
`;

export const ThumbnailRadioLabel = styled.label`
  position: relative;
  flex: none;
  cursor: pointer;

  input {
    position: absolute;
    inset: 0;
    cursor: pointer;
    opacity: 0;
  }

  &:focus-within img {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTint};
  }

  img {
    width: 96px;
    height: 72px;
    border-radius: ${({ theme }) => theme.radius.sm};
    object-fit: cover;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    grid-row: 1 / 3;

    img {
      width: 80px;
      height: 60px;
    }
  }
`;

export const CardBody = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

export const FileName = styled.a`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.primarySoft};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ThumbnailBadge = styled(Badge)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
`;

export const ThumbnailChoice = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
`;

export const SelectCheck = styled.input`
  width: 16px;
  height: 16px;
  flex: none;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    grid-column: 3;
    grid-row: 1;
    justify-self: end;
  }
`;

export const RemoveButton = styled.button`
  flex: none;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.5;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    grid-column: 3;
    grid-row: 2;
    justify-self: end;
  }
`;
