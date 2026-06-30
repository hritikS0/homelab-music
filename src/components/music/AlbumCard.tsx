'use client';

import React from 'react';
import { Play, Music, Pause } from 'lucide-react';
import { Song } from '@/types/song';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion } from 'framer-motion';

interface AlbumCardProps {
  song: Song;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ song }) => {
  const { activeSong, isPlaying, setActiveSong, togglePlay } = useMusicPlayer();
  const isActive = activeSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      togglePlay();
    } else {
      setActiveSong(song);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => setActiveSong(song)}
      className="w-36 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden group select-none"
    >
      {/* Cover Artwork */}
      <div className="relative aspect-square w-full rounded-md bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-800/40 shadow-sm">
        <Music size={26} className={`transition-transform duration-300 group-hover:scale-102 ${
          isActive ? 'text-emerald-500' : 'text-zinc-600'
        }`} />

        {/* Hover overlay play button */}
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
          <button
            onClick={handlePlayClick}
            className="h-8 w-8 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            {isActive && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Text Details */}
      <div className="min-w-0 px-0.5">
        <span className={`block text-[11px] font-medium truncate ${
          isActive ? 'text-emerald-400' : 'text-zinc-200'
        }`}>
          {song.title}
        </span>
        <span className="block text-[9px] text-zinc-500 truncate mt-0.5 font-normal">
          {song.artist || 'Unknown Artist'}
        </span>
      </div>
    </motion.div>
  );
};

export default AlbumCard;
