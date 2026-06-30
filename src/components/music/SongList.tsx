'use client';

import React from 'react';
import { Song } from '@/types/song';
import { SongRow } from './SongRow';
import { AnimatePresence } from 'framer-motion';

interface SongListProps {
  songs: Song[];
}

export const SongList: React.FC<SongListProps> = ({ songs }) => {
  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      <AnimatePresence mode="popLayout">
        {songs.map((song, idx) => (
          <SongRow key={song.id} song={song} index={idx} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SongList;
