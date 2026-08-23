'use client';

import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import styled from 'styled-components';
import { Button } from '@/components/ui/primitives';
import { clientDelete, errorMessage } from '@/lib/client-api';
import { Table, TableWrap } from './parts';
import { AdminEmpty } from './widgets';

export type AdminSelectableColumn = {
  readonly label: string;
  readonly numeric?: boolean;
};

export type AdminSelectableRow = {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly cells: readonly ReactNode[];
};

type AdminSelectableTableProps = {
  readonly columns: readonly AdminSelectableColumn[];
  readonly rows: readonly AdminSelectableRow[];
  readonly deletePathPrefix: string;
};

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('a, button, input, select, textarea, [role="button"], [role="link"]') !==
      null
  );
}

export function AdminSelectableTable({
  columns,
  rows,
  deletePathPrefix,
}: AdminSelectableTableProps) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const visibleRows = rows.filter((row) => !removedIds.has(row.id));
  const visibleIds = new Set(visibleRows.map((row) => row.id));
  const activeSelectedIds = new Set([...selectedIds].filter((id) => visibleIds.has(id)));

  const allSelected =
    visibleRows.length > 0 && activeSelectedIds.size === visibleRows.length;
  const partlySelected = activeSelectedIds.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partlySelected;
  }, [partlySelected]);

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(visibleRows.map((row) => row.id)) : new Set());
    setStatus(null);
    setFailure(null);
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set([...current].filter((selectedId) => visibleIds.has(selectedId)));
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    setStatus(null);
    setFailure(null);
  }

  function navigateFromRow(
    event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>,
    href: string,
  ) {
    if (isInteractiveTarget(event.target)) return;
    if ('key' in event && event.key !== 'Enter') return;
    router.push(href);
  }

  async function removeSelected() {
    if (activeSelectedIds.size === 0 || pending) return;
    if (
      !window.confirm(
        `선택한 ${activeSelectedIds.size}개 항목을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?`,
      )
    ) {
      return;
    }

    setPending(true);
    setStatus(null);
    setFailure(null);

    const succeeded = new Set<string>();
    const failed = new Set<string>();
    let firstFailure: string | null = null;

    for (const row of visibleRows) {
      if (!activeSelectedIds.has(row.id)) continue;
      try {
        await clientDelete(`${deletePathPrefix}${row.id}`);
        succeeded.add(row.id);
      } catch (caught) {
        failed.add(row.id);
        firstFailure ??= errorMessage(caught);
      }
    }

    if (succeeded.size > 0) {
      setRemovedIds((current) => new Set([...current, ...succeeded]));
    }
    setSelectedIds(failed);

    if (failed.size > 0) {
      setFailure(
        `${succeeded.size}개 삭제, ${failed.size}개 삭제 실패. 실패한 항목은 선택 상태로 남았습니다.${firstFailure ? ` ${firstFailure}` : ''}`,
      );
    } else {
      setStatus(`${succeeded.size}개 항목을 삭제했습니다.`);
    }
    setPending(false);
    if (succeeded.size > 0) router.refresh();
  }

  return (
    <SelectableTableArea>
      {activeSelectedIds.size > 0 ? (
        <SelectionToolbar>
          <SelectionStatus role="status">{activeSelectedIds.size}개 선택</SelectionStatus>
          <Button type="button" $variant="ghost" $small onClick={() => toggleAll(false)}>
            선택 해제
          </Button>
          <Button
            type="button"
            $variant="danger"
            $small
            disabled={pending}
            onClick={removeSelected}
          >
            {pending ? '삭제 중…' : '선택 삭제'}
          </Button>
        </SelectionToolbar>
      ) : null}

      {status ? <ResultMessage role="status">{status}</ResultMessage> : null}
      {failure ? <FailureMessage role="alert">{failure}</FailureMessage> : null}

      {visibleRows.length === 0 ? (
        <AdminEmpty data-zone="admin-empty-state">등록된 항목이 없습니다.</AdminEmpty>
      ) : (
        <TableWrap>
          <Table>
          <thead>
            <tr>
              <SelectionHeading>
                <SelectionCheckbox
                  ref={selectAllRef}
                  type="checkbox"
                  aria-label="현재 페이지 모두 선택"
                  checked={allSelected}
                  disabled={pending}
                  onChange={(event) => toggleAll(event.target.checked)}
                />
              </SelectionHeading>
              {columns.map((column) => (
                <th key={column.label} className={column.numeric ? 'num' : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <SelectableRow
                key={row.id}
                tabIndex={0}
                aria-label={`${row.label} 편집`}
                data-href={row.href}
                onClick={(event) => navigateFromRow(event, row.href)}
                onKeyDown={(event) => navigateFromRow(event, row.href)}
              >
                <SelectionCell>
                  <SelectionCheckbox
                    type="checkbox"
                    aria-label={`${row.label} 선택`}
                    checked={activeSelectedIds.has(row.id)}
                    disabled={pending}
                    onChange={(event) => toggleRow(row.id, event.target.checked)}
                  />
                </SelectionCell>
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.id}-${columns[index]?.label ?? index}`}
                    className={columns[index]?.numeric ? 'num' : undefined}
                  >
                    {cell}
                  </td>
                ))}
              </SelectableRow>
            ))}
          </tbody>
          </Table>
        </TableWrap>
      )}
    </SelectableTableArea>
  );
}

const SelectableTableArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SelectionToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
`;

const SelectionStatus = styled.strong`
  margin-right: auto;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
`;

const ResultMessage = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-size: 14px;
`;

const FailureMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  line-height: 1.6;
`;

const SelectionHeading = styled.th`
  width: 44px;
`;

const SelectionCell = styled.td`
  width: 44px;
`;

const SelectionCheckbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const SelectableRow = styled.tr`
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primarySoft};
    outline-offset: -2px;
  }
`;
