'use client';

import { useState, useEffect, useRef } from 'react';

interface Song {
  id: string;
  title: string;
  duration: number;
  size: number;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/v1/songs');
      if (!res.ok) throw new Error('Failed to fetch songs');
      const data = await res.json();
      setSongs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading library');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSongs();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/songs/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      await fetchSongs();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload song');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      const res = await fetch(`/api/v1/songs/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete song');
      if (activeSong?.id === id) {
        setActiveSong(null);
      }
      await fetchSongs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete song');
    }
  };

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-6 sm:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-2xl w-full mx-auto flex flex-col flex-grow z-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Homelab Music
            </h1>
            <p className="text-sm text-zinc-400 mt-1">MVP Phase 1 Testing Server</p>
          </div>

          <div>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              id="song-upload-input"
              onChange={handleUpload}
              ref={fileInputRef}
              disabled={uploading}
            />
            <label
              htmlFor="song-upload-input"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer shadow-md ${
                uploading
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 border border-indigo-500/50 hover:shadow-indigo-500/10 hover:shadow-lg'
              }`}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload MP3'
              )}
            </label>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-start justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400/70 hover:text-red-400 font-bold ml-2">
              &times;
            </button>
          </div>
        )}

        <section className="flex-grow">
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">Library</h2>
          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800/80 rounded-xl py-16 text-center text-zinc-500">
              <svg className="w-12 h-12 text-zinc-600 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0v15m0-15l-10.5 3m0 0v15m0-15l10.5 3m-10.5 3h10.5M4 19h16" />
              </svg>
              <p className="text-zinc-400 font-medium">No songs uploaded yet</p>
              <p className="text-xs text-zinc-500 mt-1">Upload your first MP3 to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => {
                const isActive = activeSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/80 hover:border-zinc-700/50'
                    }`}
                  >
                    <div className="flex-grow min-w-0 pr-4">
                      <p className={`font-medium truncate ${isActive ? 'text-indigo-400' : 'text-zinc-200'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                        <span>{formatDuration(song.duration)}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span>{formatSize(song.size)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setActiveSong(song)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                          isActive
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
                        }`}
                      >
                        Play
                      </button>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/30 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all"
                        title="Delete song"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {activeSong && (
          <footer className="mt-8 border-t border-zinc-800/80 pt-6 pb-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                  <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Now Playing</p>
                  <p className="font-semibold text-zinc-200 truncate mt-0.5">{activeSong.title}</p>
                </div>
                <button
                  onClick={() => setActiveSong(null)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  &times;
                </button>
              </div>
              <div className="w-full">
                <audio
                  key={activeSong.id}
                  controls
                  autoPlay
                  src={`/api/v1/stream/${activeSong.id}`}
                  className="w-full h-10 accent-indigo-500"
                />
              </div>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
