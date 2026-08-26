'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/primitives';
import { clientPatch, clientPost, errorMessage } from '@/lib/client-api';
import { fieldErrors, eventSchema } from '@/lib/schemas';
import type { ChurchEvent } from '@/lib/types';
import { clearAdminFlash, showAdminFlash } from '@/store/admin-flash';
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
import { DeleteButton, FormError } from './widgets';

const LIST_PATH = '/admin/events';

export function EventForm({ event }: { event?: ChurchEvent }) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [startDate, setStartDate] = useState(() => event?.startDate?.slice(0, 10) ?? '');
  const [endDate, setEndDate] = useState(() => event?.endDate?.slice(0, 10) ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [itemsToBring, setItemsToBring] = useState(event?.itemsToBring ?? '');
  const [feeInfo, setFeeInfo] = useState(event?.feeInfo ?? '');
  const [contactInfo, setContactInfo] = useState(
    event?.contactInfo ?? '신청은 현장 또는 담당 교사에게 문의해 주세요.',
  );
  const now = new Date();
  const minimumDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setFailure(null);
    clearAdminFlash();

    const parsed = eventSchema.safeParse({
      title,
      description,
      startDate,
      endDate,
      location,
      itemsToBring,
      feeInfo,
      contactInfo,
      coverImageUrl: event?.coverImageUrl ?? '',
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    if (parsed.data.startDate < minimumDate) {
      setErrors({ startDate: '시작일은 오늘보다 앞설 수 없습니다.' });
      return;
    }

    setErrors({});
    setPending(true);

    const payload = {
      title: parsed.data.title,
      description: parsed.data.description,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate || null,
      location: parsed.data.location,
      itemsToBring: parsed.data.itemsToBring,
      feeInfo: parsed.data.feeInfo,
      contactInfo: parsed.data.contactInfo,
    };

    try {
      if (event) {
        await clientPatch(`/events/${event.id}`, payload);
        showAdminFlash('변경사항을 저장했습니다.');
        router.refresh();
      } else {
        await clientPost<ChurchEvent>('/events', payload);
        showAdminFlash('일정을 등록했습니다.', true);
        router.push(LIST_PATH);
      }
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <Form onSubmit={submit} noValidate>
      <FormError message={failure} />

      <Field>
        <Label htmlFor="title">
          일정명<em>*</em>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            onChange={(e) => setStartDate(e.target.value)}
            min={minimumDate}
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
            onChange={(e) => setEndDate(e.target.value)}
            min={minimumDate}
          />
          <Hint>하루짜리 일정이면 비워 두세요.</Hint>
          {errors.endDate ? <ErrorText>{errors.endDate}</ErrorText> : null}
        </Field>
      </FieldRow>

      <Field>
        <Label htmlFor="location">장소</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={200}
          placeholder="예: 본관 1층 소예배실"
        />
        {errors.location ? <ErrorText>{errors.location}</ErrorText> : null}
      </Field>

      <Field>
        <Label htmlFor="description">일정 안내</Label>
        <Textarea
          id="description"
          $rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={10000}
        />
        {errors.description ? <ErrorText>{errors.description}</ErrorText> : null}
      </Field>

      <Field>
        <Label htmlFor="itemsToBring">준비물</Label>
        <Textarea
          id="itemsToBring"
          $rows={4}
          value={itemsToBring}
          onChange={(e) => setItemsToBring(e.target.value)}
          maxLength={2000}
          placeholder="예: 성경, 필기구, 세면도구, 편한 옷"
        />
        {errors.itemsToBring ? <ErrorText>{errors.itemsToBring}</ErrorText> : null}
      </Field>

      <FieldRow $cols={2}>
        <Field>
          <Label htmlFor="feeInfo">참가비 안내</Label>
          <Input
            id="feeInfo"
            value={feeInfo}
            onChange={(e) => setFeeInfo(e.target.value)}
            maxLength={200}
            placeholder="예: 3만원 (현장 납부)"
          />
          {errors.feeInfo ? <ErrorText>{errors.feeInfo}</ErrorText> : null}
        </Field>

        <Field>
          <Label htmlFor="contactInfo">문의 안내</Label>
          <Input
            id="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            maxLength={200}
          />
          {errors.contactInfo ? <ErrorText>{errors.contactInfo}</ErrorText> : null}
        </Field>
      </FieldRow>

      <Actions>
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : isEdit ? '저장' : '일정 등록'}
        </Button>
        <Button type="button" $variant="ghost" onClick={() => router.push(LIST_PATH)}>
          취소
        </Button>
        {event ? (
          <DeleteButton
            path={`/events/${event.id}`}
            confirmMessage="이 일정을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?"
            redirectTo={LIST_PATH}
            successMessage="일정을 삭제했습니다."
          />
        ) : null}
      </Actions>
    </Form>
  );
}
