/* eslint-disable no-console, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

import { useState } from 'react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { NowPlaying } from '@/components/music/NowPlaying';
import { BottomPlayer } from '@/components/music/BottomPlayer';
import { SongList } from '@/components/music/SongList';
import { AlbumCard } from '@/components/music/AlbumCard';
import { EmptyLibrary } from '@/components/music/EmptyLibrary';
import { StatCard } from '@/components/ui/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Server, FolderSync, Clock, HardDrive } from 'lucide-react';

export default function Home() {
  const {
    songs,
    uploadStatus,
    currentProgress,
    currentRequest,
    currentResponse,
    currentError,
    error,
    setError
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');

  // Search filtering
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const totalTracks = songs.length;
  
  const totalSizeBytes = songs.reduce((acc, song) => acc + song.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  const totalSize = formatSize(totalSizeBytes);

  const totalDurationSecs = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const formatTotalDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };
  const totalDuration = formatTotalDuration(totalDurationSecs);

  // Tab views
  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        if (songs.length === 0) {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-12"
            >
              <EmptyLibrary />
            </motion.div>
          );
        }

        return (
          <div className="space-y-8 pb-32">
            {/* Stats section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <StatCard title="Total Tracks" value={totalTracks} icon={Music} glowColor="indigo" />
              <StatCard title="Total Size" value={totalSize} icon={HardDrive} glowColor="purple" />
              <StatCard title="Total Runtime" value={totalDuration} icon={Clock} glowColor="blue" />
            </motion.div>

            {/* Recently Added Section (Horizontal grid) */}
            {songs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 pl-1">
                  Recently Uploaded
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
                  {songs.slice(0, 5).map((song, idx) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                    >
                      <AlbumCard song={song} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Song List */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 pl-1">
                Library List ({filteredSongs.length})
              </h3>
              <SongList songs={filteredSongs} />
            </div>
          </div>
        );

      case 'albums':
        return (
          <div className="py-20 text-center">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto mb-4">
              <FolderSync size={16} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">No albums available</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Homelab Music groups tracks dynamically when album tags are parsed in Phase 2.
            </p>
          </div>
        );

      case 'artists':
        return (
          <div className="py-20 text-center">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto mb-4">
              <Server size={16} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">No artists active</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Upload files containing valid artist ID3 metadata tags.
            </p>
          </div>
        );

      case 'genres':
        return (
          <div className="py-20 text-center">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto mb-4">
              <Music size={16} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">No genres categorized</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Upload audio tracks configured with primary genre metadata tags.
            </p>
          </div>
        );

      case 'favorites':
        return (
          <div className="py-20 text-center">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto mb-4">
              <Music size={16} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">No favorites yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Click the heart icon on active songs to add them to your collection.
            </p>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 max-w-xl pb-32">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 pl-1">
                Server Settings
              </h3>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-md p-5 space-y-4">
                <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-3">
                  <span className="font-semibold text-zinc-400">Environment</span>
                  <span className="font-mono text-zinc-200 uppercase bg-zinc-900 px-2 py-0.5 rounded text-[10px] border border-zinc-800">
                    {process.env.NODE_ENV || 'production'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-3">
                  <span className="font-semibold text-zinc-400">Storage Target</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded text-[10px] border border-zinc-800">
                    JSON database (/storage/songs.json)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-3">
                  <span className="font-semibold text-zinc-400">Upload Path</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded text-[10px] border border-zinc-800">
                    /home/hritik/homelab-music-uploads
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-400">Application Port</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded text-[10px] border border-zinc-800">
                    3000
                  </span>
                </div>
              </div>
            </div>

            {/* Development Debug Panel */}
            {process.env.NODE_ENV === 'development' && (
              <div>
                <div className="flex items-center gap-2 mb-3 pl-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Dev Debug Panel
                  </h4>
                </div>
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-md p-5 text-[10px] font-mono text-zinc-300 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-zinc-500 block mb-1">Upload Status</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        uploadStatus === 'idle' ? 'bg-zinc-800 text-zinc-400' :
                        uploadStatus === 'uploading' ? 'bg-indigo-500/20 text-indigo-400' :
                        uploadStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {uploadStatus.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block mb-1">Current Progress</span>
                      <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800/60 max-h-24 overflow-y-auto">
                        {currentProgress || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-1">Current Request</span>
                    <pre className="bg-zinc-950 p-2.5 rounded border border-zinc-800/60 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                      {currentRequest || 'N/A'}
                    </pre>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-1">Current Error</span>
                    <pre className={`bg-zinc-950 p-2.5 rounded border max-h-40 overflow-y-auto ${
                      currentError ? 'border-red-900/50 text-red-400' : 'border-zinc-800/60 text-zinc-500'
                    }`}>
                      {currentError || 'None'}
                    </pre>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-1">Current Response</span>
                    <pre className="bg-zinc-950 p-2.5 rounded border border-zinc-800/60 max-h-40 overflow-y-auto">
                      {currentResponse || 'N/A'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-zinc-200 select-none bg-transparent">
      {/* Sidebar (Left) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Stream (Center) */}
      <div className="flex-grow flex flex-col h-full overflow-hidden bg-transparent">
        {/* Top Header Bar */}
        <Topbar onSearch={setSearchTerm} />

        {/* Global Error Banner */}
        {error && (
          <div className="mx-8 mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <span className="font-semibold">{error}</span>
            <button onClick={() => setError(null)} className="font-bold opacity-70 hover:opacity-100">
              &times;
            </button>
          </div>
        )}

        {/* Content Viewer (Scrollable) */}
        <main className="flex-grow overflow-y-auto px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Now Playing Widget (Right Panel) */}
      <NowPlaying />

      {/* Floating Interactive Music Player (Bottom Pinned) */}
      <BottomPlayer />
    </div>
  );
}
