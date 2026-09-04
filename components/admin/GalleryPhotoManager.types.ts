export type GalleryPhotoItem = {
  readonly id: string;
  readonly fileUrl: string;
  readonly previewUrl?: string;
  readonly name: string;
  readonly fileSize: string | null;
  readonly persisted: boolean;
};

export type GalleryRemovalResult = {
  readonly removedIds: readonly string[];
  readonly failedIds: readonly string[];
  readonly firstFailure: string | null;
};
