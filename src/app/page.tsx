/* eslint-disable no-console, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useRef } from 'react';

interface Song {
  id: string;
  title: string;
  duration: number | null;
  size: number;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug Panel and Status States
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'failed'>('idle');
  const [currentRequest, setCurrentRequest] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);

  // Network Layer Wrapper
  const safeFetch = async (url: string, options?: RequestInit): Promise<any> => {
    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (err: any) {
      console.error('Network request failed');
      console.error('JavaScript Error:', err.message || err);
      console.error('Stack Trace:', err.stack);
      throw new Error('Network request failed');
    }

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (err: any) {
        console.error('Invalid server response');
        console.error('JavaScript Error:', err.message || err);
        console.error('Stack Trace:', err.stack);
        throw new Error('Invalid server response');
      }
    } else {
      try {
        const text = await response.text();
        data = text ? { message: text } : {};
      } catch {
        data = {};
      }
    }

    if (!response.ok) {
      const errorMsg = data?.error?.details || data?.message || response.statusText || 'Unknown error';
      const errorStr = `HTTP ${response.status}: ${errorMsg}`;
      
      console.error('HTTP Status:', response.status);
      console.error('Response Body:', data);
      const errObj = new Error(errorStr);
      console.error('JavaScript Error:', errObj.message);
      console.error('Stack Trace:', errObj.stack);

      throw errObj;
    }

    return data;
  };

  // XMLHttpRequest Upload Wrapper for Progress and Console Tracking
  const xhrUpload = (file: File, onProgress: (pct: number) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/v1/songs/upload');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        let data: any;
        const contentType = xhr.getResponseHeader('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            data = JSON.parse(xhr.responseText);
          } catch (err: any) {
            console.error('Invalid server response');
            console.error('JavaScript Error:', err.message);
            console.error('Stack Trace:', err.stack);
            reject(new Error('Invalid server response'));
            return;
          }
        } else {
          data = xhr.responseText ? { message: xhr.responseText } : {};
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          const errorMsg = data?.error?.details || data?.message || xhr.statusText || 'Unknown error';
          const errorStr = `HTTP ${xhr.status}: ${errorMsg}`;
          
          console.error('HTTP Status:', xhr.status);
          console.error('Response Body:', data);
          const errObj = new Error(errorStr);
          console.error('JavaScript Error:', errObj.message);
          console.error('Stack Trace:', errObj.stack);
          
          reject(errObj);
        }
      };

      xhr.onerror = () => {
        const errObj = new Error('Network request failed');
        console.error('Network request failed');
        console.error('JavaScript Error:', errObj.message);
        reject(errObj);
      };

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  };

  const fetchSongs = async () => {
    try {
      const data = await safeFetch('/api/v1/songs');
      setSongs(data);
    } catch (err: any) {
      setError(err.message || 'Error loading library');
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
    setUploadStatus('uploading');
    setUploading(true);
    setError(null);
    setCurrentError(null);
    setCurrentResponse(null);
    setCurrentRequest(`POST /api/v1/songs/upload\nPayload: File "${file.name}" (${formatSize(file.size)}, ${file.type || 'unknown MIME'})`);
    setCurrentProgress('Starting upload...');

    try {
      const data = await xhrUpload(file, (pct) => {
        setCurrentProgress(`Uploading: ${pct}%`);
      });

      setCurrentProgress('Upload complete.');
      setUploadStatus('success');
      setCurrentResponse(JSON.stringify(data, null, 2));

      await fetchSongs();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setUploadStatus('failed');
      const msg = `Failed to upload: ${err.message}`;
      setError(msg);
      setCurrentError(`${err.message}\nStack: ${err.stack || ''}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      await safeFetch(`/api/v1/songs/${id}`, {
        method: 'DELETE',
      });
      if (activeSong?.id === id) {
        setActiveSong(null);
      }
      await fetchSongs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete song');
    }
  };

  const formatDuration = (secs: number | null) => {
    if (secs === null || isNaN(secs) || secs === 0) return '0:00';
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

        {/* Upload Status Overlay Bar */}
        {uploadStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg border text-sm flex items-center justify-between transition-all ${
            uploadStatus === 'uploading' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
            uploadStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {uploadStatus === 'uploading' && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span className="font-medium">
                {uploadStatus === 'uploading' ? 'Uploading...' :
                 uploadStatus === 'success' ? 'Success! Upload completed.' :
                 'Upload Failed'}
              </span>
            </div>
            <button onClick={() => setUploadStatus('idle')} className="font-bold opacity-70 hover:opacity-100">
              &times;
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-start justify-between">
            <span className="whitespace-pre-wrap">{error}</span>
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

        {/* Development Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 border border-zinc-800 bg-zinc-900/80 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                Dev Debug Panel
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-zinc-300">
              <div className="space-y-3">
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

                <div>
                  <span className="text-zinc-500 block mb-1">Current Request</span>
                  <pre className="bg-zinc-950 p-2.5 rounded border border-zinc-800/60 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                    {currentRequest || 'N/A'}
                  </pre>
                </div>
              </div>

              <div className="space-y-3">
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
          </div>
        )}

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
