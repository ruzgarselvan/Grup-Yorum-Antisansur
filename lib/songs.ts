import fs from 'fs';
import path from 'path';

import type { Song } from '@/types';

const AUDIO_DIRECTORY = path.join(process.cwd(), 'public', 'audio');

export const formatSongTitle = (filename: string): string => {
  const withoutExtension = filename.replace(path.extname(filename), '');
  const normalized = withoutExtension.replace(/[-_]+/g, ' ');
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getArtistFromFilename = (filename: string): string => {
  const withoutExtension = filename.replace(path.extname(filename), '');
  const parts = withoutExtension.split('__');

  if (parts.length === 2) {
    return formatSongTitle(parts[0]);
  }

  return 'Grup Yorum';
};

const buildSong = (filename: string): Song => {
  const id = filename.replace(path.extname(filename), '');
  return {
    id,
    title: formatSongTitle(filename),
    artist: getArtistFromFilename(filename),
    filePath: `/audio/${filename}`,
  };
};

const fallbackSongs: Song[] = [
  {
    id: 'sevda-turkusu',
    title: 'Sevda Turkusu',
    artist: 'Grup Yorum',
    filePath: '/audio/sevda-turkusu.mp3',
  },
  {
    id: 'sibel-yalcin-destani',
    title: 'Sibel Yalcin Destani',
    artist: 'Grup Yorum',
    filePath: '/audio/sibel-yalcin-destani.mp3',
  },
  {
    id: 'sisli-meydaninda-uc-kiz',
    title: 'Sisli Meydaninda Uc Kiz',
    artist: 'Grup Yorum',
    filePath: '/audio/sisli-meydaninda-uc-kiz.mp3',
  },
  {
    id: 'siirilip-gelen',
    title: 'Siyrilip Gelen',
    artist: 'Grup Yorum',
    filePath: '/audio/siyrilip-gelen.mp3',
  },
  {
    id: 'soluk-soluga',
    title: 'Soluk Soluga',
    artist: 'Grup Yorum',
    filePath: '/audio/soluk-soluga.mp3',
  },
];

export const getSongs = (): Song[] => {
  try {
    if (!fs.existsSync(AUDIO_DIRECTORY)) {
      return fallbackSongs;
    }

    const mp3Files = fs
      .readdirSync(AUDIO_DIRECTORY)
      .filter((file) => file.toLowerCase().endsWith('.mp3'))
      .sort();

    if (!mp3Files.length) {
      return fallbackSongs;
    }

    return mp3Files.map((filename) => buildSong(filename));
  } catch (error) {
    console.warn('Failed to read audio directory', error);
    return fallbackSongs;
  }
};
