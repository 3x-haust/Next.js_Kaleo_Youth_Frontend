'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';

export const AdminPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

export const PageTitle = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  h1 {
    font-size: 24px;
    letter-spacing: -0.01em;
  }

`;

export const Panel = styled.section<{ $narrow?: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 24px;
  ${({ $narrow }) => ($narrow ? 'max-width: 520px;' : '')}

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    padding: 18px;
  }
`;

export const PanelTitle = styled.h2`
  font-size: 17px;
  margin-bottom: 16px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const FieldRow = styled.div<{ $cols?: number }>`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(${({ $cols }) => $cols ?? 2}, minmax(0, 1fr));

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

export const Label = styled.label`
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};

  span {
    margin-left: 5px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.faint};
  }

  em {
    margin-left: 4px;
    color: ${({ theme }) => theme.colors.danger};
    font-style: normal;
  }
`;

const controlStyle = css`
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.faint};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primarySoft};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTint};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.bgSoft};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

export const Input = styled.input`
  ${controlStyle}
`;

export const Textarea = styled.textarea<{ $rows?: number }>`
  ${controlStyle}
  min-height: ${({ $rows }) => ($rows ?? 8) * 26}px;
  line-height: 1.7;
  resize: vertical;
`;

export const Select = styled.select`
  ${controlStyle}
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #6b7280 50%),
    linear-gradient(135deg, #6b7280 50%, transparent 50%);
  background-position:
    calc(100% - 18px) 50%,
    calc(100% - 13px) 50%;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  padding-right: 34px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 14.5px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.body};
  cursor: pointer;

  input {
    margin-top: 3px;
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`;

export const Hint = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.muted};
`;

export const ErrorText = styled.p.attrs({ role: 'alert' })`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14.5px;

  th,
  td {
    padding: 12px 10px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineSoft};
    vertical-align: middle;
  }

  th {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.muted};
    border-bottom-color: ${({ theme }) => theme.colors.line};
    white-space: nowrap;
  }

  td.num,
  th.num {
    text-align: right;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.muted};
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.colors.bgSoft};
  }
`;

export const TableWrap = styled.div.attrs({
  role: 'region',
  tabIndex: 0,
  'aria-label': '관리자 데이터 표',
})`
  overflow-x: auto;
`;

export const RowTitle = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};

  &:hover {
    color: ${({ theme }) => theme.colors.primarySoft};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export const StatGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
`;

export const StatCard = styled(Link)`
  display: block;
  padding: 20px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primarySoft};
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }

  small {
    display: block;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.muted};
  }

  strong {
    display: block;
    margin-top: 8px;
    font-size: 26px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;
