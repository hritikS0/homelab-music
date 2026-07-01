'use client';

import React from 'react';
import { 
  Music, 
  Library, 
  Disc, 
  Users, 
  Radio, 
  Heart,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, onMobileClose }) => {
  const [logoError, setLogoError] = React.useState(false);

  const mainNav = [
    { id: 'library', label: 'Library', icon: Library },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'genres', label: 'Genres', icon: Radio },
  ];

  const subNav = [
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    onMobileClose();
  };

  const content = (
    <>
      <div className="flex items-center gap-2.5 mb-8 pl-1">
        {!logoError ? (
          <img 
            src="/logo.png" 
            alt="Homelab Music Logo" 
            className="h-6 w-6 object-contain rounded shadow-sm"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center shadow-sm">
            <Music size={13} className="text-black" />
          </div>
        )}
        <span className="font-bold text-sm tracking-tight text-white">Homelab Music</span>
      </div>

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
                  onClick={() => handleNav(item.id)}
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
                  onClick={() => handleNav(item.id)}
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

      <div className="pt-4 flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">
          H
        </div>
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold text-zinc-300 truncate">Hritik Sharma</span>
          <span className="block text-[8px] text-zinc-500 truncate">hritik@logan.local</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-56 bg-[#09090B] p-5 select-none transform transition-transform duration-200 lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={onMobileClose}
          className="absolute top-5 right-4 p-1 rounded text-zinc-400 hover:text-white"
        >
          <X size={16} />
        </button>
        {content}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col h-full bg-[#000000]/20 p-5 select-none">
        {content}
      </aside>
    </>
  );
};

export default Sidebar;
