import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import {
  DetailBody,
  PageHeader,
  PageTitle,
  StandingLine,
} from '@/styles/editorial.styled';

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: '수도교회 청소년부 KALEO YOUTH 웹사이트의 개인정보 처리방침입니다.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader>
        <PageTitle>개인정보 처리방침</PageTitle>
      </PageHeader>

      <StandingLine>
        이 웹사이트는 회원가입, 온라인 신청, 결제 기능을 제공하지 않으며 방문자에게서
        개인정보를 수집하지 않습니다.
      </StandingLine>

      <DetailBody>
        <h2 style={{ fontSize: 'var(--ky-fact)', marginBottom: 'var(--ky-sp-2)' }}>
          1. 수집하는 개인정보
        </h2>
        <p>
          {SITE.nameKo} 웹사이트는 방문자의 이름, 연락처, 이메일 등 어떠한 개인정보도
          입력받거나 저장하지 않습니다. 게시판에 댓글을 남기는 기능이나 일정 신청 기능이
          없으므로 방문자가 개인정보를 제공할 경로 자체가 없습니다.
        </p>
      </DetailBody>

      <DetailBody>
        <h2 style={{ fontSize: 'var(--ky-fact)', marginBottom: 'var(--ky-sp-2)' }}>
          2. 관리자 계정
        </h2>
        <p>
          콘텐츠 등록·수정을 위한 관리자 계정만 존재하며, 교역자와 부서 담당자에게만
          발급됩니다. 관리자 계정 정보(로그인 아이디, 이름, 직분)는 사이트 운영 목적으로만
          사용하고, 비밀번호는 복호화가 불가능한 형태로 암호화해 저장합니다.
        </p>
      </DetailBody>

      <DetailBody>
        <h2 style={{ fontSize: 'var(--ky-fact)', marginBottom: 'var(--ky-sp-2)' }}>
          3. 접속 기록
        </h2>
        <p>
          서비스 안정성과 보안 사고 대응을 위해 관리자 로그인 및 콘텐츠 변경 이력(작업 시각,
          접속 IP)을 기록합니다. 이 기록은 관리자만 열람할 수 있으며, 보관 기간이 지나면
          삭제합니다.
        </p>
      </DetailBody>

      <DetailBody>
        <h2 style={{ fontSize: 'var(--ky-fact)', marginBottom: 'var(--ky-sp-2)' }}>
          4. 외부 서비스
        </h2>
        <p>
          설교와 찬양 영상은 유튜브를 통해 제공됩니다. 영상을 재생하면 유튜브의 개인정보
          처리방침이 함께 적용되며, 본 사이트는 추적을 줄이기 위해 재생 전까지 유튜브에
          연결하지 않고 youtube-nocookie 도메인을 사용합니다.
        </p>
      </DetailBody>

      <DetailBody>
        <h2 style={{ fontSize: 'var(--ky-fact)', marginBottom: 'var(--ky-sp-2)' }}>
          5. 문의처
        </h2>
        <p>
          {SITE.church}<br />
          {SITE.contact.address}<br />
          {SITE.contact.phones.join(' / ')}
        </p>
      </DetailBody>
    </>
  );
}
