'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Field, Form, Input, Label } from '@/components/admin/parts';
import { FormError } from '@/components/admin/widgets';
import { Button } from '@/components/ui/primitives';
import { clientAuthPost, errorMessage } from '@/lib/client-api';
import { fieldErrors, loginSchema } from '@/lib/schemas';
import type { AdminProfile } from '@/lib/types';
import { useAdminSession } from '@/store/admin-session';

function safeNext(value: string | undefined): string {
  if (!value) return '/admin';
  return /^\/admin(\/|$)/.test(value) && !value.startsWith('/admin/login') ? value : '/admin';
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const setProfile = useAdminSession((state) => state.setProfile);

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);

    const parsed = loginSchema.safeParse({ loginId, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);

    try {
      const profile = await clientAuthPost<AdminProfile>('/auth/login', parsed.data);
      setProfile(profile);
      router.replace(safeNext(next));
      router.refresh();
    } catch (caught) {

      setFailure(errorMessage(caught));
      setPassword('');
    } finally {
      setPending(false);
    }
  }

  return (
    <Form onSubmit={submit} noValidate>
      <FormError message={failure} />

      <Field>
        <Label htmlFor="loginId">아이디</Label>
        <Input
          id="loginId"
          name="loginId"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          aria-invalid={Boolean(errors.loginId)}
          required
        />
        {errors.loginId ? <Small role="alert">{errors.loginId}</Small> : null}
      </Field>

      <Field>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(errors.password)}
          required
        />
        {errors.password ? <Small role="alert">{errors.password}</Small> : null}
      </Field>

      <Button type="submit" $block disabled={pending}>
        {pending ? '확인 중…' : '로그인'}
      </Button>
    </Form>
  );
}

const Small = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;
