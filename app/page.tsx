import MusicPlayer from '@/components/MusicPlayer';
import { getSongs } from '@/lib/songs';

export default async function HomePage() {
  const songs = getSongs();

  return (
    <main
      className="flex h-screen w-full items-center justify-center px-4 bg-gradient-to-br from-black via-[var(--bg-primary)] to-[var(--bg-secondary)] overflow-hidden"
      style={{ minHeight: '100dvh' }}
    >
      <MusicPlayer initialSongs={songs} />
    </main>
  );
}
