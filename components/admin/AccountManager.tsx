'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button } from '@/components/ui/primitives';
import { clientPatch, clientPost, errorMessage } from '@/lib/client-api';
import {
  createAdminSchema,
  fieldErrors,
  PASSWORD_MESSAGE,
  resetPasswordSchema,
} from '@/lib/schemas';
import type { AdminAccount } from '@/lib/types';
import { clearAdminFlash, showAdminFlash } from '@/store/admin-flash';
import {
  Actions,
  CheckboxLabel,
  ErrorText,
  Field,
  FieldRow,
  Form,
  Hint,
  Input,
  Panel,
  PanelTitle,
  Label,
  Table,
  TableWrap,
} from './parts';
import { FormError } from './widgets';

export function AccountManager({
  accounts,
  currentAdminId,
}: {
  accounts: AdminAccount[];
  currentAdminId: string;
}) {
  return (
    <>
      <Panel>
        <PanelTitle>관리자 목록</PanelTitle>
        <AccountTable accounts={accounts} currentAdminId={currentAdminId} />
      </Panel>
      <Panel>
        <PanelTitle>관리자 추가</PanelTitle>
        <CreateAccountForm />
      </Panel>
    </>
  );
}

function AccountTable({
  accounts,
  currentAdminId,
}: {
  accounts: AdminAccount[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleActive(account: AdminAccount) {
    const next = !account.isActive;
    const message = next
      ? `${account.loginId} 계정을 다시 사용하도록 되돌립니다. 계속할까요?`
      : `${account.loginId} 계정을 사용 중지합니다. 로그인할 수 없게 됩니다. 계속할까요?`;
    if (!window.confirm(message)) return;

    setFailure(null);
    clearAdminFlash();
    setBusy(account.id);
    try {
      await clientPatch(`/admin/accounts/${account.id}`, { isActive: next });
      showAdminFlash(
        next
          ? `${account.loginId} 계정 사용을 재개했습니다.`
          : `${account.loginId} 계정 사용을 중지했습니다.`,
      );
      router.refresh();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function resetPassword(account: AdminAccount) {
    const input = window.prompt(
      `${account.loginId} 계정의 새 비밀번호를 입력하세요.\n${PASSWORD_MESSAGE}`,
    );
    if (input === null) return;

    const parsed = resetPasswordSchema.safeParse({ newPassword: input });
    if (!parsed.success) {
      setFailure(fieldErrors(parsed.error).newPassword ?? PASSWORD_MESSAGE);
      return;
    }

    setFailure(null);
    clearAdminFlash();
    setBusy(account.id);
    try {
      await clientPatch(`/admin/accounts/${account.id}/password`, parsed.data);

      showAdminFlash(
        `${account.loginId} 계정의 비밀번호를 변경했습니다. 본인에게 직접 전달해 주세요.`,
      );
      router.refresh();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <FormError message={failure} />

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>아이디</th>
              <th>이름</th>
              <th>직분</th>
              <th>권한</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.loginId}</td>
                <td>{account.name}</td>
                <td>{account.positionLabel ?? '—'}</td>
                <td>
                  {account.isSuperAdmin ? (
                    <Badge $tone="accent">최고관리자</Badge>
                  ) : (
                    <Badge $tone="muted">관리자</Badge>
                  )}
                </td>
                <td>
                  {account.isActive ? (
                    <Badge $tone="muted">사용 중</Badge>
                  ) : (
                    <Badge $tone="danger">중지됨</Badge>
                  )}
                </td>
                <td>
                  <Actions>
                    <Button
                      type="button"
                      $variant="outline"
                      $small
                      onClick={() => resetPassword(account)}
                      disabled={busy === account.id}
                    >
                      비밀번호 재발급
                    </Button>
                    {account.id === currentAdminId ? (
                      <Hint>본인 계정</Hint>
                    ) : (
                      <Button
                        type="button"
                        $variant="ghost"
                        $small
                        onClick={() => toggleActive(account)}
                        disabled={busy === account.id}
                      >
                        {account.isActive ? '사용 중지' : '사용 재개'}
                      </Button>
                    )}
                  </Actions>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}

function CreateAccountForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [positionLabel, setPositionLabel] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    clearAdminFlash();

    const parsed = createAdminSchema.safeParse({
      loginId,
      password,
      name,
      positionLabel,
      isSuperAdmin,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await clientPost('/admin/accounts', parsed.data);
      setLoginId('');
      setPassword('');
      setName('');
      setPositionLabel('');
      setIsSuperAdmin(false);
      showAdminFlash('관리자 계정을 만들었습니다.');
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

      <FieldRow $cols={2}>
        <Field>
          <Label htmlFor="new-loginId">
            아이디<em>*</em>
          </Label>
          <Input
            id="new-loginId"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            maxLength={50}
            autoComplete="off"
          />
          {errors.loginId ? <ErrorText>{errors.loginId}</ErrorText> : null}
        </Field>
        <Field>
          <Label htmlFor="new-name">
            이름<em>*</em>
          </Label>
          <Input
            id="new-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
          />
          {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}
        </Field>
      </FieldRow>

      <FieldRow $cols={2}>
        <Field>
          <Label htmlFor="new-password">
            초기 비밀번호<em>*</em>
          </Label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
          <Hint>{PASSWORD_MESSAGE} 전달 후 본인이 직접 바꾸도록 안내해 주세요.</Hint>
          {errors.password ? <ErrorText>{errors.password}</ErrorText> : null}
        </Field>
        <Field>
          <Label htmlFor="new-position">직분</Label>
          <Input
            id="new-position"
            value={positionLabel}
            onChange={(event) => setPositionLabel(event.target.value)}
            maxLength={50}
            placeholder="예: 담당 교역자 / 부장 / 교사"
          />
          {errors.positionLabel ? <ErrorText>{errors.positionLabel}</ErrorText> : null}
        </Field>
      </FieldRow>

      <Field>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={isSuperAdmin}
            onChange={(event) => setIsSuperAdmin(event.target.checked)}
          />
          <span>
            최고관리자 권한을 줍니다. 다른 관리자 계정을 만들고 관리할 수 있으니 꼭 필요한 경우에만
            체크해 주세요.
          </span>
        </CheckboxLabel>
      </Field>

      <Actions>
        <Button type="submit" disabled={pending}>
          {pending ? '만드는 중…' : '관리자 추가'}
        </Button>
      </Actions>
    </Form>
  );
}
