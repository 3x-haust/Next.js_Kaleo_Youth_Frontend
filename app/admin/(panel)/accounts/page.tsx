import type { Metadata } from 'next';
import { AccountManager } from '@/components/admin/AccountManager';
import { AdminPage, PageTitle } from '@/components/admin/parts';
import { Notice } from '@/components/ui/primitives';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { apiGetSafe } from '@/lib/api';
import type { AdminAccount } from '@/lib/types';

export const metadata: Metadata = { title: '관리자 계정' };

export default async function AdminAccountsPage() {
  const admin = await requireSuperAdmin();
  const accounts = await apiGetSafe<AdminAccount[]>('/admin/accounts', [], { authed: true });

  return (
    <AdminPage>
      <PageTitle>
        <h1>관리자 계정</h1>
      </PageTitle>

      <Notice $tone="warn">
        계정 하나가 뚫리면 사이트 전체 콘텐츠가 위험해집니다. 계정은 꼭 필요한 사람에게만 만들어
        주고, 비밀번호는 사람마다 다르게 정해 주세요.
      </Notice>

      <AccountManager accounts={accounts} currentAdminId={admin.id} />
    </AdminPage>
  );
}
