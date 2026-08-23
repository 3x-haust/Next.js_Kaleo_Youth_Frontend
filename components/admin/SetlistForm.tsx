'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Button, Notice } from '@/components/ui/primitives';
import {
  clientPatch,
  clientPost,
  errorMessage,
  uploadFiles,
} from '@/lib/client-api';
import { youtubeWatchUrl } from '@/lib/format';
import { fieldErrors, playlistUrlSchema, setlistSchema } from '@/lib/schemas';
import type { PlaylistImportResult, Setlist, SetlistAttachment } from '@/lib/types';
import {
  Actions,
  ErrorText,
  Field,
  FieldRow,
  Form,
  Hint,
  Input,
  Label,
  PanelTitle,
} from './parts';
import { SetlistAttachmentsField } from './SetlistAttachmentsField';
import { DeleteButton, FormError } from './widgets';

const LIST_PATH = '/admin/setlists';

interface SongRow {
  key: string;
  songTitle: string;
  artist: string;
  youtubeUrl: string;
  youtubeVideoTitle: string;
  thumbnailUrl: string;
  note: string;
  sheetFileUrl: string;
  isUnavailable: boolean;
}

let rowSeq = 0;
function newRow(partial: Partial<SongRow> = {}): SongRow {
  rowSeq += 1;
  return {
    key: `row-${rowSeq}`,
    songTitle: '',
    artist: '',
    youtubeUrl: '',
    youtubeVideoTitle: '',
    thumbnailUrl: '',
    note: '',
    sheetFileUrl: '',
    isUnavailable: false,
    ...partial,
  };
}

function rowsFromSetlist(setlist?: Setlist): SongRow[] {
  if (!setlist || setlist.songs.length === 0) return [newRow()];
  return [...setlist.songs]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((song) =>
      newRow({
        songTitle: song.songTitle,
        artist: song.artist ?? '',
        youtubeUrl: song.youtubeVideoId ? youtubeWatchUrl(song.youtubeVideoId) : '',
        youtubeVideoTitle: song.youtubeVideoTitle ?? '',
        thumbnailUrl: song.thumbnailUrl ?? '',
        note: song.note ?? '',
        sheetFileUrl: song.sheetFileUrl ?? '',
        isUnavailable: song.isUnavailable,
      }),
    );
}

