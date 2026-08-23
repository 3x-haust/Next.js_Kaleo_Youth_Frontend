import type { Metadata } from 'next';
import { PasswordForm } from '@/components/admin/PasswordForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';
import { requireAdmin } from '@/lib/admin-auth';

export const metadata: Metadata = { title: '내 비밀번호 변경' };

export default async function AdminPasswordPage() {
  await requireAdmin();

  return (
    <AdminPage>
      <PageTitle>
        <h1>내 비밀번호 변경</h1>
      </PageTitle>
      <Panel $narrow>
        <PasswordForm />
      </Panel>
    </AdminPage>
  );
}
