'use client';

import React from 'react';
import { 
  Music, 
  Library, 
  Disc, 
  Users, 
  Radio, 
  Heart, 
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full border-r border-zinc-900 bg-zinc-950/20 p-6 z-20">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-10 pl-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Music size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white block">Homelab Music</span>
          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest block">v0.1.0</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-2 block mb-3">
            Discover
          </span>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group relative ${
                    isActive 
                      ? 'text-white bg-indigo-950/20 border border-indigo-500/20' 
                      : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  {/* Glowing backdrop indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 rounded-xl bg-indigo-500/5 pointer-events-none"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <span className="flex items-center gap-3 relative z-10">
                    <Icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`} />
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/80 relative z-10" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-2 block mb-3">
            Personal
          </span>
          <nav className="space-y-1">
            {subNav.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group relative ${
                    isActive 
                      ? 'text-white bg-indigo-950/20 border border-indigo-500/20' 
                      : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 rounded-xl bg-indigo-500/5 pointer-events-none"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <span className="flex items-center gap-3 relative z-10">
                    <Icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`} />
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/80 relative z-10" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="pt-6 border-t border-zinc-900 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white border border-white/10 shadow-md">
          H
        </div>
        <div className="min-w-0 flex-grow">
          <span className="block text-[11px] font-semibold text-zinc-200 truncate">Hritik Sharma</span>
          <span className="block text-[9px] text-zinc-500 truncate">hritik@logan.local</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
