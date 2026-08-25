import { AdminPage, Panel } from '@/components/admin/parts';

export default function AdminLoading() {
  return (
    <AdminPage aria-busy="true" aria-live="polite">
      <Panel>
        <strong>불러오는 중</strong>
      </Panel>
    </AdminPage>
  );
}
