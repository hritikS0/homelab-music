/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useMusicPlayer } from '@/providers/MusicPlayerProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomPlayer } from '@/components/music/BottomPlayer';
import { SongList } from '@/components/music/SongList';
import { AlbumCard } from '@/components/music/AlbumCard';
import { EmptyLibrary } from '@/components/music/EmptyLibrary';
import { FullscreenPlayer } from '@/components/music/FullscreenPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { Music } from 'lucide-react';

export default function Home() {
  const {
    songs,
    error,
    setError,
    isFullscreenOpen,
    setIsFullscreenOpen
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');

  // Search filtering
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.album && song.album.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Grouping logic for Artists, Albums, and Genres
  const artistsMap = new Map<string, typeof songs>();
  songs.forEach((song) => {
    const artistName = song.artist || 'Unknown Artist';
    if (!artistsMap.has(artistName)) {
      artistsMap.set(artistName, []);
    }
    artistsMap.get(artistName)!.push(song);
  });
  const uniqueArtists = Array.from(artistsMap.keys()).sort();

  const albumsMap = new Map<string, { albumName: string; artistName: string; songs: typeof songs }>();
  songs.forEach((song) => {
    const albumName = song.album || 'Unknown Album';
    const artistName = song.artist || 'Unknown Artist';
    const key = `${albumName} - ${artistName}`;
    if (!albumsMap.has(key)) {
      albumsMap.set(key, { albumName, artistName, songs: [] });
    }
    albumsMap.get(key)!.songs.push(song);
  });
  const uniqueAlbums = Array.from(albumsMap.values()).sort((a, b) => a.albumName.localeCompare(b.albumName));

  const genresMap = new Map<string, typeof songs>();
  songs.forEach((song) => {
    const genreName = song.genre || 'Unknown Genre';
    if (!genresMap.has(genreName)) {
      genresMap.set(genreName, []);
    }
    genresMap.get(genreName)!.push(song);
  });
  const uniqueGenres = Array.from(genresMap.keys()).sort();

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
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Songs
                </h2>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    Showing results for &quot;{searchTerm}&quot; &bull; Clear Filter
                  </button>
                )}
              </div>
              <SongList songs={filteredSongs} />
            </div>
          </div>
        );

      case 'albums':
        if (uniqueAlbums.length === 0) {
          return (
            <div className="py-20 text-center text-xs text-zinc-500">
              No albums grouped yet.
            </div>
          );
        }
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6 pb-32">
            {uniqueAlbums.map((album) => {
              const firstSong = album.songs[0];
              return (
                <div
                  key={`${album.albumName}-${album.artistName}`}
                  onClick={() => {
                    setSearchTerm(album.albumName === 'Unknown Album' ? '' : album.albumName);
                    setActiveTab('library');
                  }}
                  className="flex flex-col gap-2.5 cursor-pointer group select-none"
                >
                  <div className="relative aspect-square w-full rounded-md bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-800/40 shadow-sm group-hover:border-zinc-700 transition-all">
                    {firstSong ? (
                      <img
                        src={`/api/v1/songs/artwork/${firstSong.id}`}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-250 group-hover:scale-102"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                    <div className="h-full w-full flex items-center justify-center bg-zinc-950/20">
                      <Music size={22} className="text-zinc-600 group-hover:text-zinc-500" />
                    </div>
                  </div>
                  <div className="min-w-0 px-0.5">
                    <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {album.albumName}
                    </span>
                    <span className="block text-[10px] text-zinc-500 truncate mt-0.5 font-normal">
                      {album.artistName} • {album.songs.length} {album.songs.length === 1 ? 'track' : 'tracks'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'artists':
        if (uniqueArtists.length === 0) {
          return (
            <div className="py-20 text-center text-xs text-zinc-500">
              No artists parsed yet.
            </div>
          );
        }
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6 pb-32">
            {uniqueArtists.map((artist) => {
              const artistSongs = artistsMap.get(artist) || [];
              const firstSong = artistSongs[0];
              return (
                <div
                  key={artist}
                  onClick={() => {
                    setSearchTerm(artist === 'Unknown Artist' ? '' : artist);
                    setActiveTab('library');
                  }}
                  className="flex flex-col items-center text-center gap-3 cursor-pointer group select-none"
                >
                  <div className="relative aspect-square w-24 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800/40 overflow-hidden group-hover:border-zinc-700 transition-all shadow-sm">
                    {firstSong ? (
                      <img
                        src={`/api/v1/songs/artwork/${firstSong.id}`}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-250 group-hover:scale-102"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                    <div className="h-full w-full flex items-center justify-center bg-zinc-950/20">
                      <Music size={18} className="text-zinc-600 group-hover:text-zinc-500" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {artist}
                    </span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5 font-normal">
                      {artistSongs.length} {artistSongs.length === 1 ? 'track' : 'tracks'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'genres':
        if (uniqueGenres.length === 0) {
          return (
            <div className="py-20 text-center text-xs text-zinc-500">
              No genres indexed yet.
            </div>
          );
        }
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-32">
            {uniqueGenres.map((genre) => {
              const genreSongs = genresMap.get(genre) || [];
              return (
                <div
                  key={genre}
                  onClick={() => {
                    setSearchTerm(genre === 'Unknown Genre' ? '' : genre);
                    setActiveTab('library');
                  }}
                  className="bg-[#18181B]/40 hover:bg-[#18181B]/80 border border-zinc-850 hover:border-zinc-750 p-4 rounded-lg flex items-center justify-between cursor-pointer select-none transition-all duration-150 group"
                >
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {genre}
                    </span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5 font-normal">
                      {genreSongs.length} {genreSongs.length === 1 ? 'track' : 'tracks'}
                    </span>
                  </div>
                </div>
              );
            })}
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

      {/* Fullscreen Overlay Apple Music Player */}
      <AnimatePresence>
        {isFullscreenOpen && (
          <FullscreenPlayer
            isOpen={isFullscreenOpen}
            onClose={() => setIsFullscreenOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
