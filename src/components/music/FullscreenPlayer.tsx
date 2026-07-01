/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Shuffle, 
  Repeat,
  ListMusic,
  Music
} from 'lucide-react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion } from 'framer-motion';

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullscreenPlayer: React.FC<FullscreenPlayerProps> = ({ isOpen, onClose }) => {
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

  const [imgError, setImgError] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

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

  // Use synced lyrics from song metadata, or build unsynchronized from plain text
  const lyrics = activeSong?.syncLyrics && activeSong.syncLyrics.length > 0
    ? activeSong.syncLyrics
    : activeSong?.lyrics
      ? activeSong.lyrics.split('\n').filter(Boolean).map((line, i) => ({
          time: i * 99999,
          text: line.replace(/^\[.*?\]\s*/, ''),
        }))
      : [];

  const hasSyncedLyrics = activeSong?.syncLyrics && activeSong.syncLyrics.length > 0;

  const currentLyricIndex = hasSyncedLyrics
    ? lyrics.reduce((acc, lyric, idx) => {
        if (currentTime >= lyric.time) return idx;
        return acc;
      }, 0)
    : -1;

  // Auto-scroll lyrics for synced mode
  useEffect(() => {
    if (hasSyncedLyrics && lyricsContainerRef.current && currentLyricIndex >= 0) {
      const activeElement = lyricsContainerRef.current.children[currentLyricIndex] as HTMLElement;
      if (activeElement) {
        lyricsContainerRef.current.scrollTo({
          top: activeElement.offsetTop - 140,
          behavior: 'smooth'
        });
      }
    }
  }, [currentLyricIndex, hasSyncedLyrics]);

  if (!isOpen || !activeSong) return null;

  const artworkUrl = `/api/v1/songs/artwork/${activeSong.id}`;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed inset-0 z-50 bg-[#09090B] flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-hidden select-none"
    >
      {/* Liquid color-bleeding background derived from artwork */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {!imgError ? (
          <img
            src={artworkUrl}
            alt=""
                className="absolute inset-[-100px] h-[calc(100%+200px)] w-[calc(100%+200px)] object-cover filter blur-[80px] saturate-[180%] opacity-35"
                loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 opacity-55" />
        )}
        {/* Dark overlay sheet for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/60 via-[#09090B]/85 to-[#09090B]" />
      </div>

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
        >
          <ChevronDown size={18} />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Now Playing
        </span>
        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all">
          <ListMusic size={16} />
        </button>
      </div>

      {/* Main Split Content Area */}
      <div className="relative z-10 flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl mx-auto w-full py-8 overflow-hidden">
        
        {/* Left Column: Cover Artwork & Metadata */}
        <div className="flex flex-col items-center md:items-start gap-8 w-full">
          {/* Large cover art */}
          <div className="relative aspect-square w-64 sm:w-80 md:w-96 rounded-2xl bg-zinc-900/60 border border-white/[0.03] shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
            {!imgError ? (
              <img
                src={artworkUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <Music size={54} className="text-zinc-500" />
            )}
          </div>

          {/* Typography details */}
          <div className="text-center md:text-left min-w-0 w-full px-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {activeSong.title}
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 font-medium truncate mt-1.5">
              {activeSong.artist || 'Unknown Artist'}
            </p>
            <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-1">
              {activeSong.album || 'Unknown Album'}
            </p>
          </div>
        </div>

        {/* Right Column: Liquid scrolling lyrics view */}
        <div className="flex flex-col h-full w-full max-h-[380px] overflow-hidden relative">
          {lyrics.length > 0 ? (
            <div 
              ref={lyricsContainerRef}
              className="flex-grow overflow-y-auto space-y-6 scrollbar-none pr-4"
              style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, white 25%, white 75%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, white 25%, white 75%, transparent 100%)' }}
            >
              <div className="h-24" />
              {lyrics.map((lyric, idx) => {
                const isActive = hasSyncedLyrics && idx === currentLyricIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => hasSyncedLyrics && seek(lyric.time)}
                    className={`text-base md:text-xl font-bold tracking-tight cursor-pointer transition-all duration-300 origin-left ${
                      isActive 
                        ? 'text-white scale-102 opacity-100' 
                        : hasSyncedLyrics
                          ? 'text-white/25 hover:text-white/50 scale-98'
                          : 'text-white/60 hover:text-white/90'
                    }`}
                  >
                    {lyric.text}
                  </div>
                );
              })}
              <div className="h-32" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 text-sm font-medium">
              No lyrics available
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline & Controls */}
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6">
        
        {/* Seek timeline */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPct}
            onChange={handleProgressBarChange}
            className="w-full"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${progressPct}%, rgba(255, 255, 255, 0.1) ${progressPct}%, rgba(255, 255, 255, 0.1) 100%)`
            }}
          />
          <div className="flex justify-between text-[10px] font-mono font-medium text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between px-4">
          
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              isShuffled ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>

          {/* Controls package */}
          <div className="flex items-center gap-6">
            <button
              onClick={playPrev}
              className="p-2 text-zinc-400 hover:text-white active:scale-95 transition-all"
              title="Previous"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button
              onClick={togglePlay}
              className="h-14 w-14 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-zinc-400 hover:text-white active:scale-95 transition-all"
              title="Next"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          {/* Repeat */}
          <button
            onClick={toggleLoop}
            className={`p-2 transition-colors ${
              isLooping ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Repeat"
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Volume alignment */}
        <div className="flex items-center justify-center gap-3 max-w-xs mx-auto text-zinc-500">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
            {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-40"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${volume * 100}%, rgba(255, 255, 255, 0.1) ${volume * 100}%, rgba(255, 255, 255, 0.1) 100%)`
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FullscreenPlayer;
