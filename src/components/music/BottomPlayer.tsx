/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
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
    toggleShuffle,
    setIsFullscreenOpen
  } = useMusicPlayer();

  const [imgError, setImgError] = useState(false);

  // Reset image error state when active song changes
  useEffect(() => {
    setImgError(false);
  }, [activeSong?.id]);

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
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 h-20 bg-[#121212]/95 border-t border-[#282828]/40 backdrop-blur-md z-30 px-6 flex items-center justify-between"
        >
          {/* Active Song Info (Left) */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <div 
              onClick={() => setIsFullscreenOpen(true)}
              className="flex items-center gap-3 cursor-pointer group/meta min-w-0 flex-grow"
            >
              <div className="h-10 w-10 rounded bg-[#282828] border border-zinc-800/40 flex items-center justify-center shadow-sm shrink-0 overflow-hidden relative group-hover/meta:opacity-80 transition-opacity">
                {!imgError ? (
                  <img
                    src={`/api/v1/songs/artwork/${activeSong.id}`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover animate-fade-in"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Music size={15} className="text-zinc-400" />
                )}
              </div>
              <div className="min-w-0 pr-2">
                <span className="block text-xs font-semibold text-zinc-100 group-hover/meta:text-emerald-400 truncate transition-colors">
                  {activeSong.title}
                </span>
                <span className="block text-[10px] text-zinc-400 truncate mt-0.5">
                  {activeSong.artist || 'Unknown Artist'}
                </span>
              </div>
            </div>
            <button className="p-1 rounded text-zinc-400 hover:text-white transition-colors shrink-0">
              <Heart size={13} />
            </button>
          </div>

          {/* Central Controls & Timeline (Center) */}
          <div className="flex flex-col items-center gap-1.5 w-2/5 max-w-[450px]">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`p-1 transition-colors ${
                  isShuffled ? 'text-emerald-500' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Shuffle"
              >
                <Shuffle size={12} />
              </button>

              <button
                onClick={playPrev}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack size={13} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="h-7 w-7 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward size={13} fill="currentColor" />
              </button>

              <button
                onClick={toggleLoop}
                className={`p-1 transition-colors ${
                  isLooping ? 'text-emerald-500' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Repeat"
              >
                <Repeat size={12} />
              </button>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-2.5 w-full text-[9px] font-mono font-medium text-zinc-500 select-none">
              <span className="w-6 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPct}
                onChange={handleProgressBarChange}
                className="flex-grow"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${progressPct}%, rgba(255, 255, 255, 0.15) ${progressPct}%, rgba(255, 255, 255, 0.15) 100%)`
                }}
              />
              <span className="w-6 text-left">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Aux Tools (Right) */}
          <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[120px]">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
              {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-16"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #10B981 ${volume * 100}%, rgba(255, 255, 255, 0.15) ${volume * 100}%, rgba(255, 255, 255, 0.15) 100%)`
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BottomPlayer;
