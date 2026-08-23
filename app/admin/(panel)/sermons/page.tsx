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
import type { PaginatedResult, Sermon } from '@/lib/types';

export const metadata: Metadata = { title: '말씀 관리' };

const EMPTY: PaginatedResult<Sermon> = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
const COLUMNS = [
  { label: '제목' },
  { label: '설교자' },
  { label: '본문' },
  { label: '설교일', numeric: true },
] as const;

export default async function AdminSermonsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = toPage(params.page);
  const keyword = toText(params.keyword);
  const preacher = toText(params.preacher);

  const [result, preachers] = await Promise.all([
    apiGetSafe<PaginatedResult<Sermon>>('/sermons', EMPTY, {
      authed: true,
      query: { page, limit: 20, keyword, preacher },
    }),
    apiGetSafe<string[]>('/sermons/preachers', [], { authed: true }),
  ]);

  return (
    <AdminPage>
      <PageTitle>
        <h1>말씀</h1>
        <ButtonLink href="/admin/sermons/new" $small>
          말씀 등록
        </ButtonLink>
      </PageTitle>

      <FilterBar
        basePath="/admin/sermons"
        fields={[
          { type: 'text', name: 'keyword', label: '검색', placeholder: '제목·본문·요약' },
          {
            type: 'select',
            name: 'preacher',
            label: '설교자',
            options: [
              { value: '', label: '전체' },
              ...preachers.map((name) => ({ value: name, label: name })),
            ],
          },
        ]}
        values={{ keyword, preacher }}
      />

      <Panel>
        {result.items.length === 0 ? (
          <AdminEmpty>등록된 말씀이 없습니다.</AdminEmpty>
        ) : (
          <AdminSelectableTable
            key={`${result.page}-${keyword}-${preacher}`}
            columns={COLUMNS}
            deletePathPrefix="/sermons/"
            rows={result.items.map((sermon) => ({
              id: sermon.id,
              href: `/admin/sermons/${sermon.id}`,
              label: sermon.title,
              cells: [
                <span key="title">
                      {sermon.youtubeVideoId ? <Badge $tone="accent">영상</Badge> : null}{' '}
                      <RowTitle href={`/admin/sermons/${sermon.id}`}>{sermon.title}</RowTitle>
                </span>,
                sermon.preacherName,
                sermon.bibleReference ?? '—',
                formatDateDot(sermon.publishedAt),
              ],
            }))}
          />
        )}
      </Panel>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/sermons"
        params={{ keyword: keyword || undefined, preacher: preacher || undefined }}
      />
    </AdminPage>
  );
}
