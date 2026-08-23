import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);
const required = (max: number, label: string) =>
  z.string().trim().min(1, `${label}을(를) 입력해 주세요.`).max(max, `${max}자 이내로 입력해 주세요.`);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜를 선택해 주세요.');

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.')
  .or(z.literal(''));

const youtubeVideoUrl = trimmed(300).refine(
  (value) =>
    value.length === 0
    || /^[A-Za-z0-9_-]{11}$/.test(value)
    || /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)[A-Za-z0-9_-]{11}(?:[?&#/].*)?$/.test(
      value,
    ),
  '올바른 YouTube 영상 주소를 입력해 주세요.',
);

export const loginSchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(3, '아이디는 3자 이상입니다.')
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, '아이디는 영문·숫자와 . _ - 만 사용할 수 있습니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상입니다.').max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,128}$/;
export const PASSWORD_MESSAGE =
  '비밀번호는 10자 이상이며 영문·숫자·특수문자를 각각 하나 이상 포함해야 합니다.';

const strongPassword = z.string().regex(PASSWORD_RULE, PASSWORD_MESSAGE);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, '현재 비밀번호를 입력해 주세요.').max(128),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: '새 비밀번호가 서로 다릅니다.',
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const postSchema = z
  .object({
    boardType: z.enum(['notice', 'gallery']),
    title: required(200, '제목'),
    content: trimmed(50000),
    startDate: dateString,
    endDate: optionalDate,
    isPinned: z.boolean(),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    path: ['endDate'],
    message: '종료일은 시작일보다 빠를 수 없습니다.',
  });
export type PostInput = z.infer<typeof postSchema>;

export const sermonSchema = z.object({
  title: required(200, '제목'),
  preacherName: required(50, '설교자'),
  bibleReference: trimmed(120),
  youtubeUrl: youtubeVideoUrl,
  summary: trimmed(5000),
  publishedAt: dateString,
});
export type SermonInput = z.infer<typeof sermonSchema>;

export const eventSchema = z
  .object({
    title: required(200, '일정명'),
    description: trimmed(10000),
    startDate: dateString,
    endDate: optionalDate,
    location: trimmed(200),
    itemsToBring: trimmed(2000),

    feeInfo: trimmed(200),
    contactInfo: trimmed(200),
    coverImageUrl: trimmed(500),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    path: ['endDate'],
    message: '종료일은 시작일보다 빠를 수 없습니다.',
  });
export type EventInput = z.infer<typeof eventSchema>;

export const setlistSongSchema = z.object({
  songTitle: required(300, '곡 제목'),
  artist: trimmed(200),
  youtubeUrl: trimmed(300),
  youtubeVideoTitle: trimmed(500),
  thumbnailUrl: trimmed(500),

  note: trimmed(300),
  sheetFileUrl: trimmed(500),
  isUnavailable: z.boolean(),
});
export type SetlistSongInput = z.infer<typeof setlistSongSchema>;

export const setlistSchema = z.object({
  serviceDate: dateString,
  title: required(200, '콘티 제목'),
  fileUrl: trimmed(500),
  youtubePlaylistUrl: trimmed(300),
  youtubePlaylistTitle: trimmed(300),
  songs: z
    .array(setlistSongSchema)
    .min(1, '곡을 한 곡 이상 등록해 주세요.')
    .max(100, '곡은 100곡까지 등록할 수 있습니다.'),
});
export type SetlistInput = z.infer<typeof setlistSchema>;

export const playlistUrlSchema = z.object({
  playlistUrl: z
    .string()
    .trim()
    .min(10, '플레이리스트 주소를 입력해 주세요.')
    .max(300)
    .refine((value) => /[?&]list=[A-Za-z0-9_-]{10,64}/.test(value) || /^[A-Za-z0-9_-]{10,64}$/.test(value), {
      message: '유튜브 플레이리스트 주소(list=...)를 입력해 주세요.',
    }),
});

export const teamSchema = z.object({
  name: required(100, '팀 이름'),
  description: trimmed(10000),
  coverImageUrl: trimmed(500),
  scheduleInfo: trimmed(2000),
});
export type TeamInput = z.infer<typeof teamSchema>;

export const memberSchema = z.object({
  name: required(50, '이름'),
  part: trimmed(50),
  bio: trimmed(200),
  displayOrder: z.number().int().min(0),
});
export type MemberInput = z.infer<typeof memberSchema>;

const aboutValueSchema = z.object({
  icon: z.enum(['cross', 'bible', 'people']),
  label: required(30, '가치 영문 제목'),
  title: required(100, '가치 제목'),
  body: required(300, '가치 설명'),
});

export const aboutSchema = z.object({
  introEyebrow: required(50, '소개 영문 제목'),
  introTitle: required(150, '소개 제목'),
  introBody: required(1000, '소개 본문'),
  values: z.array(aboutValueSchema).length(3),
  leaderEyebrow: required(50, '담당자 영문 제목'),
  leaderName: required(50, '담당자 이름'),
  leaderRole: required(100, '담당자 역할'),
  leaderBody: required(3000, '담당자 인사말'),
  teamEyebrow: required(50, '팀 영문 제목'),
  closingPhotoLabel: required(150, '마무리 이미지 설명'),
  closingLines: z.array(required(200, '마무리 문구')).length(2),
  closingLabel: required(100, '마무리 영문 제목'),
  metaTitle: required(100, '페이지 제목'),
  metaDescription: required(300, '페이지 설명'),
});
export type AboutInput = z.infer<typeof aboutSchema>;

export const createAdminSchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(3, '아이디는 3자 이상입니다.')
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, '아이디는 영문·숫자와 . _ - 만 사용할 수 있습니다.'),
  password: strongPassword,
  name: required(50, '이름'),
  positionLabel: trimmed(50),
  isSuperAdmin: z.boolean(),
});
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export const resetPasswordSchema = z.object({ newPassword: strongPassword });

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export function omitEmpty<T extends Record<string, unknown>>(value: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === '' || item === undefined || item === null) continue;
    result[key] = item;
  }
  return result as Partial<T>;
}
