import { CHURCH_LOCATION, NAVER_MAP_LINK, SITE, siteUrl } from '@/lib/site';

export function SiteStructuredData() {
  const base = siteUrl();
  const address = {
    '@type': 'PostalAddress',
    streetAddress: '오목로19길 19',
    addressLocality: '양천구',
    addressRegion: '서울특별시',
    postalCode: '07934',
    addressCountry: 'KR',
  };
  const telephone = ['+82-2-2606-7344', '+82-2-2606-7644'];
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: SITE.nameKo,
        alternateName: SITE.name,
        inLanguage: 'ko-KR',
        publisher: { '@id': `${base}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: SITE.nameKo,
        alternateName: SITE.name,
        url: base,
        logo: `${base}/images/logo/kaleo-logo-after.svg`,
        image: `${base}/images/seo/home-share.png`,
        description: SITE.description,
        slogan: SITE.sloganKo,
        parentOrganization: { '@id': `${base}/#church` },
        location: { '@id': `${base}/#church-place` },
        sameAs: [
          'https://sudochurch.com/main/c03',
          SITE.social.instagram,
          SITE.social.youtube,
        ],
      },
      {
        '@type': 'Organization',
        '@id': `${base}/#church`,
        name: SITE.church,
        url: 'https://sudochurch.com/main/index',
        address,
        telephone,
        department: { '@id': `${base}/#organization` },
      },
      {
        '@type': 'Church',
        '@id': `${base}/#church-place`,
        name: SITE.church,
        url: 'https://sudochurch.com/main/a07',
        address,
        telephone,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: CHURCH_LOCATION.latitude,
          longitude: CHURCH_LOCATION.longitude,
        },
        hasMap: NAVER_MAP_LINK,
      },
      {
        '@type': 'WebPage',
        '@id': `${base}/#webpage`,
        url: base,
        name: SITE.nameKo,
        description: SITE.description,
        isPartOf: { '@id': `${base}/#website` },
        about: { '@id': `${base}/#organization` },
        inLanguage: 'ko-KR',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replaceAll('<', '\\u003c'),
      }}
    />
  );
}
