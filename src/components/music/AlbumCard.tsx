/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Play, Music, Pause, Heart } from 'lucide-react';
import { Song } from '@/types/song';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion } from 'framer-motion';

interface AlbumCardProps {
  song: Song;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ song }) => {
  const { activeSong, isPlaying, setActiveSong, togglePlay, toggleFavorite } = useMusicPlayer();
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

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => setActiveSong(song)}
      className="w-36 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden group select-none animate-fade-in"
    >
      {/* Cover Artwork */}
      <div className="relative aspect-square w-full rounded-md bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-800/40 shadow-sm">
        {!imgError ? (
          <img
            src={`/api/v1/songs/artwork/${song.id}`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            onError={() => setImgError(true)}
          />
        ) : (
          <Music size={26} className={`transition-transform duration-300 group-hover:scale-102 ${
            isActive ? 'text-emerald-500' : 'text-zinc-600'
          }`} />
        )}

        {/* Favorite heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className="absolute top-2 right-2 z-10 p-1 rounded-full transition-all duration-150"
          title={song.liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={12}
            className={song.liked ? 'text-emerald-400 fill-emerald-400' : 'text-white/40 hover:text-white/70'}
          />
        </button>

        {/* Hover overlay play button */}
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
          <button
            onClick={handlePlayClick}
            className="h-8 w-8 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md relative z-10"
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
