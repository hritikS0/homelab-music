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
    <header className="flex items-center justify-between py-4 px-8 bg-transparent">
      {/* Search Input on the Left */}
      <SearchBar onSearch={onSearch} />

      {/* Actions on the Right */}
      <div className="flex items-center gap-3">
        {/* Scan Library */}
        <motion.button
          whileHover={{ scale: isScanning ? 1 : 1.02 }}
          whileTap={{ scale: isScanning ? 1 : 0.98 }}
          onClick={() => triggerScan()}
          disabled={isScanning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 border border-transparent ${
            isScanning
              ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 border-zinc-800/40 hover:border-zinc-800'
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 size={11} className="animate-spin text-zinc-500" />
              <span>{scanProgress || 'Scanning...'}</span>
            </>
          ) : (
            <>
              <RefreshCw size={11} className="text-zinc-400" />
              <span>Scan Library</span>
            </>
          )}
        </motion.button>

        {/* Upload Trigger */}
        <UploadButton />

        {/* User avatar / profile button */}
        <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-400 border border-zinc-700/30 cursor-pointer">
          H
        </div>
      </div>
    </header>
  );
};

export default Topbar;
