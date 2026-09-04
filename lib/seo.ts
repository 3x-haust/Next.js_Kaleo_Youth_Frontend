import type { Metadata } from 'next';
import { SITE } from './site';

const DEFAULT_SHARE_IMAGE = '/images/seo/home-share.png';

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_SHARE_IMAGE,
}: {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly image?: string;
}): Metadata {
  const socialTitle =
    title === SITE.nameKo ? title : `${title} · ${SITE.nameKo}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      type: 'website',
      locale: 'ko_KR',
      url: path,
      siteName: SITE.nameKo,
      images: [
        image === DEFAULT_SHARE_IMAGE
          ? {
              url: image,
              width: 1200,
              height: 630,
              alt: socialTitle,
            }
          : { url: image, alt: socialTitle },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
