'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/primitives';
import { clientPatch, errorMessage } from '@/lib/client-api';
import { changePasswordSchema, fieldErrors, PASSWORD_MESSAGE } from '@/lib/schemas';
import { Actions, ErrorText, Field, Form, Hint, Input, Label } from './parts';
import { FormError, SavedNotice } from './widgets';

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    setSaved(false);

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);
    try {

      await clientPatch('/admin/accounts/me/password', {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
      <SavedNotice message={saved ? '비밀번호를 변경했습니다.' : null} />

      <Field>
        <Label htmlFor="currentPassword">
          현재 비밀번호<em>*</em>
        </Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        {errors.currentPassword ? <ErrorText>{errors.currentPassword}</ErrorText> : null}
      </Field>

      <Field>
        <Label htmlFor="newPassword">
          새 비밀번호<em>*</em>
        </Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <Hint>{PASSWORD_MESSAGE}</Hint>
        {errors.newPassword ? <ErrorText>{errors.newPassword}</ErrorText> : null}
      </Field>

      <Field>
        <Label htmlFor="confirmPassword">
          새 비밀번호 확인<em>*</em>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        {errors.confirmPassword ? <ErrorText>{errors.confirmPassword}</ErrorText> : null}
      </Field>

      <Actions>
        <Button type="submit" disabled={pending}>
          {pending ? '변경 중…' : '비밀번호 변경'}
        </Button>
      </Actions>
    </Form>
  );
}
