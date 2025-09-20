'use client';

import { type KeyboardEvent, useMemo, useState } from 'react';
import { ArrowUpDown, Heart, RefreshCcw, Search } from 'lucide-react';

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
  onFavoriteToggle?: (song: Song, isFavorite: boolean) => void;
  favoriteOrder: string[];
  showFavoritesOnly: boolean;
  onFavoritesFilterToggle: () => void;
}

export default function SongList({ songs, currentSong, onSongSelect, onRefresh, onFavoriteToggle, favoriteOrder, showFavoritesOnly, onFavoritesFilterToggle }: SongListProps) {
  const [query, setQuery] = useState('');
  const [ascending, setAscending] = useState(true);

  const filteredSongs = useMemo(() => {
    const favoriteSet = new Set(favoriteOrder);
    const normalizedQuery = normalizeText(query.trim());

    const list = songs
      .filter((song) => {
        if (!normalizedQuery) return true;
        const normalizedTitle = normalizeText(song.title);
        const normalizedArtist = normalizeText(song.artist);
        return (
          normalizedTitle.includes(normalizedQuery) ||
          normalizedArtist.includes(normalizedQuery)
        );
      })
      .filter((song) => {
        if (!showFavoritesOnly) return true;
        return favoriteSet.has(song.id);
      });

    const direction = ascending ? 1 : -1;

    return list.sort((a, b) => {
      const comparator = normalizeText(a.title).localeCompare(normalizeText(b.title), 'tr');
      if (comparator !== 0) {
        return direction === 1 ? comparator : -comparator;
      }

      const artistComparator = normalizeText(a.artist).localeCompare(normalizeText(b.artist), 'tr');
      return direction === 1 ? artistComparator : -artistComparator;
    });
  }, [songs, query, ascending, favoriteOrder, showFavoritesOnly]);

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
          <RefreshCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleSort}
          className="song-toolbar-button"
          aria-label="Sıralamayı değiştir"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onFavoritesFilterToggle}
          className={`song-toolbar-button ${showFavoritesOnly ? 'bg-[#e74c3c]/20 text-[#e74c3c]' : ''}`.trim()}
          aria-pressed={showFavoritesOnly}
          aria-label={showFavoritesOnly ? 'Favorileri kapat' : 'Sadece favorileri göster'}
        >
          <Heart className={`h-4 w-4 transition-colors ${showFavoritesOnly ? 'text-[#e74c3c] fill-[#e74c3c]/80' : ''}`} />
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
                <FavoriteButton
                  songId={song.id}
                  onToggle={(next) => onFavoriteToggle?.(song, next)}
                />
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
