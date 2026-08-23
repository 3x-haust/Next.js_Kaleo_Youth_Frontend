import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import type { SearchParams } from '@/lib/search-params';
import { toText } from '@/lib/search-params';
import { LoginForm } from './LoginForm';
import { BackLink, LoginCard, LoginScreen } from './parts';

export const metadata: Metadata = {
  title: '관리자 로그인',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const next = toText(params.next);

  return (
    <LoginScreen>
      <LoginCard>
        <header>
          <h1>{SITE.name}</h1>
          <p>관리자만 사용하는 화면입니다.</p>
        </header>

        <LoginForm next={next || undefined} />

        <BackLink href="/">← 홈으로 돌아가기</BackLink>
      </LoginCard>
    </LoginScreen>
  );
}
