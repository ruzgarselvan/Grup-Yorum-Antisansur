import { isClient, loadFromStorage, saveToStorage } from '@/lib/utils';

const FAVORITES_KEY = 'music-player:favorites';

export const getFavorites = (): string[] => {
  return loadFromStorage<string[]>(FAVORITES_KEY, []);
};

export const isFavorite = (songId: string): boolean => {
  if (!songId) return false;
  return getFavorites().includes(songId);
};

export const toggleFavorite = (songId: string): boolean => {
  if (!songId || !isClient()) return false;

  const favorites = getFavorites();
  let updated: string[];
  let isNowFavorite = false;

  if (favorites.includes(songId)) {
    updated = favorites.filter((id) => id !== songId);
  } else {
    updated = [songId, ...favorites];
    isNowFavorite = true;
  }

  saveToStorage(FAVORITES_KEY, updated);
  return isNowFavorite;
};