export function SetlistForm({
  setlist,
  teamId,
  playlistImportEnabled,
}: {
  setlist?: Setlist;
  teamId?: string | null;
  playlistImportEnabled: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(setlist);

  const [serviceDate, setServiceDate] = useState(setlist?.serviceDate?.slice(0, 10) ?? '');
  const [title, setTitle] = useState(setlist?.title ?? '');
  const [fileUrl, setFileUrl] = useState(setlist?.fileUrl ?? '');
  const [attachments, setAttachments] = useState<SetlistAttachment[]>(
    () => [...(setlist?.attachments ?? [])],
  );
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState(setlist?.youtubePlaylistTitle ?? '');
  const [savedPlaylistUrl, setSavedPlaylistUrl] = useState(
    setlist?.youtubePlaylistId
      ? `https://www.youtube.com/playlist?list=${setlist.youtubePlaylistId}`
      : '',
  );
  const [rows, setRows] = useState<SongRow[]>(() => rowsFromSetlist(setlist));

  const [importing, setImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resyncing, setResyncing] = useState(false);

  function patchRow(index: number, patch: Partial<SongRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function moveRow(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    setRows((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeRow(index: number) {
    setRows((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  }

  async function importPlaylist() {
    setImportError(null);
    setImportNotice(null);

    const parsed = playlistUrlSchema.safeParse({ playlistUrl });
    if (!parsed.success) {
      setImportError(fieldErrors(parsed.error).playlistUrl ?? '주소를 확인해 주세요.');
      return;
    }

    setImporting(true);
    try {

      const result = await clientPost<PlaylistImportResult>('/setlists/preview-playlist', {
        playlistUrl: parsed.data.playlistUrl,
      });

      setRows(
        result.songs.length === 0
          ? [newRow()]
          : result.songs.map((song) =>
              newRow({
                songTitle: song.songTitle,
                artist: song.artist ?? '',
                youtubeUrl: song.youtubeVideoId ? youtubeWatchUrl(song.youtubeVideoId) : '',
                youtubeVideoTitle: song.youtubeVideoTitle ?? '',
                thumbnailUrl: song.thumbnailUrl ?? '',
                isUnavailable: song.isUnavailable,
              }),
            ),
      );
      if (result.playlistTitle) {
        setPlaylistTitle(result.playlistTitle);
        if (!title) setTitle(result.playlistTitle);
      }
      setSavedPlaylistUrl(parsed.data.playlistUrl);
      setImportNotice(
        `${result.songs.length}곡을 불러왔습니다.` +
          (result.unavailableCount > 0
            ? ` 비공개·삭제된 영상 ${result.unavailableCount}곡은 제목만 남았으니 직접 확인해 주세요.`
            : ' 곡 제목과 순서를 확인한 뒤 저장해 주세요.'),
      );
    } catch (caught) {
      setImportError(errorMessage(caught));
    } finally {
      setImporting(false);
    }
  }

  async function resync() {
    if (!setlist) return;
    if (!window.confirm('플레이리스트를 다시 불러와 곡 목록을 덮어씁니다. 계속할까요?')) return;
    setResyncing(true);
    setFailure(null);
    try {
      await clientPost(`/setlists/${setlist.id}/resync`, {});
      router.refresh();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setResyncing(false);
    }
  }

  async function uploadSheet(index: number, file: File) {
    try {
      const [uploaded] = await uploadFiles([file], 'setlist');
      if (uploaded) patchRow(index, { sheetFileUrl: uploaded.fileUrl });
    } catch (caught) {
      setFailure(errorMessage(caught));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);

    const parsed = setlistSchema.safeParse({
      serviceDate,
      title,
      fileUrl,
      youtubePlaylistUrl: savedPlaylistUrl,
      youtubePlaylistTitle: playlistTitle,
      songs: rows.map((row) => ({
        songTitle: row.songTitle,
        artist: row.artist,
        youtubeUrl: row.youtubeUrl,
        youtubeVideoTitle: row.youtubeVideoTitle,
        thumbnailUrl: row.thumbnailUrl,
        note: row.note,
        sheetFileUrl: row.sheetFileUrl,
        isUnavailable: row.isUnavailable,
      })),
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);

    const payload = {
      teamId: teamId ?? undefined,
      serviceDate: parsed.data.serviceDate,
      title: parsed.data.title,
      fileUrl: parsed.data.fileUrl,
      youtubePlaylistUrl: parsed.data.youtubePlaylistUrl || null,
      youtubePlaylistTitle: parsed.data.youtubePlaylistTitle,
      songs: parsed.data.songs.map((song, index) => ({ ...song, displayOrder: index })),
      attachmentIds: attachments.map((attachment) => attachment.id),
    };

    try {
      if (setlist) {
        await clientPatch(`/setlists/${setlist.id}`, payload);
        router.refresh();
      } else {
        const created = await clientPost<Setlist>('/setlists', payload);
        router.push(`${LIST_PATH}/${created.id}`);
        router.refresh();
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

      <ImportBox>
        <PanelTitle>유튜브 플레이리스트에서 불러오기</PanelTitle>
        {playlistImportEnabled ? (
          <>
            <Hint>
              플레이리스트 주소를 붙여넣으면 곡 목록을 미리 채워 줍니다. 불러온 뒤에는 제목과 순서를
              직접 고칠 수 있고, 저장 전에는 아무것도 반영되지 않습니다.
            </Hint>
            <ImportRow>
              <Input
                value={playlistUrl}
                onChange={(event) => setPlaylistUrl(event.target.value)}
                maxLength={300}
                placeholder="https://www.youtube.com/playlist?list=..."
                aria-label="플레이리스트 주소"
              />
              <Button type="button" $variant="outline" onClick={importPlaylist} disabled={importing}>
                {importing ? '불러오는 중…' : '불러오기'}
              </Button>
            </ImportRow>
            {importError ? <ErrorText role="alert">{importError}</ErrorText> : null}
            {importNotice ? <Notice $tone="info">{importNotice}</Notice> : null}
          </>
        ) : (
          <Notice $tone="warn">
            유튜브 연동 키가 아직 설정되지 않아 자동 불러오기를 쓸 수 없습니다. 아래에서 곡을 직접
            입력해 주세요. 키를 설정하면 이 자리에 불러오기 칸이 나타납니다.
          </Notice>
        )}

        {setlist?.youtubePlaylistId ? (
          <ResyncRow>
            <span>
              연결된 플레이리스트: <code>{setlist.youtubePlaylistId}</code>
              {setlist.syncStatus === 'sync_failed' ? ' · 마지막 동기화 실패' : null}
            </span>
            {playlistImportEnabled ? (
              <Button type="button" $variant="outline" $small onClick={resync} disabled={resyncing}>
                {resyncing ? '동기화 중…' : '재동기화'}
              </Button>
            ) : null}
          </ResyncRow>
        ) : null}
      </ImportBox>

      <FieldRow $cols={2}>
        <Field>
          <Label htmlFor="serviceDate">
            예배 날짜<em>*</em>
          </Label>
          <Input
            id="serviceDate"
            type="date"
            value={serviceDate}
            onChange={(event) => setServiceDate(event.target.value)}
            required
          />
          {errors.serviceDate ? <ErrorText>{errors.serviceDate}</ErrorText> : null}
        </Field>

        <Field>
          <Label htmlFor="title">
            콘티 제목<em>*</em>
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
      </FieldRow>

      <SetlistAttachmentsField
        attachments={attachments}
        onChange={setAttachments}
        onDocumentUploaded={setFileUrl}
      />

      <Field>
        <Label htmlFor="setlist-file-url">콘티 파일 주소</Label>
        <Input
          id="setlist-file-url"
          value={fileUrl}
          onChange={(event) => setFileUrl(event.target.value)}
          maxLength={500}
          placeholder="파일 주소 (직접 입력하거나 비워 두세요)"
        />
        {errors.fileUrl ? <ErrorText>{errors.fileUrl}</ErrorText> : null}
      </Field>

      <Field>
        <Label>
          곡 목록<em>*</em>
        </Label>
        {errors.songs ? <ErrorText>{errors.songs}</ErrorText> : null}
        <SongList>
          {rows.map((row, index) => (
            <li key={row.key}>
              <SongHead>
                <strong>{index + 1}번째 곡</strong>
                {row.isUnavailable ? <Warn>비공개·삭제된 영상</Warn> : null}
                <SongTools>
                  <button type="button" onClick={() => moveRow(index, -1)} disabled={index === 0}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(index, 1)}
                    disabled={index === rows.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeRow(index)}
                    disabled={rows.length === 1}
                  >
                    삭제
                  </button>
                </SongTools>
              </SongHead>

              <FieldRow $cols={2}>
                <Field>
                  <Label htmlFor={`song-title-${row.key}`}>곡 제목</Label>
                  <Input
                    id={`song-title-${row.key}`}
                    value={row.songTitle}
                    onChange={(event) => patchRow(index, { songTitle: event.target.value })}
                    maxLength={300}
                  />
                  {errors[`songs.${index}.songTitle`] ? (
                    <ErrorText>{errors[`songs.${index}.songTitle`]}</ErrorText>
                  ) : null}
                </Field>
                <Field>
                  <Label htmlFor={`song-artist-${row.key}`}>아티스트</Label>
                  <Input
                    id={`song-artist-${row.key}`}
                    value={row.artist}
                    onChange={(event) => patchRow(index, { artist: event.target.value })}
                    maxLength={200}
                  />
                </Field>
              </FieldRow>

              <FieldRow $cols={2}>
                <Field>
                  <Label htmlFor={`song-url-${row.key}`}>유튜브 주소</Label>
                  <Input
                    id={`song-url-${row.key}`}
                    value={row.youtubeUrl}
                    onChange={(event) => patchRow(index, { youtubeUrl: event.target.value })}
                    maxLength={300}
                  />
                </Field>
                <Field>
                  <Label htmlFor={`song-note-${row.key}`}>메모 (키·BPM 등)</Label>
                  <Input
                    id={`song-note-${row.key}`}
                    value={row.note}
                    onChange={(event) => patchRow(index, { note: event.target.value })}
                    maxLength={300}
                    placeholder="예: Key G / 72 BPM"
                  />
                </Field>
              </FieldRow>

              <Field>
                <Label htmlFor={`song-sheet-${row.key}`}>곡 악보</Label>
                <SheetRow>
                  <input
                    id={`song-sheet-${row.key}`}
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadSheet(index, file);
                      event.target.value = '';
                    }}
                  />
                  {row.sheetFileUrl ? (
                    <>
                      <span title={row.sheetFileUrl}>등록됨</span>
                      <button type="button" onClick={() => patchRow(index, { sheetFileUrl: '' })}>
                        연결 해제
                      </button>
                    </>
                  ) : null}
                </SheetRow>
              </Field>

              {row.youtubeVideoTitle ? (
                <Hint>원본 영상 제목: {row.youtubeVideoTitle}</Hint>
              ) : null}
            </li>
          ))}
        </SongList>

        <Button type="button" $variant="outline" $small onClick={() => setRows([...rows, newRow()])}>
          곡 추가
        </Button>
      </Field>

      <Actions>
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : isEdit ? '저장' : '콘티 등록'}
        </Button>
        <Button type="button" $variant="ghost" onClick={() => router.push(LIST_PATH)}>
          취소
        </Button>
        {setlist ? (
          <DeleteButton
            path={`/setlists/${setlist.id}`}
            confirmMessage="이 콘티를 삭제합니다. 되돌릴 수 없습니다. 계속할까요?"
            redirectTo={LIST_PATH}
          />
        ) : null}
      </Actions>
    </Form>
  );
}

const ImportBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px dashed ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.bgSoft};
`;

const ImportRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  input {
    flex: 1;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResyncRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
`;

const SongList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;

  li {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.lg};
  }
`;

const SongHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  strong {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const Warn = styled.span`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bgSoft};
  color: ${({ theme }) => theme.colors.danger};
`;

const SongTools = styled.div`
  margin-left: auto;
  display: flex;
  gap: 6px;

  button {
    min-width: 32px;
    height: 30px;
    padding: 0 8px;
    border: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.bg};
    font-size: 13px;

    &.danger {
      color: ${({ theme }) => theme.colors.danger};
    }

    &:disabled {
      opacity: 0.4;
    }
  }
`;

const SheetRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;

  button {
    background: none;
    border: 0;
    color: ${({ theme }) => theme.colors.danger};
    font-size: 13px;
  }
`;
