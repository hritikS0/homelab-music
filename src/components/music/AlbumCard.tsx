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
      whileHover={{ y: -4 }}
      onClick={() => setActiveSong(song)}
      className="glass-card w-44 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer relative overflow-hidden group select-none"
    >
      {/* Cover Art Wrapper */}
      <div className="relative aspect-square w-full rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center shadow-md overflow-hidden border border-white/[0.02]">
        {/* Soft Glow */}
        {isActive && (
          <div className="absolute inset-0 bg-indigo-500/10 blur-sm animate-pulse" />
        )}
        
        <Music size={32} className={`transition-transform duration-500 group-hover:scale-105 ${
          isActive ? 'text-indigo-400' : 'text-zinc-500'
        }`} />

        {/* Hover Play Button */}
        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <button
            onClick={handlePlayClick}
            className="h-10 w-10 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
          >
            {isActive && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="min-w-0">
        <span className={`block text-xs font-bold truncate ${
          isActive ? 'text-indigo-400' : 'text-zinc-200'
        }`}>
          {song.title}
        </span>
        <span className="block text-[9px] font-semibold text-zinc-500 tracking-wider uppercase mt-1">
          {song.mimeType?.split('/')?.[1]?.toUpperCase() || 'AUDIO'}
        </span>
      </div>
    </motion.div>
  );
};

export default AlbumCard;
