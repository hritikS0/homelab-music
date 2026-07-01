/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Play, Pause, Trash2, Music, Heart } from 'lucide-react';
import { Song } from '@/types/song';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion } from 'framer-motion';

interface SongRowProps {
  song: Song;
  index: number;
}

export const SongRow: React.FC<SongRowProps> = ({ song, index }) => {
  const { activeSong, isPlaying, setActiveSong, togglePlay, handleDelete, toggleFavorite } = useMusicPlayer();
  const isActive = activeSong?.id === song.id;
  const [imgError, setImgError] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12, delay: Math.min(index * 0.006, 0.15) }}
      onClick={() => setActiveSong(song)}
      className={`group flex items-center justify-between px-4 py-2.5 rounded-md cursor-pointer select-none transition-all duration-150 ${
        isActive
          ? 'bg-zinc-800/40 text-white'
          : 'hover:bg-zinc-800/25 text-zinc-300 hover:text-white'
      }`}
    >
      {/* Song Info (Artwork, Title, Artist) */}
      <div className="flex items-center gap-4 min-w-0 flex-grow pr-4">
        {/* Index/Play button hover toggle */}
        <div className="w-5 h-5 flex items-center justify-center text-xs text-zinc-500 shrink-0">
          <span className="group-hover:hidden">{isActive && isPlaying ? '🔊' : index + 1}</span>
          <button
            onClick={handlePlayClick}
            className="hidden group-hover:flex items-center justify-center text-zinc-200 hover:scale-105 transition-all"
          >
            {isActive && isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
        </div>

        {/* Artwork */}
        <div className="relative h-9 w-9 rounded overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800/60 flex items-center justify-center shadow-sm">
          {!imgError ? (
            <img
              src={`/api/v1/songs/artwork/${song.id}`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <Music size={13} className={isActive ? 'text-emerald-500' : 'text-zinc-500'} />
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0">
          <p className={`text-xs font-medium truncate ${isActive ? 'text-emerald-400' : 'text-zinc-200'}`}>
            {song.title}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5 truncate font-normal">
            {song.artist || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Album Name (if any, middle column) */}
      <div className="hidden md:block w-1/3 min-w-[120px] truncate text-xs text-zinc-500">
        {song.album || 'Unknown Album'}
      </div>

      {/* Duration, Favorite & Delete */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Favorite heart button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className="p-1 rounded transition-all duration-150 cursor-pointer"
          title={song.liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <motion.div
            animate={song.liked ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            <Heart
              size={12}
              className={song.liked ? 'text-rose-500' : 'text-zinc-600 hover:text-zinc-450'}
              fill={song.liked ? 'currentColor' : 'none'}
            />
          </motion.div>
        </motion.button>

        <span className="text-[11px] text-zinc-500 font-mono">
          {formatDuration(song.duration)}
        </span>

        {/* Delete button, reveal on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(song.id);
          }}
          className="p-1 rounded text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
          title="Delete track"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
};

export default SongRow;
