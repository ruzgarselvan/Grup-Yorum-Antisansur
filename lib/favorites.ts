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
  const favoriteSet = new Set(favorites);

  if (favoriteSet.has(songId)) {
    favoriteSet.delete(songId);
  } else {
    favoriteSet.add(songId);
  }

  const updated = Array.from(favoriteSet);
  saveToStorage(FAVORITES_KEY, updated);
  return favoriteSet.has(songId);
};
