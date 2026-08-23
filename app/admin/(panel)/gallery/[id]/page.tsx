import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostForm } from '@/components/admin/PostForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';
import { ButtonLink } from '@/components/ui/primitives';
import { apiGet } from '@/lib/api';
import type { Post } from '@/lib/types';

export const metadata: Metadata = { title: '갤러리 수정' };

async function loadPost(id: string): Promise<Post | null> {
  try {
    return await apiGet<Post>(`/posts/${id}`, { authed: true });
  } catch {
    return null;
  }
}

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post || post.boardType !== 'gallery') notFound();

  return (
    <AdminPage>
      <PageTitle>
        <h1>갤러리 수정</h1>
        <ButtonLink href={`/share/gallery/${post.id}`} $variant="outline" $small>
          사이트에서 보기
        </ButtonLink>
      </PageTitle>
      <Panel>
        <PostForm post={post} />
      </Panel>
    </AdminPage>
  );
}
