const LOW_EXPOSURE = {
  worshipWide: '/images/sections/worship-wide.jpg',
  artwork: '/images/sections/message-artwork.png',
} as const;

export const STATIC_IMAGES = {
  homeHero: '/images/hero/hero-worship.jpg',
  sermonPlaceholder: '/images/sections/message-artwork.png',
  setlists: [
    '/images/setlists/setlist-1.png',
    '/images/setlists/setlist-2.png',
    '/images/setlists/setlist-3.png',
    '/images/setlists/setlist-4.png',
    '/images/setlists/setlist-5.png',
    '/images/setlists/setlist-6.png',
    '/images/setlists/setlist-7.png',
  ],
  gallery: [
    '/images/gallery/design-grid-1.jpg',
    '/images/gallery/design-grid-2.jpg',
    '/images/gallery/design-grid-3.jpg',
    '/images/gallery/design-grid-4.jpg',
  ],
} as const;

export const IMAGES = {

  home: STATIC_IMAGES.homeHero,

  about: LOW_EXPOSURE.artwork,

  sub: LOW_EXPOSURE.worshipWide,

  sermons: '/images/sermon-pastor.jpg',

  jteen: LOW_EXPOSURE.worshipWide,

  events: LOW_EXPOSURE.artwork,

  share: LOW_EXPOSURE.worshipWide,
} as const;

export const GALLERY_STRIP: { src: string; caption: string }[] = [
  { src: LOW_EXPOSURE.worshipWide, caption: '주일 예배' },
  { src: LOW_EXPOSURE.artwork, caption: '예배 안내' },
  { src: '/images/sermon-pastor.jpg', caption: '말씀 시간' },
];
