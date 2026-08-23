import type { Metadata } from 'next';
import { AdminSelectableTable } from '@/components/admin/AdminSelectableTable';
import { AdminPage, PageTitle, Panel, RowTitle } from '@/components/admin/parts';
import { AdminEmpty } from '@/components/admin/widgets';
import { Badge, ButtonLink } from '@/components/ui/primitives';
import { FilterBar } from '@/components/ui/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { apiGetSafe } from '@/lib/api';
import { formatDateDot, formatDateRange } from '@/lib/format';
import { toPage, toText, type SearchParams } from '@/lib/search-params';
import type { ChurchEvent, PaginatedResult } from '@/lib/types';

export const metadata: Metadata = { title: '일정 관리' };

const EMPTY: PaginatedResult<ChurchEvent> = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};
const COLUMNS = [
  { label: '일정명' },
  { label: '장소' },
  { label: '기간', numeric: true },
] as const;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = toPage(params.page);
  const keyword = toText(params.keyword);

  const result = await apiGetSafe<PaginatedResult<ChurchEvent>>('/events', EMPTY, {
    authed: true,
    query: { page, limit: 20, keyword, scope: 'upcoming' },
  });

  return (
    <AdminPage>
      <PageTitle>
        <h1>일정</h1>
        <ButtonLink href="/admin/events/new" $small>
          일정 등록
        </ButtonLink>
      </PageTitle>

      <FilterBar
        basePath="/admin/events"
        fields={[
          { type: 'text', name: 'keyword', label: '검색', placeholder: '일정명·안내' },
        ]}
        values={{ keyword }}
      />

      <Panel>
        {result.items.length === 0 ? (
          <AdminEmpty>등록된 일정이 없습니다.</AdminEmpty>
        ) : (
          <AdminSelectableTable
            key={`${result.page}-${keyword}`}
            columns={COLUMNS}
            deletePathPrefix="/events/"
            rows={result.items.map((item) => ({
              id: item.id,
              href: `/admin/events/${item.id}`,
              label: item.title,
              cells: [
                <span key="title">
                      <Badge $tone="accent">예정</Badge>{' '}
                      <RowTitle href={`/admin/events/${item.id}`}>{item.title}</RowTitle>
                </span>,
                item.location ?? '—',
                item.endDate
                  ? formatDateRange(item.startDate, item.endDate)
                  : formatDateDot(item.startDate),
              ],
            }))}
          />
        )}
      </Panel>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/events"
        params={{ keyword: keyword || undefined }}
      />
    </AdminPage>
  );
}
