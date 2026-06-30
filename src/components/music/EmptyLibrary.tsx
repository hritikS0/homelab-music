'use client';

import React, { useRef } from 'react';
import { Music, Upload, FileAudio } from 'lucide-react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion } from 'framer-motion';

export const EmptyLibrary: React.FC = () => {
  const { handleUpload, uploading } = useMusicPlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-800/80 rounded-2xl py-24 text-center max-w-lg mx-auto bg-zinc-900/10 backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Icon */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 mb-6 shadow-md"
      >
        <Music size={28} />
      </motion.div>

      <h3 className="text-base font-bold text-white tracking-tight">Your music library is empty</h3>
      <p className="text-xs text-zinc-500 max-w-xs mt-2 leading-relaxed font-medium">
        Build your private homelab server by uploading your audio collection.
      </p>

      {/* Upload Trigger */}
      <input
        type="file"
        accept="audio/*"
        id="empty-state-upload"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={uploading}
      />
      <label htmlFor="empty-state-upload" className="mt-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-indigo-600/15 border border-indigo-500/30 cursor-pointer transition-all duration-300"
        >
          <Upload size={14} />
          Select MP3 File
        </motion.div>
      </label>

      {/* Formats info */}
      <div className="mt-8 pt-6 border-t border-zinc-900 w-full flex items-center justify-center gap-3 text-[10px] font-semibold tracking-wider text-zinc-600">
        <FileAudio size={12} />
        <span>SUPPORTED FORMATS:</span>
        <span className="text-zinc-500">MP3 • FLAC • WAV • AAC</span>
      </div>
    </div>
  );
};

export default EmptyLibrary;
