import Link from 'next/link';
import { DetailBody, PageHeader, PageTitle } from '@/styles/editorial.styled';

export default function SiteNotFound() {
  return (
    <>
      <PageHeader>
        <PageTitle>페이지를 찾을 수 없습니다</PageTitle>
      </PageHeader>
      <DetailBody>
        <p>주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
        <p>
          <Link href="/">홈으로 돌아가기</Link>
        </p>
      </DetailBody>
    </>
  );
}
