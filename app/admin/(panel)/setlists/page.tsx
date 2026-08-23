import type { Metadata } from 'next';
import { AdminSelectableTable } from '@/components/admin/AdminSelectableTable';
import { AdminPage, PageTitle, Panel, RowTitle } from '@/components/admin/parts';
import { AdminEmpty } from '@/components/admin/widgets';
import { Badge, ButtonLink } from '@/components/ui/primitives';
import { FilterBar } from '@/components/ui/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { apiGetSafe } from '@/lib/api';
import { formatDateDot } from '@/lib/format';
import { toPage, toText, type SearchParams } from '@/lib/search-params';
import type { PaginatedResult, Setlist, SetlistSyncStatus } from '@/lib/types';

export const metadata: Metadata = { title: 'J-Teen 콘티 관리' };

const EMPTY: PaginatedResult<Setlist> = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
const COLUMNS = [
  { label: '제목' },
  { label: '곡 수', numeric: true },
  { label: '출처' },
  { label: '예배일', numeric: true },
] as const;

const SYNC_LABEL: Record<SetlistSyncStatus, { label: string; tone: 'accent' | 'muted' | 'danger' }> =
  {
    manual: { label: '직접 입력', tone: 'muted' },
    imported: { label: '플레이리스트', tone: 'accent' },
    sync_failed: { label: '동기화 실패', tone: 'danger' },
  };

export default async function AdminSetlistsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = toPage(params.page);
  const keyword = toText(params.keyword);

  const result = await apiGetSafe<PaginatedResult<Setlist>>('/setlists', EMPTY, {
    authed: true,
    query: { page, limit: 20, keyword },
  });

  return (
    <AdminPage>
      <PageTitle>
        <h1>J-Teen 콘티</h1>
        <ButtonLink href="/admin/setlists/new" $small>
          콘티 등록
        </ButtonLink>
      </PageTitle>

      <FilterBar
        basePath="/admin/setlists"
        fields={[{ type: 'text', name: 'keyword', label: '검색', placeholder: '콘티 제목·곡 제목' }]}
        values={{ keyword }}
      />

      <Panel>
        {result.items.length === 0 ? (
          <AdminEmpty>등록된 콘티가 없습니다.</AdminEmpty>
        ) : (
          <AdminSelectableTable
            key={`${result.page}-${keyword}`}
            columns={COLUMNS}
            deletePathPrefix="/setlists/"
            rows={result.items.map((setlist) => {
              const sync = SYNC_LABEL[setlist.syncStatus] ?? SYNC_LABEL.manual;
              return {
                id: setlist.id,
                href: `/admin/setlists/${setlist.id}`,
                label: setlist.title,
                cells: [
                  <RowTitle key="title" href={`/admin/setlists/${setlist.id}`}>
                    {setlist.title}
                  </RowTitle>,
                  setlist.songs?.length ?? 0,
                  <Badge key="sync" $tone={sync.tone}>
                    {sync.label}
                  </Badge>,
                  formatDateDot(setlist.serviceDate),
                ],
              };
            })}
          />
        )}
      </Panel>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/setlists"
        params={{ keyword: keyword || undefined }}
      />
    </AdminPage>
  );
}
