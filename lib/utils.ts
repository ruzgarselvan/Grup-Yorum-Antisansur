const pad = (value: number) => value.toString().padStart(2, '0');

export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${pad(remainingSeconds)}`;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const isClient = () => typeof window !== 'undefined';

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (!isClient()) return fallback;

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch (error) {
    console.warn(`Failed to read ${key} from storage`, error);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, value: T) => {
  if (!isClient()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write ${key} to storage`, error);
  }
};

export const preloadNextSong = (src: string) => {
  if (!isClient()) return;
  const audio = new Audio(src);
  audio.preload = 'metadata';
};
