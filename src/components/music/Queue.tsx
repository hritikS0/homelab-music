'use client';

import React from 'react';
import { Music, Play } from 'lucide-react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';

export const Queue: React.FC = () => {
  const { songs, activeSong, setActiveSong } = useMusicPlayer();

  // Find index of current song to show upcoming ones
  const currentIndex = activeSong ? songs.findIndex((s) => s.id === activeSong.id) : -1;
  
  // Show up to 3 upcoming songs
  const upcomingSongs = currentIndex !== -1 
    ? songs.slice(currentIndex + 1, currentIndex + 4)
    : songs.slice(0, 3);

  if (upcomingSongs.length === 0) {
    return (
      <div className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider text-center py-4 border border-dashed border-zinc-900 rounded-xl">
        Queue Empty
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingSongs.map((song) => (
        <div
          key={song.id}
          onClick={() => setActiveSong(song)}
          className="group flex items-center justify-between p-2 rounded-lg bg-zinc-900/10 hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800/40 cursor-pointer select-none transition-all duration-300"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {/* Artwork Icon */}
            <div className="h-7 w-7 rounded bg-zinc-900 flex items-center justify-center text-zinc-600 shrink-0 border border-white/[0.01]">
              <Music size={12} className="group-hover:text-indigo-400 transition-colors" />
            </div>

            {/* Song Text */}
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-zinc-300 truncate">
                {song.title}
              </span>
              <span className="block text-[8px] font-medium text-zinc-500 truncate mt-0.5">
                Next in queue
              </span>
            </div>
          </div>

          {/* Action icon */}
          <span className="text-zinc-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
            <Play size={10} fill="currentColor" />
          </span>
        </div>
      ))}
    </div>
  );
};

export default Queue;
