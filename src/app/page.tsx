/* eslint-disable no-console, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

import { useState } from 'react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomPlayer } from '@/components/music/BottomPlayer';
import { SongList } from '@/components/music/SongList';
import { AlbumCard } from '@/components/music/AlbumCard';
import { EmptyLibrary } from '@/components/music/EmptyLibrary';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const {
    songs,
    error,
    setError
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');

  // Search filtering
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tab views
  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        if (songs.length === 0) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="py-12"
            >
              <EmptyLibrary />
            </motion.div>
          );
        }

        return (
          <div className="space-y-10 pb-32">
            {/* Recently Uploaded Grid */}
            {songs.length > 0 && (
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-4 px-1">
                  Recently Played
                </h2>
                <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin">
                  {songs.slice(0, 5).map((song) => (
                    <AlbumCard key={song.id} song={song} />
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Song List */}
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-4 px-1">
                Songs
              </h2>
              <SongList songs={filteredSongs} />
            </div>
          </div>
        );

      case 'albums':
        return (
          <div className="py-20 text-center text-xs text-zinc-500">
            No albums grouped yet.
          </div>
        );

      case 'artists':
        return (
          <div className="py-20 text-center text-xs text-zinc-500">
            No artists parsed yet.
          </div>
        );

      case 'genres':
        return (
          <div className="py-20 text-center text-xs text-zinc-500">
            No genres indexed yet.
          </div>
        );

      case 'favorites':
        return (
          <div className="py-20 text-center text-xs text-zinc-500">
            No favorite tracks tagged yet.
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 max-w-md text-xs text-zinc-400">
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 mb-1.5">Music Storage Directory</h3>
              <p className="font-mono text-[10px] text-zinc-500 bg-zinc-900/30 p-2.5 rounded border border-zinc-800/20 w-fit">
                /home/hritik/homelab-music-uploads
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 mb-1.5">Indexed Target</h3>
              <p className="font-mono text-[10px] text-zinc-500 bg-zinc-900/30 p-2.5 rounded border border-zinc-800/20 w-fit">
                JSON database file (storage/songs.json)
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-zinc-300 bg-[#09090B] font-sans">
      {/* Sidebar (Left) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area (Right) */}
      <div className="flex-grow flex flex-col h-full overflow-hidden bg-transparent">
        {/* Top Header Bar */}
        <Topbar onSearch={setSearchTerm} />

        {/* Global Error Banner */}
        {error && (
          <div className="mx-8 mt-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="font-bold opacity-60 hover:opacity-100">
              &times;
            </button>
          </div>
        )}

        {/* Main Content Pane (Scrollable) */}
        <main className="flex-grow overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Elegant Bottom Playback Bar */}
      <BottomPlayer />
    </div>
  );
}
