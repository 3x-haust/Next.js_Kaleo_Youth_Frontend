'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/primitives';
import { clientPatch, errorMessage } from '@/lib/client-api';
import { fieldErrors, teamSchema } from '@/lib/schemas';
import type { WorshipTeam } from '@/lib/types';
import { clearAdminFlash, showAdminFlash } from '@/store/admin-flash';
import { Actions, ErrorText, Field, Form, Label, Textarea, Input } from './parts';
import { FormError } from './widgets';

export function TeamInfoForm({ team }: { readonly team: WorshipTeam }) {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    clearAdminFlash();
    const parsed = teamSchema.safeParse({
      name,
      description,
      scheduleInfo: team.scheduleInfo ?? '',
      coverImageUrl: team.coverImageUrl ?? '',
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await clientPatch(`/worship-teams/${team.id}`, {
        ...parsed.data,
        scheduleInfo: team.scheduleInfo,
        coverImageUrl: team.coverImageUrl,
      });
      showAdminFlash('팀 소개를 저장했습니다.');
      router.refresh();
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
        <Label htmlFor="team-name">팀 이름<em>*</em></Label>
        <Input id="team-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required />
        {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}
      </Field>
      <Field>
        <Label htmlFor="team-description">팀 소개</Label>
        <Textarea id="team-description" $rows={8} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={10000} />
        {errors.description ? <ErrorText>{errors.description}</ErrorText> : null}
      </Field>
      <Actions>
        <Button type="submit" disabled={pending}>{pending ? '저장 중…' : '팀 소개 저장'}</Button>
      </Actions>
    </Form>
  );
}
