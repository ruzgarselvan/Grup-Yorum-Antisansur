export interface Song {
  id: string;
  title: string;
  artist: string;
  filePath: string;
  duration?: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  playlist: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
}
