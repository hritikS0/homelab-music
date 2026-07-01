/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Song } from '@/types/song';
import { SongRepository } from '@/repositories/songs/interface';
import { env } from '@/config/env';
import { AppError } from '@/utils/appError';
import { logger } from '@/config/logger';

export class SongService {
  private songRepository: SongRepository;

  constructor(songRepository: SongRepository) {
    this.songRepository = songRepository;
  }

  public async getSongs(): Promise<Song[]> {
    return this.songRepository.findAll();
  }

  public async getSongById(id: string): Promise<Song | null> {
    return this.songRepository.findById(id);
  }

  public async uploadSong(file: File): Promise<Song> {
    console.log('[UPLOAD START]');
    logger.info('Request received');

    try {
      console.log('↓\nValidating file...');

      if (!file) {
        throw AppError.badRequest('No file selected.');
      }

      logger.info(`Filename: ${file.name || 'unknown'}`);
      logger.info(`File size: ${file.size} bytes`);
      logger.info(`MIME type: ${file.type || 'unknown'}`);
      logger.info(`Upload directory: ${env.UPLOAD_DIR}`);

      if (!file.type || !file.type.startsWith('audio/')) {
        throw AppError.badRequest('Unsupported MIME type.');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw AppError.badRequest('Maximum upload size exceeded.');
      }

      // Verify and create upload directory
      try {
        await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
      } catch (err: any) {
        logger.error(err, 'Failed to create/access upload directory');
        throw AppError.internal('Missing upload directory.');
      }

      const originalFileName = file.name || 'unknown.mp3';
      let filePath = path.join(env.UPLOAD_DIR, originalFileName);

      // Prevent filename collisions
      try {
        await fs.access(filePath);
        const ext = path.extname(originalFileName);
        const base = path.basename(originalFileName, ext);
        filePath = path.join(env.UPLOAD_DIR, `${base}-${crypto.randomUUID().substring(0, 8)}${ext}`);
      } catch {
        // Safe to write to original name
      }

      console.log('↓\nSaving file...');
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
      } catch (err: any) {
        logger.error(err, 'Failed to save file to disk');
        throw AppError.internal(`Failed to save file to disk: ${err.message}`);
      }

      // Trigger Library Scanner
      console.log('↓\nTriggering Library Scanner...');
      const { libraryScanner } = await import('@/services/library/index');
      const scanSummary = await libraryScanner.scan();
      logger.info({ scanSummary }, 'Library scan completed after upload');

      console.log('↓\nRetrieving database record...');
      const song = await this.songRepository.findByFilePath(filePath);
      if (!song) {
        throw AppError.internal('Library scanner failed to index the uploaded file.');
      }

      console.log('↓\nUpload complete.');
      logger.info('Upload completed');
      return song;
    } catch (error: any) {
      console.log('↓\n[UPLOAD FAILED]');
      console.log('↓');
      console.log(error.message || 'Unknown error');
      console.log('↓');
      console.log(error.stack || 'No stack trace');
      throw error;
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

  public async toggleFavorite(id: string): Promise<Song> {
    const song = await this.songRepository.findById(id);
    if (!song) {
      throw AppError.notFound('Song not found');
    }

    return this.songRepository.update(id, { liked: !song.liked });
  }
}

export default SongService;
