import type { Metadata } from 'next';
import { PostForm } from '@/components/admin/PostForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';

export const metadata: Metadata = { title: '사진 올리기' };

export default function NewGalleryPage() {
  return (
    <AdminPage>
      <PageTitle>
        <h1>사진 올리기</h1>
      </PageTitle>
      <Panel>
        <PostForm />
      </Panel>
    </AdminPage>
  );
}
