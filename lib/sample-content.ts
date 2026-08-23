import type { ChurchEvent, Post, Sermon, Setlist } from './types';

export const SAMPLE_SERMON: Sermon = {
  id: 'sample-sermon',
  title: '돈에 기대지 마십시오.',
  preacherName: '성백영 담임목사',
  bibleReference: '잠언 10장 1-4절',
  youtubeVideoId: 'ScMzIvxBSi4',
  summary: '하나님을 신뢰하며 정직하고 성실하게 살아가는 지혜를 나눕니다.',
  publishedAt: '2026-07-26',
  createdAt: '2026-07-26',
  updatedAt: '2026-07-26',
};

const timestamp = '2026-08-01T09:00:00.000Z';

const sampleEventRows = [
  ['sample-event-worship', '주일 청소년 예배', '하나님께 예배하고 함께 말씀을 나누는 시간', '2024-06-16T11:00:00+09:00', null, '수도교회 본당'],
  ['sample-event-fellowship', '주일 청년 모임', '함께 교제하며 신앙을 나누는 시간', '2024-06-23T13:00:00+09:00', null, '수도교회 교육관'],
  ['sample-event-study', '성경 공부 모임', '말씀을 깊이 있게 탐구하는 시간', '2024-06-25T19:30:00+09:00', null, '수도교회 소예배실'],
  ['sample-event-prayer', '기도회', '함께 모여 교회의 기도 제목을 나누는 시간', '2024-06-28T20:00:00+09:00', null, '수도교회 기도실'],
] satisfies Array<readonly [string, string, string, string, string | null, string]>;

export const SAMPLE_EVENTS: ChurchEvent[] = sampleEventRows.map(([id, title, description, startDate, endDate, location]) => ({
  id,
  title,
  description,
  startDate,
  endDate,
  location,
  itemsToBring: '성경, 필기도구',
  feeInfo: null,
  contactInfo: null,
  coverImageUrl: '/images/sections/message-artwork.png',
  createdAt: timestamp,
  updatedAt: timestamp,
}));

const gallerySources = [
  '/images/gallery/sanitized/design-story-1.jpg',
  '/images/gallery/design-card-photo-2.jpg',
  '/images/gallery/sanitized/design-story-3.jpg',
  '/images/gallery/sanitized/design-story-4.jpg',
  '/images/exact/image-98-3166-cal.png',
  '/images/gallery/sanitized/design-story-1.jpg',
  '/images/gallery/sanitized/design-story-1.jpg',
  '/images/gallery/sanitized/design-story-1.jpg',
  '/images/gallery/sanitized/design-story-1.jpg',
] as const;

export const SAMPLE_GALLERY_POSTS: Post[] = gallerySources.map((src, index) => ({
  id: `sample-gallery-${index + 1}`,
  boardType: 'gallery',
  title: '청소년부 여름캠프',
  content: '함께 예배하고 웃으며 쌓아 간 KALEO YOUTH의 이야기입니다.',
  thumbnailUrl: src,
  startDate: '2026-06-10',
  endDate: null,
  isPinned: false,
  viewCount: 0,
  createdAt: '2026-06-10T09:00:00.000Z',
  updatedAt: timestamp,
  attachments: (index === 0
    ? [
        '/images/gallery/design-detail-main.jpg',
        '/images/gallery/design-detail-1.jpg',
        '/images/gallery/design-detail-2.jpg',
        '/images/gallery/design-detail-3.jpg',
        '/images/gallery/design-detail-4.jpg',
      ]
    : [src]).map((fileUrl, photoIndex) => ({
    id: `sample-gallery-photo-${index + 1}-${photoIndex + 1}`,
    ownerType: 'post',
    ownerId: `sample-gallery-${index + 1}`,
    fileUrl,
    originalName: null,
    fileType: 'image/jpeg',
    fileSize: null,
    displayOrder: photoIndex,
    createdAt: timestamp,
  })),
}));

export const SAMPLE_NOTICES: Post[] = [
  ['sample-notice-1', '주일예배 시간과 장소 안내', true],
  ['sample-notice-2', 'KALEO 여름 수련회 준비물 안내', false],
  ['sample-notice-3', 'J-Teen 찬양팀 연습 일정', false],
].map(([id, title, isPinned], index) => ({
  id: String(id),
  boardType: 'notice',
  title: String(title),
  content: 'KALEO YOUTH 공동체에 필요한 안내를 전합니다. 자세한 내용은 담당 교사에게 문의해 주세요.',
  thumbnailUrl: null,
  startDate: null,
  endDate: null,
  isPinned: Boolean(isPinned),
  viewCount: 0,
  createdAt: `2026-08-${String(12 - index).padStart(2, '0')}T09:00:00.000Z`,
  updatedAt: timestamp,
  attachments: [],
}));

function sampleSetlist(id: string, thumbnails: readonly string[]): Setlist {
  return {
    id,
    teamId: null,
    team: null,
    serviceDate: '2026-08-13',
    title: '주일예배 찬양 콘티',
    fileUrl: null,
    youtubePlaylistId: null,
    youtubePlaylistTitle: null,
    lastSyncedAt: null,
    syncStatus: 'manual',
    songs: thumbnails.map((thumbnailUrl, index) => ({
      id: `${id}-song-${index + 1}`,
      setlistId: id,
      displayOrder: index,
      songTitle: `찬양 ${index + 1}`,
      artist: 'J-TEEN',
      youtubeVideoId: 'ScMzIvxBSi4',
      youtubeVideoTitle: null,
      thumbnailUrl,
      note: null,
      sheetFileUrl: null,
      isUnavailable: false,
    })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const SAMPLE_SETLISTS = {
  'sample-three': sampleSetlist('sample-three', [
    '/images/setlists/setlist-1.png',
    '/images/setlists/setlist-2.png',
    '/images/setlists/setlist-3.png',
  ]),
  'sample-four': sampleSetlist('sample-four', [
    '/images/setlists/setlist-5.png',
    '/images/setlists/setlist-4.png',
    '/images/setlists/setlist-6.png',
    '/images/setlists/setlist-7.png',
  ]),
} as const satisfies Readonly<Record<string, Setlist>>;

export function sampleSetlistById(id: string): Setlist | null {
  return SAMPLE_SETLISTS[id as keyof typeof SAMPLE_SETLISTS] ?? null;
}

export function sampleEventById(id: string): ChurchEvent | null {
  return SAMPLE_EVENTS.find((event) => event.id === id) ?? null;
}

export function samplePostById(id: string): Post | null {
  const exact = [...SAMPLE_GALLERY_POSTS, ...SAMPLE_NOTICES].find((post) => post.id === id);
  if (exact) return exact;

  const galleryNumber = /^sample-gallery-(\d+)$/.exec(id)?.[1];
  if (!galleryNumber) return null;

  return SAMPLE_GALLERY_POSTS[(Number(galleryNumber) - 1) % SAMPLE_GALLERY_POSTS.length] ?? null;
}
