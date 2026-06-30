'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-songs-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
        <Search size={16} />
      </div>
      <input
        id="search-songs-input"
        type="text"
        placeholder="Search songs, artists, albums..."
        value={value}
        onChange={handleChange}
        className="w-full pl-10 pr-16 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/80 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900/80 focus:ring-1 focus:ring-indigo-500/20 backdrop-blur-md transition-all duration-300"
      />
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-flex items-center gap-0.5 h-5 select-none rounded border border-zinc-800 bg-zinc-950/80 px-1.5 font-mono text-[10px] font-medium text-zinc-500">
          <span>⌘</span>K
        </kbd>
      </div>
    </div>
  );
};

export default SearchBar;
