export const SITE = {
  name: 'KALEO YOUTH',
  nameKo: '수도교회 청소년부',
  church: '수도교회',
  department: '청소년부',
  slogan: 'Called by God, Living for His Purpose.',
  sloganKo: '하나님의 부르심을 따라, 그분의 목적을 위해 살아갑니다.',
  description:
    '수도교회 청소년부 KALEO YOUTH — 주일 오전 10시, 본관 1층 소예배실에서 함께 예배합니다.',

  worship: {
    time: '주일 오전 10:00',
    place: '본관 1층 소예배실',
  },

  leaders: [
    { name: '박정인 목사', role: '담당 교역자' },
    { name: '김동호 집사', role: '청소년부 부장' },
  ],

  contact: {
    address: '서울특별시 양천구 오목로19길 19',
    phones: ['02.2606.7344', '02.2606.7644'],
  },

  social: {
    instagram: 'https://www.instagram.com/sdbc_youth/',
    youtube: 'https://www.youtube.com/channel/UCOu3vzGN6T3iDD9YzOPVIuw',
  },

  team: {
    name: 'J-Teen',
    label: 'J-Teen 찬양팀',
  },
} as const;

export const NAV = [
  { href: '/about', label: '소개' },
  { href: '/sermons', label: '말씀' },
  { href: '/jteen', label: 'J-Teen 찬양팀' },
  { href: '/events', label: '일정' },
  { href: '/share/gallery', label: '갤러리' },
] as const;

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export const CHURCH_LOCATION = {
  latitude: 37.524967193604,
  longitude: 126.84674835205,
} as const;

export const NAVER_MAP_LINK =
  `https://map.naver.com/p/search/${encodeURIComponent(SITE.contact.address)}`;
