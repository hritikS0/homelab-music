'use client';

import React from 'react';
import { SearchBar } from '../ui/SearchBar';
import { UploadButton } from '../ui/UploadButton';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopbarProps {
  onSearch?: (term: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onSearch }) => {
  const { isScanning, scanProgress, triggerScan } = useMusicPlayer();

  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-zinc-900 bg-zinc-950/10 backdrop-blur-md z-15">
      {/* Greetings */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Good evening, Hritik 👋
        </h2>
        <p className="text-[11px] text-zinc-500 font-semibold tracking-wide uppercase mt-0.5">
          Your personal music server
        </p>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <SearchBar onSearch={onSearch} />

        {/* Scan Library Trigger */}
        <motion.button
          whileHover={{ scale: isScanning ? 1 : 1.03 }}
          whileTap={{ scale: isScanning ? 1 : 0.98 }}
          onClick={() => triggerScan()}
          disabled={isScanning}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-300 ${
            isScanning
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 cursor-not-allowed'
              : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 size={12} className="animate-spin text-amber-400" />
              <span>{scanProgress || 'Scanning...'}</span>
            </>
          ) : (
            <>
              <RefreshCw size={12} className="text-zinc-400" />
              <span>Scan Library</span>
            </>
          )}
        </motion.button>

        {/* Upload Trigger */}
        <UploadButton />

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] shadow-md cursor-pointer hover:scale-105 transition-all duration-300">
          <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-xs text-zinc-300">
            H
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
