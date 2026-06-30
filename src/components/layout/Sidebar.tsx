'use client';

import React from 'react';
import { 
  Music, 
  Library, 
  Disc, 
  Users, 
  Radio, 
  Heart
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const mainNav = [
    { id: 'library', label: 'Library', icon: Library },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'genres', label: 'Genres', icon: Radio },
  ];

  const subNav = [
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-[#000000]/20 p-5 select-none">
      {/* Brand logo like Spotify / macOS */}
      <div className="flex items-center gap-2.5 mb-8 pl-1">
        <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center shadow-sm">
          <Music size={13} className="text-black" />
        </div>
        <span className="font-bold text-sm tracking-tight text-white">Homelab Music</span>
      </div>

      {/* Navigation List */}
      <div className="flex-grow space-y-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-1 block mb-2">
            Main Menu
          </span>
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                    isActive 
                      ? 'text-white font-semibold' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} className={isActive ? 'text-emerald-500' : 'text-zinc-400'} />
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-1 block mb-2">
            Library
          </span>
          <nav className="space-y-0.5">
            {subNav.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                    isActive 
                      ? 'text-white font-semibold' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} className={isActive ? 'text-emerald-500' : 'text-zinc-400'} />
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Minimalist Profile section */}
      <div className="pt-4 flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">
          H
        </div>
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold text-zinc-300 truncate">Hritik Sharma</span>
          <span className="block text-[8px] text-zinc-500 truncate">hritik@logan.local</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
