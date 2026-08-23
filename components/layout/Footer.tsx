'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import {
  Background,
  Content,
  FooterRoot,
  MobileNav,
} from './Footer.styled';
import {
  AccentRule,
  Identity,
  Slogan,
  SloganKo,
  SloganLead,
  Wordmark,
} from './FooterIdentity.styled';
import {
  Contact,
  ContactDetails,
  ContactIcon,
  ContactRow,
  DesignBy,
  Rule,
} from './FooterContact.styled';

const FOOTER_NAV = [
  { href: '/about', label: '소개' },
  { href: '/sermons', label: '말씀' },
  { href: '/jteen', label: 'J-Teen' },
  { href: '/events', label: '일정' },
  { href: '/share/gallery', label: '갤러리' },
] as const;

export function Footer() {
  return (
    <FooterRoot data-zone="site-footer">
      <Background aria-hidden="true" />
      <Content>
        <Identity>
          <Wordmark href="/" aria-label="KALEO YOUTH 홈">
            <Image src="/images/logo/kaleo-logo-footer.svg" alt="" width={149} height={92} loading="lazy" />
          </Wordmark>
          <Slogan>
            <SloganLead data-zone="footer-slogan-lead">Called to serve.</SloganLead>
            <br />
            <strong data-zone="footer-slogan-built">Built to last.</strong>
          </Slogan>
          <AccentRule data-zone="footer-accent-rule" aria-hidden="true" />
          <SloganKo data-zone="footer-identity-copy">
            바른 예배를 통해 예수님을 만나고<br />
            가정과 학교 어디에서든<br />
            건강한 다음세대의 기준으로 서는 청소년부입니다.
          </SloganKo>
        </Identity>

        <MobileNav aria-label="하단 메뉴">
          {FOOTER_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </MobileNav>

        <Contact>
          <ContactDetails>
            <ContactRow data-zone="footer-address-row" as="p">
              <ContactIcon data-zone="footer-contact-icon" aria-hidden="true">
                <Image src="/images/icons/contact-location.svg" alt="" width={24} height={24} loading="lazy" unoptimized />
              </ContactIcon>
              <span data-zone="footer-address-copy">수도교회 청소년부<br />{SITE.contact.address}</span>
            </ContactRow>
            <ContactRow data-zone="footer-phone-row" as="p">
              <ContactIcon data-zone="footer-contact-icon" aria-hidden="true">
                <Image src="/images/icons/contact-phone.svg" alt="" width={24} height={24} loading="lazy" unoptimized />
              </ContactIcon>
              <span>
                T. {SITE.contact.phones[0]} · {SITE.contact.phones[1]}<br />
                F. 02.2605.5012
              </span>
            </ContactRow>
            <Rule data-zone="footer-contact-rule" />
            <p data-zone="footer-copyright">&copy; {new Date().getFullYear()} {SITE.church} {SITE.department}. All Rights Reserved.</p>
          </ContactDetails>
          <DesignBy>
            <span data-zone="footer-design-by">Design by</span>
            <Image src="/images/logo/church-mark.png" alt="수도교회" width={300} height={91} sizes="300px" loading="lazy" />
          </DesignBy>
        </Contact>
      </Content>
    </FooterRoot>
  );
}
