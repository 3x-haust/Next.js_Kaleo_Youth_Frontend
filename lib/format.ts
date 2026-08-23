const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function parse(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = parse(value);
  if (!date) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatDateDot(value: string | Date | null | undefined): string {
  const date = parse(value);
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

export function formatDateWithWeekday(value: string | Date | null | undefined): string {
  const date = parse(value);
  if (!date) return '';
  return `${formatDate(date)} (${WEEKDAYS[date.getDay()]})`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = parse(value);
  if (!date) return '';
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${formatDateDot(date)} ${hour}:${minute}`;
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return '';
  if (!end || end === start) return formatDateWithWeekday(start);

  const from = parse(start);
  const to = parse(end);
  if (!from || !to) return formatDate(start);

  if (from.getFullYear() === to.getFullYear()) {
    return `${formatDate(from)} ~ ${to.getMonth() + 1}월 ${to.getDate()}일`;
  }
  return `${formatDate(from)} ~ ${formatDate(to)}`;
}

export function isUpcoming(start: string, end: string | null): boolean {
  const last = parse(end ?? start);
  if (!last) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return last.getTime() >= today.getTime();
}

export function excerpt(text: string | null | undefined, length = 90): string {
  if (!text) return '';
  const plain = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

export function formatFileSize(bytes: string | number | null | undefined): string {
  const size = typeof bytes === 'string' ? Number(bytes) : bytes;
  if (!size || Number.isNaN(size)) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function toFileUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  if (fileUrl.startsWith('/images/')) return fileUrl;
  const origin =
    process.env.NEXT_PUBLIC_API_ORIGIN ?? 'https://api.kaleoyouth.com';
  return `${origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function youtubePlaylistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/maxresdefault.jpg`;
}
