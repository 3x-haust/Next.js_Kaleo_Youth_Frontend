import type { Metadata } from 'next';
import { AdminPage, PageTitle, Panel, Table, TableWrap } from '@/components/admin/parts';
import { AdminEmpty } from '@/components/admin/widgets';
import { Badge } from '@/components/ui/primitives';
import { FilterBar } from '@/components/ui/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { apiGetSafe } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { toPage, toText, type SearchParams } from '@/lib/search-params';
import type { AuditLog, PaginatedResult } from '@/lib/types';

export const metadata: Metadata = { title: '감사 로그' };

const EMPTY: PaginatedResult<AuditLog> = { items: [], total: 0, page: 1, limit: 30, totalPages: 1 };

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = toPage(params.page);
  const action = toText(params.action);

  const [result, actions] = await Promise.all([
    apiGetSafe<PaginatedResult<AuditLog>>('/admin/audit-logs', EMPTY, {
      authed: true,
      query: { page, limit: 30, action },
    }),
    apiGetSafe<string[]>('/admin/audit-logs/actions', [], { authed: true }),
  ]);

  return (
    <AdminPage>
      <PageTitle>
        <h1>감사 로그</h1>
      </PageTitle>

      <FilterBar
        basePath="/admin/audit-logs"
        fields={[
          {
            type: 'select',
            name: 'action',
            label: '동작',
            options: [
              { value: '', label: '전체' },
              ...actions.map((item) => ({ value: item, label: item })),
            ],
          },
        ]}
        values={{ action }}
      />

      <Panel>
        {result.items.length === 0 ? (
          <AdminEmpty>기록이 없습니다.</AdminEmpty>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th className="num">시각</th>
                  <th>동작</th>
                  <th>관리자</th>
                  <th>대상</th>
                  <th>내용</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((log) => (
                  <tr key={log.id}>
                    <td className="num">{formatDateTime(log.createdAt)}</td>
                    <td>
                      <Badge $tone={log.action.includes('FAIL') ? 'danger' : 'muted'}>
                        {log.action}
                      </Badge>
                    </td>
                    <td>{log.adminLoginId ?? '—'}</td>
                    <td>{log.targetType ?? '—'}</td>
                    <td>{log.detail ?? '—'}</td>
                    <td>{log.ipAddress ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Panel>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/audit-logs"
        params={{ action: action || undefined }}
      />
    </AdminPage>
  );
}
