'use client';

import React from 'react';
import { Play, Pause, Trash2, Music } from 'lucide-react';
import { Song } from '@/types/song';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion } from 'framer-motion';

interface SongRowProps {
  song: Song;
  index: number;
}

export const SongRow: React.FC<SongRowProps> = ({ song, index }) => {
  const { activeSong, isPlaying, setActiveSong, togglePlay, handleDelete } = useMusicPlayer();
  const isActive = activeSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      togglePlay();
    } else {
      setActiveSong(song);
    }
  };

  const formatDuration = (secs: number | null) => {
    if (secs === null || isNaN(secs) || secs === 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      onClick={() => setActiveSong(song)}
      className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
        isActive
          ? 'bg-indigo-950/20 border-indigo-500/30 shadow-md shadow-indigo-500/5'
          : 'bg-zinc-900/10 hover:bg-zinc-900/60 border-zinc-900/60 hover:border-zinc-800'
      }`}
    >
      {/* Song Info (Artwork, Title, Index) */}
      <div className="flex items-center gap-4 min-w-0 flex-grow pr-4">
        {/* Index / Play Hover Button */}
        <div className="w-6 h-6 flex items-center justify-center text-xs font-semibold text-zinc-500 shrink-0">
          <span className="group-hover:hidden">{isActive && isPlaying ? '🔊' : index + 1}</span>
          <button
            onClick={handlePlayClick}
            className="hidden group-hover:flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:scale-110 transition-all"
          >
            {isActive && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
        </div>

        {/* Artwork */}
        <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center shadow border border-white/[0.02]">
          {/* Subtle glow on active */}
          {isActive && (
            <div className="absolute inset-0 bg-indigo-500/20 blur-sm animate-pulse" />
          )}
          <Music size={16} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
        </div>

        {/* Text Details */}
        <div className="min-w-0">
          <p className={`text-xs font-semibold truncate ${isActive ? 'text-indigo-400' : 'text-zinc-200'}`}>
            {song.title}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5 truncate flex items-center gap-1.5 font-medium">
            <span>{song.mimeType?.split('/')?.[1]?.toUpperCase() || 'AUDIO'}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>{formatSize(song.size)}</span>
          </p>
        </div>
      </div>

      {/* Metadata & Actions */}
      <div className="flex items-center gap-6 shrink-0">
        <span className="text-[10px] font-semibold text-zinc-500 tracking-wider">
          {formatDuration(song.duration)}
        </span>

        {/* Delete Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(song.id);
          }}
          className="p-2 rounded-lg bg-transparent hover:bg-red-950/20 text-zinc-600 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all opacity-0 group-hover:opacity-100 duration-200"
          title="Delete song"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
};

export default SongRow;
