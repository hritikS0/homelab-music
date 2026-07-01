'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
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
    <div className="relative w-full max-w-[160px] sm:max-w-[240px] md:w-64">
      <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-zinc-500">
        <Search size={13} />
      </div>
      <input
        id="search-songs-input"
        type="text"
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        className="w-full pl-8 pr-12 py-1 rounded bg-[#18181B]/40 hover:bg-[#18181B]/80 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:bg-[#18181B] focus:ring-0 transition-all duration-200 border border-transparent focus:border-[#27272A]"
      />
      <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-flex items-center gap-0.5 select-none rounded bg-zinc-950 px-1 font-mono text-[9px] font-medium text-zinc-600 border border-zinc-800/40">
          <span>⌘</span>K
        </kbd>
      </div>
    </div>
  );
};

export default SearchBar;
