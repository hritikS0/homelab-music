'use client';

import React, { useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { motion } from 'framer-motion';

export const UploadButton: React.FC = () => {
  const { handleUpload, uploading } = useMusicPlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        await handleUpload(files[0]);
      } catch {
        // Error logged to global state and console
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        id="dev-music-upload"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={uploading}
      />
      <label htmlFor="dev-music-upload">
        <motion.div
          whileHover={{ scale: uploading ? 1 : 1.03 }}
          whileTap={{ scale: uploading ? 1 : 0.98 }}
          className={`relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium text-xs tracking-wider uppercase cursor-pointer select-none transition-all shadow-md duration-300 ${
            uploading
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/10 hover:shadow-indigo-500/20 hover:shadow-lg border border-indigo-500/20'
          }`}
        >
          {/* Subtle Ambient Glow inside button */}
          {!uploading && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 blur-md opacity-50 hover:opacity-100 transition-opacity pointer-events-none" />
          )}

          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Uploading</span>
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              <span>Upload MP3</span>
            </>
          )}
        </motion.div>
      </label>
    </div>
  );
};

export default UploadButton;
