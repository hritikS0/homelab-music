import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseFile } from 'music-metadata';
import { Song } from '@/types/song';
import { SongRepository } from '@/repositories/songs/interface';
import { env } from '@/config/env';
import { AppError } from '@/utils/appError';

export class SongService {
  private songRepository: SongRepository;

  constructor(songRepository: SongRepository) {
    this.songRepository = songRepository;
  }

  public async getSongs(): Promise<Pick<Song, 'id' | 'title' | 'duration' | 'size'>[]> {
    const songs = await this.songRepository.findAll();
    return songs.map((song) => ({
      id: song.id,
      title: song.title,
      duration: song.duration,
      size: song.size,
    }));
  }

  public async getSongById(id: string): Promise<Song | null> {
    return this.songRepository.findById(id);
  }

  public async uploadSong(file: File): Promise<Song> {
    if (!file) {
      throw AppError.badRequest('No file provided');
    }

    if (!file.type || !file.type.startsWith('audio/')) {
      throw AppError.badRequest('Only audio files are allowed');
    }

    const originalFileName = file.name || 'unknown.mp3';
    const extension = path.extname(originalFileName) || '.mp3';
    const storedFileName = `${crypto.randomUUID()}${extension}`;

    try {
      await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      throw AppError.internal('Failed to create upload directory', [error]);
    }

    const filePath = path.join(env.UPLOAD_DIR, storedFileName);

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
    } catch (error) {
      throw AppError.internal('Failed to save file to disk', [error]);
    }

    let title = originalFileName;
    let duration = 0;

    try {
      const metadata = await parseFile(filePath);
      if (metadata.common && metadata.common.title) {
        title = metadata.common.title;
      }
      if (metadata.format && typeof metadata.format.duration === 'number') {
        duration = metadata.format.duration;
      }
    } catch {
      // Fallback to original file name if parsing fails
    }

    try {
      const song = await this.songRepository.create({
        title,
        originalFileName,
        storedFileName,
        filePath,
        mimeType: file.type || 'audio/mpeg',
        size: file.size,
        duration,
      });
      return song;
    } catch (error) {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore
      }
      throw AppError.internal('Failed to save song record to database', [error]);
    }
  }

  public async deleteSong(id: string): Promise<void> {
    const song = await this.songRepository.findById(id);
    if (!song) {
      throw AppError.notFound('Song not found');
    }

    await this.songRepository.delete(id);

    try {
      await fs.unlink(song.filePath);
    } catch {
      // Ignore file delete failure if file is already missing
    }
  }
}

export default SongService;
