'use client';

import { type ChangeEvent, useMemo } from 'react';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
}

export default function VolumeControl({ volume, onChange }: VolumeControlProps) {
  const VolumeIcon = useMemo(() => {
    if (volume === 0) return VolumeX;
    if (volume < 0.33) return Volume;
    if (volume < 0.66) return Volume1;
    return Volume2;
  }, [volume]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    onChange(next);
  };

  const toggleMute = () => {
    onChange(volume > 0 ? 0 : 0.7);
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={toggleMute}
        className="control-button"
        aria-label={volume === 0 ? 'Sesi aç' : 'Sesi kapat'}
      >
        <VolumeIcon className="h-4 w-4" />
      </button>
      <div className="flex-1 w-full min-w-0">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleChange}
          className="w-full accent-blue-500"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
