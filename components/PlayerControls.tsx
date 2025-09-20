'use client';

import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1 } from 'lucide-react';

import ProgressBar from '@/components/ProgressBar';
import VolumeControl from '@/components/VolumeControl';

interface PlayerControlsProps {
  title: string;
  artist: string;
  isPlaying: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onRepeatChange: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

export default function PlayerControls({
  title,
  artist,
  isPlaying,
  shuffle,
  repeatMode,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeatChange,
  onSeek,
  onVolumeChange,
}: PlayerControlsProps) {
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-inner backdrop-blur">
      <div className="space-y-0.5 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/50">Şimdi Çalıyor</p>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-[10px] text-white/60">{artist}</p>
      </div>

      <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            className={`control-button ${shuffle ? 'text-white bg-white/10' : ''}`.trim()}
            onClick={onShuffle}
            aria-label={shuffle ? 'Karışık çalmayı kapat' : 'Karışık çalmayı aç'}
          >
            <Shuffle className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="control-button"
            onClick={onPrevious}
            aria-label="Önceki şarkı"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="play-button"
            onClick={onPlayPause}
            aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>

          <button
            type="button"
            className="control-button"
            onClick={onNext}
            aria-label="Sonraki şarkı"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          <button
            type="button"
            className={`control-button ${repeatMode !== 'off' ? 'text-white bg-white/10' : ''}`.trim()}
            onClick={onRepeatChange}
            aria-label="Tekrar modunu değiştir"
          >
            <RepeatIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="pt-0">
          <VolumeControl volume={volume} onChange={onVolumeChange} />
        </div>
      </div>
    </div>
  );
}
