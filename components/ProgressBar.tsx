'use client';

import { type MouseEvent, type TouchEvent, useCallback, useRef, useState } from 'react';

import { formatTime } from '@/lib/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const calculatePoint = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container || duration <= 0) return;
      const rect = container.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const clamped = Math.min(Math.max(ratio, 0), 1);
      onSeek(clamped * duration);
    },
    [duration, onSeek]
  );

  const handlePointerDown = (event: MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    calculatePoint(event.clientX);
  };

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    calculatePoint(event.clientX);
  };

  const handlePointerUp = () => {
    setIsSeeking(false);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    calculatePoint(event.touches[0].clientX);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    calculatePoint(event.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsSeeking(false);
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="progress-container"
        role="slider"
        aria-valuemin={0}
        aria-valuenow={Math.floor(currentTime)}
        aria-valuemax={Math.floor(duration)}
        aria-label="Playback progress"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
