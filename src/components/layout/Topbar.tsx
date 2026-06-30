'use client';

import React from 'react';
import { SearchBar } from '../ui/SearchBar';
import { UploadButton } from '../ui/UploadButton';

interface TopbarProps {
  onSearch?: (term: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onSearch }) => {
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
