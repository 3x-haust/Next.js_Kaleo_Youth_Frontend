'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/primitives';
import { clientDelete, clientPatch, clientPost, errorMessage } from '@/lib/client-api';
import type { UploadedFile } from '@/lib/client-upload';
import { fieldErrors, postSchema } from '@/lib/schemas';
import type { Post } from '@/lib/types';
import { clearAdminFlash, showAdminFlash } from '@/store/admin-flash';
import { Actions, ErrorText, Field, FieldRow, Form, Input, Label, Textarea } from './parts';
import { DeleteButton, FormError } from './widgets';
import { GalleryPhotoManager } from './GalleryPhotoManager';

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const listPath = '/admin/gallery';
  const persistedImages = (post?.attachments ?? []).filter((attachment) =>
    attachment.fileType?.startsWith('image/'),
  );

  const [title, setTitle] = useState(post?.title ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [startDate, setStartDate] = useState(
    () => post?.startDate?.slice(0, 10) ?? '',
  );
  const [endDate, setEndDate] = useState(
    () => post?.endDate?.slice(0, 10) ?? '',
  );
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(() => {
    const persistedThumbnail = persistedImages.find(
      (attachment) => attachment.fileUrl === post?.thumbnailUrl,
    );
    return persistedThumbnail?.fileUrl ?? persistedImages[0]?.fileUrl ?? null;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function changeUploaded(files: UploadedFile[]) {
    setUploaded(files);

    const availableUrls = [...persistedImages.map((image) => image.fileUrl), ...files.map((file) => file.fileUrl)];
    setThumbnailUrl((current) =>
      current && availableUrls.includes(current) ? current : availableUrls[0] ?? null,
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    clearAdminFlash();

    const parsed = postSchema.safeParse({
      boardType: 'gallery',
      title,
      content,
      startDate,
      endDate,
      isPinned: false,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    if (!isEdit && uploaded.length === 0) {
      setErrors({ files: '갤러리 글에는 사진을 한 장 이상 올려 주세요.' });
      return;
    }

    setErrors({});
    setPending(true);

    const payload = {
      boardType: 'gallery' as const,
      title: parsed.data.title,
      content: parsed.data.content || undefined,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate || null,
      isPinned: false,
      attachmentIds: uploaded.length > 0 ? uploaded.map((file) => file.id) : undefined,
      thumbnailUrl: thumbnailUrl ?? undefined,
    };

    try {
      if (post) {
        await clientPatch(`/posts/${post.id}`, payload);
        setUploaded([]);
        showAdminFlash('변경사항을 저장했습니다.');
        router.refresh();
      } else {
        await clientPost<Post>('/posts', payload);
        showAdminFlash('갤러리를 등록했습니다.', true);
        router.push(listPath);
      }
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function removeExisting(id: string) {
    const removed = post?.attachments?.find((attachment) => attachment.id === id);
    await clientDelete(`/uploads/${id}`);

    if (post && removed) {
      const remainingUrls = [
        ...persistedImages.filter((attachment) => attachment.id !== id).map((attachment) => attachment.fileUrl),
        ...uploaded.map((file) => file.fileUrl),
      ];
      const nextThumbnail = thumbnailUrl === removed.fileUrl
        ? remainingUrls[0] ?? null
        : thumbnailUrl;
      setThumbnailUrl(nextThumbnail);
      if (removed.fileUrl === post.thumbnailUrl || thumbnailUrl === removed.fileUrl) {
        await clientPatch(`/posts/${post.id}`, { thumbnailUrl: nextThumbnail });
      }
    }
    router.refresh();
  }

  return (
    <Form onSubmit={submit} noValidate>
      <FormError message={failure} />

      <Field>
        <Label htmlFor="title">
          제목<em>*</em>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
        />
        {errors.title ? <ErrorText>{errors.title}</ErrorText> : null}
      </Field>

      <FieldRow $cols={2}>
        <Field>
          <Label htmlFor="startDate">
            시작일<em>*</em>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
          {errors.startDate ? <ErrorText>{errors.startDate}</ErrorText> : null}
        </Field>

        <Field>
          <Label htmlFor="endDate">종료일</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          {errors.endDate ? <ErrorText>{errors.endDate}</ErrorText> : null}
        </Field>
      </FieldRow>

      <Field>
        <Label htmlFor="content">
          내용 <span>(사진 설명 — 선택)</span>
        </Label>
        <Textarea
          id="content"
          $rows={5}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={50000}
        />
        {errors.content ? <ErrorText>{errors.content}</ErrorText> : null}
      </Field>

      <Field>
        <Label>사진 올리기 · 대표 이미지</Label>
        <GalleryPhotoManager
          persisted={persistedImages}
          uploaded={uploaded}
          thumbnailUrl={thumbnailUrl}
          onUploadedChange={changeUploaded}
          onThumbnailChange={setThumbnailUrl}
          onRemovePersisted={removeExisting}
        />
        {errors.files ? <ErrorText>{errors.files}</ErrorText> : null}
      </Field>
      <Actions>
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : isEdit ? '저장' : '갤러리 등록'}
        </Button>
        <Button type="button" $variant="ghost" onClick={() => router.push(listPath)}>
          취소
        </Button>
        {post ? (
          <DeleteButton
            path={`/posts/${post.id}`}
            confirmMessage="이 글과 첨부파일을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?"
            redirectTo={listPath}
            successMessage="갤러리를 삭제했습니다."
          />
        ) : null}
      </Actions>
    </Form>
  );
}
