import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Song, CreateSongInput, UpdateSongInput } from '@/types/song';
import { SongRepository } from './interface';

export class JsonSongRepository implements SongRepository {
  private filePath: string;
  private writeQueue = Promise.resolve();

  constructor(customFilePath?: string) {
    this.filePath = customFilePath || path.join(process.cwd(), 'storage', 'songs.json');
  }

  private async ensureStorage(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch {
      // Ignore if dir already exists
    }

    try {
      await fs.access(this.filePath);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2), 'utf-8');
      } else {
        throw error;
      }
    }
  }

  private async readData(): Promise<Song[]> {
    await this.ensureStorage();
    const content = await fs.readFile(this.filePath, 'utf-8');
    const songs: Song[] = JSON.parse(content || '[]');
    
    // Parse date strings back to Date objects
    return songs.map((song) => ({
      ...song,
      createdAt: new Date(song.createdAt),
      updatedAt: new Date(song.updatedAt),
    }));
  }

  private async writeData(songs: Song[]): Promise<void> {
    await this.ensureStorage();
    await fs.writeFile(this.filePath, JSON.stringify(songs, null, 2), 'utf-8');
  }

  private enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.writeQueue.then(operation);
    this.writeQueue = result.then(() => {}, () => {});
    return result;
  }

  public async findAll(): Promise<Song[]> {
    return this.readData();
  }

  public async findById(id: string): Promise<Song | null> {
    const songs = await this.readData();
    return songs.find((song) => song.id === id) || null;
  }

  public async findByHash(hash: string): Promise<Song | null> {
    const songs = await this.readData();
    return songs.find((song) => song.hash === hash) || null;
  }

  public async findByFilePath(filePath: string): Promise<Song | null> {
    const songs = await this.readData();
    return songs.find((song) => song.filePath === filePath) || null;
  }

  public async create(data: CreateSongInput): Promise<Song> {
    return this.enqueueWrite(async () => {
      const songs = await this.readData();
      const newSong: Song = {
        id: crypto.randomUUID(),
        hash: data.hash,
        title: data.title,
        artist: data.artist,
        album: data.album,
        genre: data.genre ?? null,
        duration: data.duration ?? null,
        year: data.year ?? null,
        track: data.track ?? null,
        disc: data.disc ?? null,
        mimeType: data.mimeType,
        size: data.size,
        filePath: data.filePath,
        fileName: data.fileName,
        lyrics: data.lyrics ?? null,
        syncLyrics: data.syncLyrics ?? null,
        liked: data.liked ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      songs.push(newSong);
      await this.writeData(songs);
      return newSong;
    });
  }

  public async update(id: string, data: UpdateSongInput): Promise<Song> {
    return this.enqueueWrite(async () => {
      const songs = await this.readData();
      const songIndex = songs.findIndex((s) => s.id === id);
      if (songIndex === -1) {
        throw new Error(`Song with ID ${id} not found`);
      }

      const existingSong = songs[songIndex];
      const updatedSong: Song = {
        ...existingSong,
        ...data,
        updatedAt: new Date(),
      };

      songs[songIndex] = updatedSong;
      await this.writeData(songs);
      return updatedSong;
    });
  }

  public async delete(id: string): Promise<void> {
    return this.enqueueWrite(async () => {
      const songs = await this.readData();
      const updatedSongs = songs.filter((song) => song.id !== id);
      await this.writeData(updatedSongs);
    });
  }
}
