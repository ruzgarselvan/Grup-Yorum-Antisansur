'use client';

import { type TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PlayerControls from '@/components/PlayerControls';
import SongList from '@/components/SongList';
import { getFavorites } from '@/lib/favorites';
import { clamp, loadFromStorage, preloadNextSong, saveToStorage } from '@/lib/utils';
import type { Song } from '@/types';

const VOLUME_KEY = 'music-player:volume';
const POSITIONS_KEY = 'music-player:positions';
const LAST_SONG_KEY = 'music-player:last-song';

const REPEAT_SEQUENCE: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];

type PositionMap = Record<string, number | undefined>;

const getNextRepeatMode = (mode: 'off' | 'all' | 'one') => {
  const currentIndex = REPEAT_SEQUENCE.indexOf(mode);
  const nextIndex = (currentIndex + 1) % REPEAT_SEQUENCE.length;
  return REPEAT_SEQUENCE[nextIndex];
};

const pickRandomIndex = (length: number, exclude: number) => {
  if (length <= 1) return exclude;
  let next = Math.floor(Math.random() * length);
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }
  return next;
};

interface NextIndexParams {
  currentIndex: number;
  songsLength: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  triggeredByEnd: boolean;
}

const getNextIndex = ({ currentIndex, songsLength, shuffle, repeatMode, triggeredByEnd }: NextIndexParams) => {
  if (!songsLength) return null;
  if (shuffle) {
    return pickRandomIndex(songsLength, currentIndex);
  }

  const isLast = currentIndex >= songsLength - 1;
  if (!isLast) {
    return currentIndex + 1;
  }

  if (triggeredByEnd) {
    return repeatMode === 'all' ? 0 : null;
  }

  return 0;
};

const getPreviousIndex = (
  currentIndex: number,
  songsLength: number,
  shuffle: boolean
) => {
  if (!songsLength) return null;

  if (shuffle) {
    return pickRandomIndex(songsLength, currentIndex);
  }

  if (currentIndex === 0) {
    return songsLength - 1;
  }

  return currentIndex - 1;
};

interface MusicPlayerProps {
  initialSongs: Song[];
}

