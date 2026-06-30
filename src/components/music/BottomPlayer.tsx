'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Music,
  Heart,
  Shuffle,
  Repeat
} from 'lucide-react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion, AnimatePresence } from 'framer-motion';

export const BottomPlayer: React.FC = () => {
  const {
    activeSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLooping,
    isShuffled,
    togglePlay,
    playNext,
    playPrev,
    setVolume,
    seek,
    toggleLoop,
    toggleShuffle
  } = useMusicPlayer();

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newTime = (value / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value / 100);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.8);
    }
  };

  return (
    <AnimatePresence>
      {activeSong && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 right-6 h-20 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl shadow-2xl z-30 px-6 flex items-center justify-between"
        >
          {/* Active Song Info (Left) */}
          <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/[0.02] flex items-center justify-center shadow shrink-0">
              <Music size={18} className="text-indigo-400" />
            </div>
            <div className="min-w-0 pr-2">
              <span className="block text-xs font-bold text-white truncate">
                {activeSong.title}
              </span>
              <span className="block text-[9px] font-semibold text-zinc-500 tracking-wider uppercase truncate mt-0.5">
                {activeSong.mimeType.split('/')[1]?.toUpperCase() || 'AUDIO'}
              </span>
            </div>
            <button className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/10 transition-colors shrink-0">
              <Heart size={14} />
            </button>
          </div>

          {/* Central Controls & Timeline (Center) */}
          <div className="flex flex-col items-center gap-1.5 w-2/5 max-w-[500px]">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleShuffle}
                className={`p-1 transition-colors ${
                  isShuffled ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Shuffle"
              >
                <Shuffle size={12} />
              </button>

              <button
                onClick={playPrev}
                className="p-1 text-zinc-400 hover:text-white active:scale-95 transition-all"
                title="Previous"
              >
                <SkipBack size={14} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="h-8 w-8 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="p-1 text-zinc-400 hover:text-white active:scale-95 transition-all"
                title="Next"
              >
                <SkipForward size={14} fill="currentColor" />
              </button>

              <button
                onClick={toggleLoop}
                className={`p-1 transition-colors ${
                  isLooping ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Repeat"
              >
                <Repeat size={12} />
              </button>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-3 w-full text-[9px] font-mono font-semibold text-zinc-500 select-none">
              <span className="w-8 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPct}
                onChange={handleProgressBarChange}
                className="flex-grow accent-indigo-500"
              />
              <span className="w-8 text-left">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Aux Tools (Right) */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[150px]">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-20 accent-indigo-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BottomPlayer;
