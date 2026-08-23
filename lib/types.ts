export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Attachment {
  id: string;
  ownerType:
    | 'post'
    | 'setlist'
    | 'event'
    | 'sermon'
    | 'worship_team'
    | 'worship_team_member'
    | 'about_page';
  ownerId: string | null;
  fileUrl: string;
  originalName: string | null;
  fileType: string | null;
  fileSize: string | null;
  displayOrder: number;
  createdAt: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacherName: string;
  bibleReference: string | null;
  youtubeVideoId: string | null;
  thumbnailUrl?: string | null;
  posterUrl?: string | null;
  recentThumbnailUrl?: string | null;
  attachments?: Attachment[];
  summary: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  itemsToBring: string | null;
  feeInfo: string | null;
  contactInfo: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BoardType = 'notice' | 'gallery';

export interface Post {
  id: string;
  boardType: BoardType;
  title: string;
  content: string | null;
  thumbnailUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface AboutValue {
  readonly icon: 'cross' | 'bible' | 'people';
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

export interface AboutPage {
  readonly id: string;
  readonly introEyebrow: string;
  readonly introTitle: string;
  readonly introBody: string;
  readonly values: readonly AboutValue[];
  readonly leaderEyebrow: string;
  readonly leaderName: string;
  readonly leaderRole: string;
  readonly leaderBody: string;
  readonly leaderPhotoUrl: string | null;
  readonly teamEyebrow: string;
  readonly closingPhotoUrl: string | null;
  readonly closingPhotoLabel: string;
  readonly closingLines: readonly string[];
  readonly closingLabel: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorshipTeamMember {
  id: string;
  teamId: string;
  name: string;
  part: string | null;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number;
}

export interface WorshipTeam {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  scheduleInfo: string | null;
  members: WorshipTeamMember[];
  createdAt: string;
  updatedAt: string;
}

export type SetlistSyncStatus = 'manual' | 'imported' | 'sync_failed';

export interface SetlistSong {
  id: string;
  setlistId: string;
  displayOrder: number;
  songTitle: string;
  artist: string | null;
  youtubeVideoId: string | null;
  youtubeVideoTitle: string | null;
  thumbnailUrl: string | null;
  note: string | null;
  sheetFileUrl: string | null;
  isUnavailable: boolean;
}

export interface SetlistAttachment {
  readonly id: string;
  readonly fileUrl: string;
  readonly originalName: string | null;
  readonly fileType: string | null;
  readonly fileSize: string | null;
  readonly displayOrder: number;
}

export interface Setlist {
  id: string;
  teamId: string | null;
  team?: WorshipTeam | null;
  serviceDate: string;
  title: string;
  fileUrl: string | null;
  youtubePlaylistId: string | null;
  youtubePlaylistTitle: string | null;
  lastSyncedAt: string | null;
  syncStatus: SetlistSyncStatus;
  songs: SetlistSong[];
  readonly attachments?: readonly SetlistAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  id: string;
  loginId: string;
  name: string;
  positionLabel: string | null;
  isSuperAdmin: boolean;
}

export interface AdminAccount extends AdminProfile {
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string | null;
  adminLoginId: string | null;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PlaylistImportSong {
  displayOrder: number;
  songTitle: string;
  artist: string | null;
  youtubeVideoId: string | null;
  youtubeVideoTitle: string | null;
  thumbnailUrl: string | null;
  isUnavailable: boolean;
}

export interface PlaylistImportResult {
  playlistId: string;
  playlistTitle: string | null;
  songs: PlaylistImportSong[];
  unavailableCount: number;
}
