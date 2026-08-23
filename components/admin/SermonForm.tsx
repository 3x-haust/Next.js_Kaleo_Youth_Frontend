'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/primitives';
import {
  clientDelete,
  clientPatch,
  clientPost,
  errorMessage,
  type UploadedFile,
} from '@/lib/client-api';
import { youtubeWatchUrl } from '@/lib/format';
import { fieldErrors, sermonSchema } from '@/lib/schemas';
import type { Sermon } from '@/lib/types';
import {
  Actions,
  ErrorText,
  Field,
  FieldRow,
  Form,
  Hint,
  Input,
  Label,
  Textarea,
} from './parts';
import { ExistingAttachments } from './ExistingAttachments';
import { DeleteButton, FileUploader, FormError } from './widgets';

const LIST_PATH = '/admin/sermons';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function SermonForm({ sermon }: { sermon?: Sermon }) {
  const router = useRouter();
  const isEdit = Boolean(sermon);

  const [title, setTitle] = useState(sermon?.title ?? '');
  const [preacherName, setPreacherName] = useState(sermon?.preacherName ?? '박정인 목사');
  const [bibleReference, setBibleReference] = useState(sermon?.bibleReference ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(
    sermon?.youtubeVideoId ? youtubeWatchUrl(sermon.youtubeVideoId) : '',
  );
  const [summary, setSummary] = useState(sermon?.summary ?? '');
  const [publishedAt, setPublishedAt] = useState(
    sermon?.publishedAt ? sermon.publishedAt.slice(0, 10) : today(),
  );
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);

    const parsed = sermonSchema.safeParse({
      title,
      preacherName,
      bibleReference,
      youtubeUrl,
      summary,
      publishedAt,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);

    const payload = {
      title: parsed.data.title,
      preacherName: parsed.data.preacherName,
      bibleReference: parsed.data.bibleReference,
      youtubeUrl: parsed.data.youtubeUrl,
      summary: parsed.data.summary,
      publishedAt: parsed.data.publishedAt,
      attachmentIds: uploaded.map((file) => file.id),
    };

    try {
      if (sermon) {
        await clientPatch(`/sermons/${sermon.id}`, payload);
        setUploaded([]);
        router.refresh();
      } else {
        const created = await clientPost<Sermon>('/sermons', payload);
        router.push(`${LIST_PATH}/${created.id}`);
        router.refresh();
      }
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function removeExisting(id: string) {
    await clientDelete(`/uploads/${id}`);
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
          <Label htmlFor="preacherName">
            설교자<em>*</em>
          </Label>
          <Input
            id="preacherName"
            value={preacherName}
            onChange={(event) => setPreacherName(event.target.value)}
            maxLength={50}
            required
          />
          {errors.preacherName ? <ErrorText>{errors.preacherName}</ErrorText> : null}
        </Field>

        <Field>
          <Label htmlFor="publishedAt">
            설교 날짜<em>*</em>
          </Label>
          <Input
            id="publishedAt"
            type="date"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            required
          />
          {errors.publishedAt ? <ErrorText>{errors.publishedAt}</ErrorText> : null}
        </Field>
      </FieldRow>

      <Field>
        <Label htmlFor="bibleReference">본문 말씀</Label>
        <Input
          id="bibleReference"
          value={bibleReference}
          onChange={(event) => setBibleReference(event.target.value)}
          maxLength={120}
          placeholder="예: 요한복음 15:1-8"
        />
        {errors.bibleReference ? <ErrorText>{errors.bibleReference}</ErrorText> : null}
      </Field>

      <Field>
        <Label htmlFor="youtubeUrl">유튜브 주소</Label>
        <Input
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(event) => setYoutubeUrl(event.target.value)}
          maxLength={300}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <Hint>
          주소를 붙여넣으면 영상 ID만 저장합니다. 비워 두면 영상 없이 글만 올라갑니다.
        </Hint>
        {errors.youtubeUrl ? <ErrorText>{errors.youtubeUrl}</ErrorText> : null}
      </Field>

      <Field>
        <Label htmlFor="summary">말씀 요약</Label>
        <Textarea
          id="summary"
          $rows={10}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          maxLength={5000}
        />
        {errors.summary ? <ErrorText>{errors.summary}</ErrorText> : null}
      </Field>

      {sermon?.attachments && sermon.attachments.length > 0 ? (
        <Field>
          <Label>이미 올린 이미지</Label>
          <ExistingAttachments
            attachments={sermon.attachments}
            onRemove={removeExisting}
          />
        </Field>
      ) : null}

      <Field>
        <Label>말씀 이미지</Label>
        <FileUploader
          ownerType="sermon"
          files={uploaded}
          onChange={setUploaded}
          accept="image/*"
          label="이미지 추가"
          hint="첫 이미지는 목록 썸네일, 두 번째는 상세·홈 포스터로 사용합니다."
        />
      </Field>

      <Actions>
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : isEdit ? '저장' : '말씀 등록'}
        </Button>
        <Button type="button" $variant="ghost" onClick={() => router.push(LIST_PATH)}>
          취소
        </Button>
        {sermon ? (
          <DeleteButton
            path={`/sermons/${sermon.id}`}
            confirmMessage="이 말씀 기록을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?"
            redirectTo={LIST_PATH}
          />
        ) : null}
      </Actions>
    </Form>
  );
}
