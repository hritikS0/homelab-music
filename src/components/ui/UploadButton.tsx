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
        // Error logged to state
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
          whileHover={{ scale: uploading ? 1 : 1.02 }}
          whileTap={{ scale: uploading ? 1 : 0.98 }}
          className={`relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] cursor-pointer select-none transition-all border ${
            uploading
              ? 'bg-zinc-900 text-zinc-500 border-transparent cursor-not-allowed'
              : 'bg-[#18181B] hover:bg-[#27272A] border-zinc-800 text-zinc-200'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 text-zinc-400" />
              <span>Upload MP3</span>
            </>
          )}
        </motion.div>
      </label>
    </div>
  );
};

export default UploadButton;
