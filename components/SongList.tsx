'use client';

import { type KeyboardEvent, useMemo, useState } from 'react';
import { ArrowUpDown, RefreshCcw, Search } from 'lucide-react';

import FavoriteButton from '@/components/FavoriteButton';
import type { Song } from '@/types';

const normalizeText = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ç]/g, 'c')
    .replace(/[ğ]/g, 'g')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ş]/g, 's')
    .replace(/[ü]/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  onSongSelect: (song: Song) => void;
  onRefresh: () => void;
}

export default function SongList({ songs, currentSong, onSongSelect, onRefresh }: SongListProps) {
  const [query, setQuery] = useState('');
  const [ascending, setAscending] = useState(true);

  const filteredSongs = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const list = songs.filter((song) => {
      if (!normalizedQuery) return true;
      const normalizedTitle = normalizeText(song.title);
      const normalizedArtist = normalizeText(song.artist);
      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedArtist.includes(normalizedQuery)
      );
    });

    const direction = ascending ? 1 : -1;

    return list.sort((a, b) => {
      const titleA = normalizeText(a.title);
      const titleB = normalizeText(b.title);
      if (titleA !== titleB) {
        return titleA < titleB ? -direction : direction;
      }

      const artistA = normalizeText(a.artist);
      const artistB = normalizeText(b.artist);
      if (artistA === artistB) return 0;
      return artistA < artistB ? -direction : direction;
    });
  }, [songs, query, ascending]);

  const handleRefresh = () => {
    onRefresh();
  };

  const toggleSort = () => {
    setAscending((prev) => !prev);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={handleRefresh}
          className="song-toolbar-button"
          aria-label="Listeyi yenile"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Yenile</span>
        </button>
        <button
          type="button"
          onClick={toggleSort}
          className="song-toolbar-button"
          aria-label="Sıralamayı değiştir"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sırala</span>
        </button>
        <div className="relative ml-auto w-full min-[420px]:w-auto min-[420px]:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Şarkı ara"
            className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          />
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-0.5">
        {filteredSongs.map((song) => {
          const isActive = currentSong?.id === song.id;
          const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSongSelect(song);
            }
          };

          return (
            <div
              key={song.id}
              role="button"
              tabIndex={0}
              onClick={() => onSongSelect(song)}
              onKeyDown={handleKeyDown}
              className={`song-item w-full text-left ${isActive ? 'active' : ''}`.trim()}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{song.title}</p>
                  <p className="text-sm text-white/60">{song.artist}</p>
                </div>
                <FavoriteButton songId={song.id} />
              </div>
            </div>
          );
        })}
        {!filteredSongs.length && (
          <div className="py-12 text-center text-white/50">Sonuç bulunamadı</div>
        )}
      </div>
    </div>
  );
}
