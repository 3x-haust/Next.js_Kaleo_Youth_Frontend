'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/primitives';
import { clientPatch, errorMessage, type UploadedFile } from '@/lib/client-api';
import { aboutSchema, fieldErrors, type AboutInput } from '@/lib/schemas';
import type { AboutPage } from '@/lib/types';
import { existingImage } from './image-upload';
import { Actions, ErrorText, Field, FieldRow, Form, Input, Label, Panel, PanelTitle, Textarea } from './parts';
import { FileUploader, FormError, SavedNotice } from './widgets';

const CLOSING_LINE_IDS = ['first', 'second'] as const;

export function AboutEditor({ about }: { readonly about: AboutPage }) {
  const [content, setContent] = useState<AboutInput>({
    introEyebrow: about.introEyebrow,
    introTitle: about.introTitle,
    introBody: about.introBody,
    values: about.values.map((value) => ({ ...value })),
    leaderEyebrow: about.leaderEyebrow,
    leaderName: about.leaderName,
    leaderRole: about.leaderRole,
    leaderBody: about.leaderBody,
    teamEyebrow: about.teamEyebrow,
    closingPhotoLabel: about.closingPhotoLabel,
    closingLines: [...about.closingLines],
    closingLabel: about.closingLabel,
    metaTitle: about.metaTitle,
    metaDescription: about.metaDescription,
  });
  const [leaderPhoto, setLeaderPhoto] = useState<UploadedFile[]>(
    about.leaderPhotoUrl ? [existingImage(about.leaderPhotoUrl, 'about-leader', '현재 담당자 사진')] : [],
  );
  const [closingPhoto, setClosingPhoto] = useState<UploadedFile[]>(
    about.closingPhotoUrl ? [existingImage(about.closingPhotoUrl, 'about-closing', '현재 마무리 이미지')] : [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  function update<K extends keyof AboutInput>(key: K, value: AboutInput[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    setSaved(false);
    const parsed = aboutSchema.safeParse(content);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    const newLeader = leaderPhoto.find((file) => !file.isPersisted);
    const newClosing = closingPhoto.find((file) => !file.isPersisted);
    const uploads = [newLeader, newClosing].filter((file): file is UploadedFile => file !== undefined);
    setErrors({});
    setPending(true);
    try {
      await clientPatch<AboutPage>('/about', {
        ...parsed.data,
        introEyebrow: about.introEyebrow,
        introTitle: about.introTitle,
        introBody: about.introBody,
        values: about.values.map((value) => ({ ...value })),
        metaTitle: about.metaTitle,
        metaDescription: about.metaDescription,
        leaderEyebrow: about.leaderEyebrow,
        teamEyebrow: about.teamEyebrow,
        closingLabel: about.closingLabel,
        leaderPhotoUrl: newLeader ? undefined : (leaderPhoto.at(-1)?.fileUrl ?? ''),
        closingPhotoUrl: newClosing ? undefined : (closingPhoto.at(-1)?.fileUrl ?? ''),
        attachmentIds: uploads.map((file) => file.id),
        leaderPhotoAttachmentId: newLeader?.id,
        closingPhotoAttachmentId: newClosing?.id,
      });
      setSaved(true);
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <Form onSubmit={submit} noValidate>
      <FormError message={failure} />
      <SavedNotice message={saved ? '저장했습니다.' : null} />
      <Panel>
        <PanelTitle>담당 목회자</PanelTitle>
        <FieldRow $cols={2}>
          <Field><Label htmlFor="leader-name">이름</Label><Input id="leader-name" value={content.leaderName} onChange={(event) => update('leaderName', event.target.value)} maxLength={50} /></Field>
          <Field><Label htmlFor="leader-role">역할</Label><Input id="leader-role" value={content.leaderRole} onChange={(event) => update('leaderRole', event.target.value)} maxLength={100} /></Field>
        </FieldRow>
        <Field><Label htmlFor="leader-body">인사말</Label><Textarea id="leader-body" $rows={7} value={content.leaderBody} onChange={(event) => update('leaderBody', event.target.value)} maxLength={3000} /></Field>
        <Field><Label>사진</Label><FileUploader ownerType="about_page" files={leaderPhoto} onChange={setLeaderPhoto} accept="image/*" label="사진 선택" multiple={false} /></Field>
      </Panel>

      <Panel>
        <PanelTitle>J-Teen</PanelTitle>
        <FieldRow $cols={2}>
          {CLOSING_LINE_IDS.map((lineId, index) => (
            <Field key={lineId}><Label htmlFor={`closing-line-${lineId}`}>마무리 문구 {index + 1}</Label><Input id={`closing-line-${lineId}`} value={content.closingLines[index] ?? ''} onChange={(event) => update('closingLines', content.closingLines.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} maxLength={200} /></Field>
          ))}
        </FieldRow>
        <Field><Label htmlFor="closing-photo-label">이미지 설명</Label><Input id="closing-photo-label" value={content.closingPhotoLabel} onChange={(event) => update('closingPhotoLabel', event.target.value)} maxLength={150} /></Field>
        <Field><Label>마무리 이미지</Label><FileUploader ownerType="about_page" files={closingPhoto} onChange={setClosingPhoto} accept="image/*" label="이미지 선택" multiple={false} /></Field>
      </Panel>

      {Object.keys(errors).length > 0 ? <ErrorText>입력한 내용을 확인해 주세요.</ErrorText> : null}
      <Actions><Button type="submit" disabled={pending}>{pending ? '저장 중…' : '소개 저장'}</Button></Actions>
    </Form>
  );
}
