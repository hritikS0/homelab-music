/* eslint-disable no-console, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song } from '@/types/song';

interface MusicPlayerContextType {
  songs: Song[];
  activeSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  isShuffled: boolean;
  uploading: boolean;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'failed';
  currentRequest: string | null;
  currentResponse: string | null;
  currentError: string | null;
  currentProgress: string | null;
  error: string | null;

  // Scanner integrations
  isScanning: boolean;
  scanSummary: any | null;
  scanProgress: string | null;
  triggerScan: () => Promise<void>;
  checkScanStatus: () => Promise<void>;
  
  setActiveSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  seek: (time: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  handleUpload: (file: File) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  setUploadStatus: (status: 'idle' | 'uploading' | 'success' | 'failed') => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload progress and debug states
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'failed'>('idle');
  const [currentRequest, setCurrentRequest] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);

  // Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanSummary, setScanSummary] = useState<any | null>(null);
  const [scanProgress, setScanProgress] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ref handles to prevent infinite render loops in event handlers
  const songsRef = useRef<Song[]>([]);
  const activeSongRef = useRef<Song | null>(null);
  const isShuffledRef = useRef(false);
  const isLoopingRef = useRef(false);

  useEffect(() => { songsRef.current = songs; }, [songs]);
  useEffect(() => { activeSongRef.current = activeSong; }, [activeSong]);
  useEffect(() => { isShuffledRef.current = isShuffled; }, [isShuffled]);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);

  // Network Fetch Helper
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

  const fetchSongs = async () => {
    try {
      const data = await safeFetch('/api/v1/songs');
      setSongs(data);
    } catch (err: any) {
      setError(err.message || 'Error loading library');
    }
  };

  const checkScanStatus = async () => {
    try {
      const status = await safeFetch('/api/v1/library/status');
      setIsScanning(status.isScanning);
    } catch {
      // Ignore background check failure
    }
  };

  const triggerScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanSummary(null);
    setScanProgress('Scanning...');

    // Async simulated progression for visual elegance
    const progressStages = [
      { text: 'Scanning folder...', delay: 250 },
      { text: 'Reading audio files...', delay: 500 },
      { text: 'Importing metadata...', delay: 750 },
      { text: 'Updating library...', delay: 1000 },
    ];

    const stepPromises = progressStages.map((stage) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setScanProgress(stage.text);
          resolve();
        }, stage.delay);
      });
    });

    try {
      const apiPromise = safeFetch('/api/v1/library/scan', { method: 'POST' });
      const [apiResponse] = await Promise.all([apiPromise, ...stepPromises]);
      
      setScanProgress('Complete');
      setScanSummary(apiResponse.summary);
      await fetchSongs();
      
      // Clear progress indicator after delay
      setTimeout(() => {
        setScanProgress(null);
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Library scan failed');
      setScanProgress('Error');
    } finally {
      setIsScanning(false);
    }
  };

  const setActiveSong = (song: Song | null) => {
    setActiveSongState(song);
    if (song) {
      console.log('[MusicPlayer] Selected song:', song.title, '(ID:', song.id, ')');
      console.log('[MusicPlayer] Stream URL is:', `/api/v1/stream/${song.id}`);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          console.log('[MusicPlayer] Calling play() for newly selected song');
          audioRef.current.play().catch((err) => {
            console.error('[MusicPlayer] play() failed:', err);
            setIsPlaying(false);
          });
        }
      }, 50);
    } else {
      console.log('[MusicPlayer] Selected song set to null');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !activeSong) return;
    if (isPlaying) {
      console.log('[MusicPlayer] Calling pause()');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log('[MusicPlayer] Calling play()');
      audioRef.current.play().catch((err) => {
        console.error('[MusicPlayer] play() failed:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (v: number) => {
    const clampVolume = Math.max(0, Math.min(1, v));
    setVolumeState(clampVolume);
  };

  const playNext = () => {
    const currentSongs = songsRef.current;
    const currentSong = activeSongRef.current;
    if (currentSongs.length === 0) return;
    
    if (isShuffledRef.current) {
      const randomIndex = Math.floor(Math.random() * currentSongs.length);
      setActiveSong(currentSongs[randomIndex]);
      return;
    }

    const currentIndex = currentSong ? currentSongs.findIndex((s) => s.id === currentSong.id) : -1;
    const nextIndex = (currentIndex + 1) % currentSongs.length;
    setActiveSong(currentSongs[nextIndex]);
  };

  const playPrev = () => {
    const currentSongs = songsRef.current;
    const currentSong = activeSongRef.current;
    if (currentSongs.length === 0) return;
    
    if (isShuffledRef.current) {
      const randomIndex = Math.floor(Math.random() * currentSongs.length);
      setActiveSong(currentSongs[randomIndex]);
      return;
    }

    const currentIndex = currentSong ? currentSongs.findIndex((s) => s.id === currentSong.id) : -1;
    const prevIndex = (currentIndex - 1 + currentSongs.length) % currentSongs.length;
    setActiveSong(currentSongs[prevIndex]);
  };

  const toggleLoop = () => setIsLooping(!isLooping);
  const toggleShuffle = () => setIsShuffled(!isShuffled);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Refs for ended and queue control to bind strictly once
  const playNextRef = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    playNextRef.current = playNext;
  });

  // Upload handler via XHR for progress tracking
  const handleUpload = async (file: File): Promise<void> => {
    if (!file) return;
    setUploadStatus('uploading');
    setUploading(true);
    setError(null);
    setCurrentError(null);
    setCurrentResponse(null);
    setCurrentRequest(`POST /api/v1/songs/upload\nPayload: File "${file.name}" (${formatSize(file.size)}, ${file.type || 'unknown MIME'})`);
    setCurrentProgress('Starting upload...');

    const xhrUploadPromise = () => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/v1/songs/upload');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setCurrentProgress(`Uploading: ${pct}%`);
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

    try {
      const data = await xhrUploadPromise();
      setCurrentProgress('Upload complete.');
      setUploadStatus('success');
      setCurrentResponse(JSON.stringify(data, null, 2));
      await fetchSongs();
    } catch (err: any) {
      setUploadStatus('failed');
      const msg = `Failed to upload: ${err.message}`;
      setError(msg);
      setCurrentError(`${err.message}\nStack: ${err.stack || ''}`);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
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

  // Initialize Audio Object on mount strictly ONCE
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const onPlay = () => {
      console.log('[MusicPlayerEvent] onplay triggered');
      setIsPlaying(true);
    };
    const onPause = () => {
      console.log('[MusicPlayerEvent] onpause triggered');
      setIsPlaying(false);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      console.log('[MusicPlayerEvent] onloadedmetadata triggered. Duration:', audio.duration);
      setDuration(audio.duration || 0);
    };
    const onCanPlay = () => {
      console.log('[MusicPlayerEvent] oncanplay triggered');
    };
    const onError = (e: any) => {
      console.error('[MusicPlayerEvent] onerror triggered:', e);
    };
    const onEnded = () => {
      console.log('[MusicPlayerEvent] onended triggered');
      if (isLoopingRef.current) {
        console.log('[MusicPlayer] Loop active, restarting current song');
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        console.log('[MusicPlayer] Playing next song');
        if (playNextRef.current) {
          playNextRef.current();
        }
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    console.log('[MusicPlayer] Initializing Audio element and fetching songs list...');
    fetchSongs();
    checkScanStatus();

    return () => {
      console.log('[MusicPlayer] Cleaning up Audio element listeners...');
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Set source when active song changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (activeSong) {
      const wasPlaying = isPlaying;
      console.log('[MusicPlayer] Active song changed. Setting src to:', `/api/v1/stream/${activeSong.id}`);
      audioRef.current.src = `/api/v1/stream/${activeSong.id}`;
      audioRef.current.load();
      if (wasPlaying) {
        console.log('[MusicPlayer] wasPlaying is true, calling play()');
        audioRef.current.play().catch((err) => {
          console.error('[MusicPlayer] play() failed:', err);
          setIsPlaying(false);
        });
      }
    } else {
      console.log('[MusicPlayer] No active song. Pausing audio.');
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
    }
  }, [activeSong]);

  // Sync volume state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <MusicPlayerContext.Provider
      value={{
        songs,
        activeSong,
        isPlaying,
        volume,
        currentTime,
        duration,
        isLooping,
        isShuffled,
        uploading,
        uploadStatus,
        currentRequest,
        currentResponse,
        currentError,
        currentProgress,
        error,

        // Scanner integrations
        isScanning,
        scanSummary,
        scanProgress,
        triggerScan,
        checkScanStatus,
        
        setActiveSong,
        setIsPlaying,
        setVolume,
        setCurrentTime,
        seek,
        togglePlay,
        playNext,
        playPrev,
        toggleLoop,
        toggleShuffle,
        handleUpload,
        handleDelete,
        setError,
        setUploadStatus,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};
