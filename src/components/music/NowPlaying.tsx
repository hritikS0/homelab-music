'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Music,
  Heart,
  Plus
} from 'lucide-react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { Waveform } from './Waveform';
import { Queue } from './Queue';
import { motion } from 'framer-motion';

export const NowPlaying: React.FC = () => {
  const {
    activeSong,
    isPlaying,
    currentTime,
    duration,
    isLooping,
    isShuffled,
    togglePlay,
    playNext,
    playPrev,
    toggleLoop,
    toggleShuffle,
    seek
  } = useMusicPlayer();

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    const remaining = duration - currentTime;
    return remaining > 0 ? `-${formatTime(remaining)}` : '0:00';
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newTime = (value / 100) * duration;
    seek(newTime);
  };

  if (!activeSong) {
    return (
      <aside className="w-80 shrink-0 border-l border-zinc-900 bg-zinc-950/20 p-6 flex flex-col justify-center items-center text-center">
        <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
          <Music size={20} />
        </div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          No Track Active
        </p>
        <p className="text-[10px] text-zinc-600 mt-1 max-w-[180px] font-medium leading-relaxed">
          Select a song from your library to open the player dashboard.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-80 shrink-0 border-l border-zinc-900 bg-zinc-950/20 p-6 flex flex-col h-full z-20 overflow-y-auto">
      {/* Artwork Showcase with Ambient Blur Glow */}
      <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden shadow-2xl border border-white/[0.03] mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent blur-xl pointer-events-none" />
        
        {/* Soft glowing background replica */}
        <div className="absolute -inset-10 bg-indigo-500/10 opacity-30 blur-2xl animate-pulse" />

        <motion.div
          animate={{ scale: isPlaying ? 1.02 : 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Music size={64} className="text-indigo-400" />
        </motion.div>
      </div>

      {/* Song Info */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white tracking-tight truncate">
            {activeSong.title}
          </h3>
          <p className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase truncate mt-0.5">
            {activeSong.mimeType?.split('/')?.[1]?.toUpperCase() || 'AUDIO'}
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button className="p-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800/40 transition-all">
            <Heart size={12} />
          </button>
          <button className="p-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800/40 transition-all">
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-6 py-2 border-y border-zinc-900/60">
        <Waveform isPlaying={isPlaying} />
      </div>

      {/* Progress & Duration */}
      <div className="space-y-2 mb-6">
        <input
          type="range"
          min="0"
          max="100"
          value={progressPct}
          onChange={handleProgressBarChange}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-[9px] font-mono font-semibold text-zinc-500">
          <span>{formatTime(currentTime)}</span>
          <span>{getRemainingTime()}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2 mb-8">
        <button
          onClick={toggleShuffle}
          className={`p-2 transition-all hover:scale-105 ${
            isShuffled ? 'text-indigo-400 shadow-md shadow-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Shuffle"
        >
          <Shuffle size={14} />
        </button>

        <button
          onClick={playPrev}
          className="p-2 text-zinc-400 hover:text-white active:scale-95 transition-all"
          title="Previous"
        >
          <SkipBack size={16} fill="currentColor" />
        </button>

        <button
          onClick={togglePlay}
          className="h-10 w-10 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-white/10"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        <button
          onClick={playNext}
          className="p-2 text-zinc-400 hover:text-white active:scale-95 transition-all"
          title="Next"
        >
          <SkipForward size={16} fill="currentColor" />
        </button>

        <button
          onClick={toggleLoop}
          className={`p-2 transition-all hover:scale-105 ${
            isLooping ? 'text-indigo-400 shadow-md shadow-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Repeat"
        >
          <Repeat size={14} />
        </button>
      </div>

      {/* Queue section */}
      <div className="flex-grow flex flex-col min-h-[140px]">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
          Upcoming Queue
        </h4>
        <div className="flex-grow overflow-y-auto pr-1">
          <Queue />
        </div>
      </div>
    </aside>
  );
};

export default NowPlaying;
