import type { Metadata } from 'next';
import { AdminPage, PageTitle, Panel, PanelTitle, StatCard, StatGrid, Table, TableWrap, RowTitle } from '@/components/admin/parts';
import { Badge, ButtonLink } from '@/components/ui/primitives';
import { requireAdmin } from '@/lib/admin-auth';
import { apiGetSafe } from '@/lib/api';
import { formatDateDot } from '@/lib/format';
import type { AuditLog, ChurchEvent, PaginatedResult, Post, Sermon, Setlist } from '@/lib/types';

export const metadata: Metadata = { title: '대시보드' };

const EMPTY = { items: [], total: 0, page: 1, limit: 5, totalPages: 1 };

export default async function AdminDashboardPage() {
  const [admin, gallery, sermons, events, setlists, logs] = await Promise.all([
    requireAdmin(),
    apiGetSafe<PaginatedResult<Post>>('/posts', EMPTY, {
      authed: true,
      query: { boardType: 'gallery', limit: 1 },
    }),
    apiGetSafe<PaginatedResult<Sermon>>('/sermons', EMPTY, { authed: true, query: { limit: 1 } }),
    apiGetSafe<PaginatedResult<ChurchEvent>>('/events', EMPTY, {
      authed: true,
      query: { limit: 5, scope: 'upcoming' },
    }),
    apiGetSafe<PaginatedResult<Setlist>>('/setlists', EMPTY, { authed: true, query: { limit: 1 } }),
    apiGetSafe<PaginatedResult<AuditLog>>('/admin/audit-logs', EMPTY, {
      authed: true,
      query: { limit: 8 },
    }),
  ]);

  return (
    <AdminPage>
      <PageTitle>
        <h1>{admin.name}님, 안녕하세요</h1>
      </PageTitle>

      <StatGrid>
        <StatCard href="/admin/gallery">
          <small>갤러리</small>
          <strong>{gallery.total}</strong>
        </StatCard>
        <StatCard href="/admin/sermons">
          <small>말씀</small>
          <strong>{sermons.total}</strong>
        </StatCard>
        <StatCard href="/admin/events">
          <small>일정</small>
          <strong>{events.total}</strong>
        </StatCard>
        <StatCard href="/admin/setlists">
          <small>J-Teen 콘티</small>
          <strong>{setlists.total}</strong>
        </StatCard>
      </StatGrid>

      <Panel>
        <PanelTitle>다가오는 일정</PanelTitle>
        {events.items.length === 0 ? (
          <p>예정된 일정이 없습니다.</p>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>일정명</th>
                  <th className="num">시작일</th>
                </tr>
              </thead>
              <tbody>
                {events.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <RowTitle href={`/admin/events/${item.id}`}>{item.title}</RowTitle>
                    </td>
                    <td className="num">{formatDateDot(item.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Panel>

      <Panel>
        <PanelTitle>최근 활동 기록</PanelTitle>
        {logs.items.length === 0 ? (
          <p>기록이 없습니다.</p>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>시각</th>
                  <th>동작</th>
                  <th>관리자</th>
                  <th>내용</th>
                </tr>
              </thead>
              <tbody>
                {logs.items.map((log) => (
                  <tr key={log.id}>
                    <td className="num">{formatDateDot(log.createdAt)}</td>
                    <td>
                      <Badge $tone={log.action.includes('FAIL') ? 'danger' : 'muted'}>
                        {log.action}
                      </Badge>
                    </td>
                    <td>{log.adminLoginId ?? '—'}</td>
                    <td>{log.detail ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
        <p style={{ marginTop: 14 }}>
          <ButtonLink href="/admin/audit-logs" $variant="outline" $small>
            전체 기록 보기
          </ButtonLink>
        </p>
      </Panel>
    </AdminPage>
  );
}
