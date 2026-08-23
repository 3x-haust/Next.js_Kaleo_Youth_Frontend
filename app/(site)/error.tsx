'use client';

import { useEffect } from 'react';
import { DetailBody, PageHeader, PageTitle } from '@/styles/editorial.styled';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader>
        <PageTitle>화면을 불러오지 못했습니다</PageTitle>
      </PageHeader>
      <DetailBody>
        <p>잠시 후 다시 시도해 주세요. 계속 같은 문제가 생기면 담당 교사에게 알려 주세요.</p>
        <p style={{ marginTop: 'var(--ky-sp-3)' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: 'var(--ky-sp-1) var(--ky-sp-3)',
              border: '1px solid var(--ky-ink)',
              background: 'transparent',
              color: 'var(--ky-ink)',
              fontSize: 'var(--ky-table)',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </p>
      </DetailBody>
    </>
  );
}
