import type { Metadata } from 'next';
import { AdminSelectableTable } from '@/components/admin/AdminSelectableTable';
import { AdminPage, PageTitle, Panel, RowTitle } from '@/components/admin/parts';
import { AdminEmpty } from '@/components/admin/widgets';
import { ButtonLink } from '@/components/ui/primitives';
import { FilterBar } from '@/components/ui/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { apiGetSafe } from '@/lib/api';
import { formatDateRange } from '@/lib/format';
import { toPage, toText, type SearchParams } from '@/lib/search-params';
import type { PaginatedResult, Post } from '@/lib/types';

export const metadata: Metadata = { title: '갤러리 관리' };

const EMPTY: PaginatedResult<Post> = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
const COLUMNS = [
  { label: '제목' },
  { label: '사진', numeric: true },
  { label: '조회', numeric: true },
  { label: '기간', numeric: true },
] as const;

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = toPage(params.page);
  const keyword = toText(params.keyword);

  const result = await apiGetSafe<PaginatedResult<Post>>('/posts', EMPTY, {
    authed: true,
    query: { boardType: 'gallery', page, limit: 20, keyword },
  });

  return (
    <AdminPage>
      <PageTitle>
        <h1>갤러리</h1>
        <ButtonLink href="/admin/gallery/new" $small>
          사진 올리기
        </ButtonLink>
      </PageTitle>

      <FilterBar
        basePath="/admin/gallery"
        fields={[{ type: 'text', name: 'keyword', label: '검색', placeholder: '제목·설명' }]}
        values={{ keyword }}
      />

      <Panel>
        {result.items.length === 0 ? (
          <AdminEmpty>등록된 갤러리 글이 없습니다.</AdminEmpty>
        ) : (
          <AdminSelectableTable
            key={`${result.page}-${keyword}`}
            columns={COLUMNS}
            deletePathPrefix="/posts/"
            rows={result.items.map((post) => ({
              id: post.id,
              href: `/admin/gallery/${post.id}`,
              label: post.title,
              cells: [
                <RowTitle key="title" href={`/admin/gallery/${post.id}`}>
                  {post.title}
                </RowTitle>,
                post.attachments?.length ?? 0,
                post.viewCount,
                formatDateRange(post.startDate, post.endDate),
              ],
            }))}
          />
        )}
      </Panel>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/gallery"
        params={{ keyword: keyword || undefined }}
      />
    </AdminPage>
  );
}