export default function MusicPlayer({ initialSongs }: MusicPlayerProps) {
  const initialSongsRef = useRef(initialSongs);
  const [songs, setSongs] = useState(initialSongs);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);
  const positionsRef = useRef<PositionMap>({});
  const [positionsLoaded, setPositionsLoaded] = useState(false);
  const lastSavedPositionRef = useRef<number>(0);
  const touchStartRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const pendingSeekRef = useRef<number | null>(null);
  const autoPlayRef = useRef(false);
  const currentSongIdRef = useRef<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const currentSong = useMemo(() => songs[currentIndex] ?? null, [songs, currentIndex]);

  useEffect(() => {
    currentSongIdRef.current = currentSong?.id ?? null;
  }, [currentSong?.id]);

  useEffect(() => {
    const storedPositions = loadFromStorage<PositionMap>(POSITIONS_KEY, {});
    positionsRef.current = storedPositions;
    setPositionsLoaded(true);
  }, []);

  useEffect(() => {
    initialSongsRef.current = initialSongs;
    setSongs(initialSongs);

    const currentId = currentSongIdRef.current;
    if (currentId) {
      const nextIndex = initialSongs.findIndex((song) => song.id === currentId);
      if (nextIndex >= 0) {
        setCurrentIndex(nextIndex);
        return;
      }
    }

    if (!initialSongs.length) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prevIndex) => Math.min(prevIndex, initialSongs.length - 1));
  }, [initialSongs]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    const storedVolume = clamp(loadFromStorage<number>(VOLUME_KEY, 0.7), 0, 1);
    setVolume(storedVolume);
  }, []);

  useEffect(() => {
    if (!songs.length) {
      setIsPlaying(false);
    }
  }, [songs.length]);

  useEffect(() => {
    const saved = loadFromStorage<{ songId: string } | null>(LAST_SONG_KEY, null);
    if (!saved) return;

    const index = songs.findIndex((song) => song.id === saved.songId);
    if (index >= 0) {
      setCurrentIndex(index);
    }
  }, [songs]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.filePath;
    audio.load();

    const savedPosition = positionsRef.current[currentSong.id];
    if (positionsLoaded && savedPosition !== undefined) {
      setCurrentTime(savedPosition);
      pendingSeekRef.current = savedPosition;
    } else {
      setCurrentTime(0);
      pendingSeekRef.current = null;
    }

    autoPlayRef.current = isPlaying;
    setDuration(audio.duration || 0);
    saveToStorage(LAST_SONG_KEY, { songId: currentSong.id });
  }, [currentSong?.id, positionsLoaded]);

  useEffect(() => {
    const nextIndex = getNextIndex({
      currentIndex,
      songsLength: songs.length,
      shuffle,
      repeatMode,
      triggeredByEnd: false,
    });

    if (nextIndex !== null && songs[nextIndex]) {
      preloadNextSong(songs[nextIndex].filePath);
    }
  }, [currentIndex, songs, shuffle, repeatMode]);

  const handleFavoriteToggle = useCallback(
    (_song: Song, _isFavorite: boolean) => {
      const updatedFavorites = getFavorites();
      setFavorites(updatedFavorites);
      if (showFavoritesOnly && !updatedFavorites.length) {
        setShowFavoritesOnly(false);
      }
    },
    [showFavoritesOnly]
  );

  const handleFavoritesFilterToggle = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    const now = audio.currentTime;
    setCurrentTime(now);

    if (audio.paused && !audio.seeking) return;

    const nowTimestamp = Date.now();
    positionsRef.current[currentSong.id] = Math.max(0, parseFloat(now.toFixed(3)));
    if (nowTimestamp - lastSavedPositionRef.current > 3000) {
      saveToStorage(POSITIONS_KEY, positionsRef.current);
      lastSavedPositionRef.current = nowTimestamp;
    }
  }, [currentSong]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const durationValue = audio.duration || 0;
    setDuration(durationValue);

    if (pendingSeekRef.current !== null) {
      const target = clamp(pendingSeekRef.current, 0, durationValue);
      audio.currentTime = target;
      setCurrentTime(target);
      pendingSeekRef.current = null;
    }

    if (autoPlayRef.current) {
      const playPromise = audio.play();
      autoPlayRef.current = false;
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Playback failed', error);
          setIsPlaying(false);
        });
      }
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong) {
      if (songs.length) {
        autoPlayRef.current = true;
        setCurrentIndex(0);
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      autoPlayRef.current = false;
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = audio.play();
    autoPlayRef.current = false;
    setIsPlaying(true);
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Playback failed', error);
        setIsPlaying(false);
      });
    }
  }, [currentSong, isPlaying, songs.length]);

  const handleNext = useCallback(
    (triggeredByEnd = false) => {
      if (!songs.length) return;

      const nextIndex = getNextIndex({
        currentIndex,
        songsLength: songs.length,
        shuffle,
        repeatMode,
        triggeredByEnd,
      });

      if (nextIndex === null) {
        const audio = audioRef.current;
        audio?.pause();
        autoPlayRef.current = false;
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }

      setCurrentIndex(nextIndex);
      autoPlayRef.current = true;
      setIsPlaying(true);
    },
    [songs, currentIndex, shuffle, repeatMode]
  );

  const handlePrevious = useCallback(() => {
    if (!songs.length) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const nextIndex = getPreviousIndex(currentIndex, songs.length, shuffle);
    if (nextIndex === null) return;

    setCurrentIndex(nextIndex);
    autoPlayRef.current = true;
    setIsPlaying(true);
  }, [songs, currentIndex, shuffle]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const safeDuration = duration || audio.duration || 0;
    const target = clamp(time, 0, safeDuration);
    const wasPlaying = !audio.paused && !audio.ended;

    if (wasPlaying) {
      autoPlayRef.current = true;
      audio.pause();
    } else {
      autoPlayRef.current = false;
    }

    pendingSeekRef.current = target;
    audio.currentTime = target;
    setCurrentTime(target);
    if (currentSong) {
      positionsRef.current[currentSong.id] = target;
    }

    if (wasPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            autoPlayRef.current = false;
            setIsPlaying(true);
          })
          .catch((error) => {
            console.warn('Playback failed after seeking', error);
            autoPlayRef.current = false;
            setIsPlaying(false);
          });
      } else {
        autoPlayRef.current = false;
      }
    }
  }, [duration, currentSong]);

  const handleVolumeChange = useCallback((value: number) => {
    const audio = audioRef.current;
    const nextVolume = clamp(value, 0, 1);
    if (audio) {
      audio.volume = nextVolume;
    }
    setVolume(nextVolume);
    saveToStorage(VOLUME_KEY, nextVolume);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => getNextRepeatMode(prev));
  }, []);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      }
      return;
    }
    handleNext(true);
  }, [handleNext, repeatMode]);

  const handleError = useCallback(() => {
    console.error('Şarkı yüklenirken bir sorun oluştu');
    handleNext(true);
  }, [handleNext]);

  const handleSongSelect = useCallback(
    (song: Song) => {
      const index = songs.findIndex((item) => item.id === song.id);
      if (index === -1) return;
      setCurrentIndex(index);
      autoPlayRef.current = true;
      setIsPlaying(true);
    },
    [songs]
  );

  const handleRefresh = useCallback(() => {
    setSongs([...initialSongsRef.current]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    autoPlayRef.current = false;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded, handleError]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const interactiveTag = target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName);
      if (interactiveTag) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleVolumeChange(clamp(volume + 0.05, 0, 1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleVolumeChange(clamp(volume - 0.05, 0, 1));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePlayPause, handlePrevious, handleVolumeChange, volume]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartRef.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartRef.current;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 60) {
      if (deltaX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handlePlayPause();
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    return () => {
      saveToStorage(POSITIONS_KEY, positionsRef.current);
    };
  }, []);

  return (
    <div
      className="main-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex h-full flex-col gap-3.5 p-4">
        <div className="min-h-0 flex-1">
          <SongList
            songs={songs}
            currentSong={currentSong}
            onSongSelect={handleSongSelect}
            onRefresh={handleRefresh}
            onFavoriteToggle={handleFavoriteToggle}
            favoriteOrder={favorites}
            showFavoritesOnly={showFavoritesOnly}
            onFavoritesFilterToggle={handleFavoritesFilterToggle}
          />
        </div>

        <div className="shrink-0">
          <PlayerControls
            title={currentSong?.title ?? 'Şarkı seçin'}
            artist={currentSong?.artist ?? ''}
            isPlaying={isPlaying}
            shuffle={shuffle}
            repeatMode={repeatMode}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onPlayPause={handlePlayPause}
            onNext={() => handleNext(false)}
            onPrevious={handlePrevious}
            onShuffle={toggleShuffle}
            onRepeatChange={toggleRepeat}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
          />
        </div>
      </div>
      <audio ref={audioRef} preload="metadata" className="hidden" />
    </div>
  );
}
