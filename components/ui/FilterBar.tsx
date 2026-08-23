'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button } from './primitives';

export type FilterField =
  | { type: 'text'; name: string; label: string; placeholder?: string }
  | { type: 'date'; name: string; label: string }
  | {
      type: 'select';
      name: string;
      label: string;
      options: { value: string; label: string }[];
    };

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 28px;
`;

const Field = styled.label<{ $grow?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: ${({ $grow }) => ($grow ? '1 1 220px' : '0 0 auto')};
  min-width: 0;

  span {
    font-size: 12.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.muted};
  }

  input,
  select {
    height: 42px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.sm};
    font-size: 14.5px;
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.white};
    font-family: inherit;
    min-width: 140px;
    width: 100%;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primarySoft};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTint};
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

interface Props {
  basePath: string;
  fields: FilterField[];
  values: Record<string, string | undefined>;
}

export function FilterBar({ basePath, fields, values }: Props) {
  const valueKey = fields.map((field) => `${field.name}:${values[field.name] ?? ''}`).join('|');
  return <FilterBarState key={valueKey} basePath={basePath} fields={fields} values={values} />;
}

function FilterBarState({ basePath, fields, values }: Props) {
  const router = useRouter();
  const [state, setState] = useState<Record<string, string>>(() => normalize(fields, values));

  const hasValue = Object.values(state).some((value) => value !== '');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) {
      if (value.trim()) search.set(key, value.trim());
    }
    const query = search.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <Form onSubmit={submit} role="search">
      {fields.map((field) => (
        <Field key={field.name} $grow={field.type === 'text'}>
          <span>{field.label}</span>
          {field.type === 'select' ? (
            <select
              name={field.name}
              value={state[field.name] ?? ''}
              onChange={(event) =>
                setState((previous) => ({ ...previous, [field.name]: event.target.value }))
              }
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === 'date' ? 'date' : 'search'}
              name={field.name}
              placeholder={field.type === 'text' ? field.placeholder : undefined}
              value={state[field.name] ?? ''}
              onChange={(event) =>
                setState((previous) => ({ ...previous, [field.name]: event.target.value }))
              }
            />
          )}
        </Field>
      ))}

      <Actions>
        {hasValue ? (
          <Button
            type="button"
            $variant="ghost"
            onClick={() => {
              setState(normalize(fields, {}));
              router.push(basePath);
            }}
          >
            초기화
          </Button>
        ) : null}
        <Button type="submit">검색</Button>
      </Actions>
    </Form>
  );
}

function normalize(fields: FilterField[], values: Record<string, string | undefined>) {
  const next: Record<string, string> = {};
  for (const field of fields) next[field.name] = values[field.name] ?? '';
  return next;
}
