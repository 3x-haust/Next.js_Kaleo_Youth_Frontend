'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Reveal } from '@/components/motion/Motion';
import { toFileUrl, youtubeEmbedUrl, youtubeThumbnail, youtubeWatchUrl } from '@/lib/format';
import type { SetlistSong } from '@/lib/types';
import {
  Artist,
  Facade,
  Info,
  Links,
  List,
  Media,
  NoVideo,
  Note,
  PlayIcon,
  SongTitle,
  TileInfoInteraction,
  Unavailable,
  VideoWrap,
} from './SongList.styled';

function SongThumbnail({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1919px) 45vw, 544px"
    />
  );
}

export function SongList({ songs }: { songs: SetlistSong[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const variant = songs.length === 3 ? 'three' : songs.length === 4 ? 'four' : undefined;

  return (
    <Reveal threshold={0.08}>
      <List
        $variant={variant}
        aria-label={`${songs.length}곡 찬양 목록`}
        data-zone="setlist-images"
      >
        {songs.map((song, index) => (
          <TileInfoInteraction key={song.id}>
          <Media $variant={variant}>
            {song.youtubeVideoId && !song.isUnavailable ? (
              playing === song.id ? (
                <VideoWrap>
                  <iframe
                    src={`${youtubeEmbedUrl(song.youtubeVideoId)}&autoplay=1`}
                    title={song.songTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                  />
                </VideoWrap>
              ) : (
                <Facade
                  type="button"
                  onClick={() => setPlaying(song.id)}
                  aria-label={`${index + 1}번 ${song.songTitle} 영상 재생`}
                >
                  <SongThumbnail
                    src={song.thumbnailUrl ?? youtubeThumbnail(song.youtubeVideoId)}
                  />
                  <PlayIcon aria-hidden="true" />
                </Facade>
              )
            ) : (
              <NoVideo>
                <span>{song.isUnavailable ? '영상을 재생할 수 없습니다' : '연결된 영상이 없습니다'}</span>
              </NoVideo>
            )}
          </Media>

          <Info>
            <SongTitle>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {song.songTitle}
            </SongTitle>
            {song.artist ? <Artist>{song.artist}</Artist> : null}
            {song.isUnavailable ? <Unavailable>비공개 또는 삭제된 영상</Unavailable> : null}
            {song.note ? <Note>{song.note}</Note> : null}
            {(song.sheetFileUrl || song.youtubeVideoId) && (
              <Links>
                {song.sheetFileUrl ? (
                  <a href={toFileUrl(song.sheetFileUrl)} target="_blank" rel="noopener noreferrer">
                    악보 보기
                  </a>
                ) : null}
                {song.youtubeVideoId ? (
                  <a href={youtubeWatchUrl(song.youtubeVideoId)} target="_blank" rel="noopener noreferrer">
                    유튜브에서 보기
                  </a>
                ) : null}
              </Links>
            )}
          </Info>
          </TileInfoInteraction>
        ))}
      </List>
    </Reveal>
  );
}
