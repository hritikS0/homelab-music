/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseFile } from 'music-metadata';
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
      const extension = path.extname(originalFileName) || '.mp3';
      const storedFileName = `${crypto.randomUUID()}${extension}`;
      const filePath = path.join(env.UPLOAD_DIR, storedFileName);

      console.log('↓\nSaving file...');
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
      } catch (err: any) {
        logger.error(err, 'Failed to save file to disk');
        throw AppError.internal(`Failed to save file to disk: ${err.message}`);
      }

      console.log('↓\nReading metadata...');
      logger.info('Metadata extraction started');
      let title = originalFileName;
      let duration: number | null = null;

      try {
        const metadata = await parseFile(filePath);
        if (metadata.common && metadata.common.title) {
          title = metadata.common.title;
        }
        if (metadata.format && typeof metadata.format.duration === 'number') {
          duration = metadata.format.duration;
        }
        logger.info('Metadata extraction completed');
      } catch (err: any) {
        // Continue upload, fallback title/duration
        logger.warn(err, 'Metadata extraction failed.');
        console.log('Metadata extraction failed. Continuing with fallback values.');
      }

      console.log('↓\nSaving database...');
      logger.info('Database save started');
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
        logger.info('Database save completed');
        console.log('↓\nUpload complete.');
        logger.info('Upload completed');
        return song;
      } catch (err: any) {
        // Cleanup file if DB save fails
        try {
          await fs.unlink(filePath);
        } catch {
          // Ignore
        }
        logger.error(err, 'Failed to save song record to database');
        throw AppError.internal(`Failed to save song record to database: ${err.message}`);
      }
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
}

export default SongService;
