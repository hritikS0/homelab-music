/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path';
import { SongRepository } from '@/repositories/songs/interface';
import { IFileSystem } from './fileSystem.interface';
import { FileSystemService } from './fileSystemService';
import { MetadataService } from './metadataService';
import { HashService } from './hashService';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

export interface ScanSummary {
  scanned: number;
  imported: number;
  updated: number;
  removed: number;
  skipped: number;
  errors: number;
  durationMs: number;
  errorDetails?: string[];
}

export interface ScanStatus {
  isScanning: boolean;
  lastScan: string | null;
  totalSongs: number;
  lastDurationMs: number;
}

export class LibraryScannerService {
  private songRepository: SongRepository;
  private fileSystem: IFileSystem;
  private metadataService: MetadataService;
  private hashService: HashService;

  // Scanner State (in-memory singleton tracking)
  private static isScanning = false;
  private static lastScan: string | null = null;
  private static lastDurationMs = 0;

  constructor(
    songRepository: SongRepository,
    fileSystem: IFileSystem = new FileSystemService(),
    metadataService = new MetadataService(),
    hashService = new HashService()
  ) {
    this.songRepository = songRepository;
    this.fileSystem = fileSystem;
    this.metadataService = metadataService;
    this.hashService = hashService;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.mp3': return 'audio/mpeg';
      case '.flac': return 'audio/flac';
      case '.wav': return 'audio/wav';
      case '.m4a':
      case '.mp4': return 'audio/mp4';
      case '.aac': return 'audio/aac';
      case '.ogg': return 'audio/ogg';
      default: return 'audio/mpeg';
    }
  }

  public getStatus(totalSongsCount: number): ScanStatus {
    return {
      isScanning: LibraryScannerService.isScanning,
      lastScan: LibraryScannerService.lastScan,
      totalSongs: totalSongsCount,
      lastDurationMs: LibraryScannerService.lastDurationMs,
    };
  }

  public async scan(): Promise<ScanSummary> {
    if (LibraryScannerService.isScanning) {
      logger.info('Scan requested but a library scan is already in progress. Skipping duplicate scan.');
      return {
        scanned: 0,
        imported: 0,
        updated: 0,
        removed: 0,
        skipped: 0,
        errors: 0,
        durationMs: 0,
      };
    }

    LibraryScannerService.isScanning = true;
    logger.info('Scanner started');
    logger.info(`Scanning folder: ${env.UPLOAD_DIR}`);

    const startTime = Date.now();
    const errorDetails: string[] = [];
    const supportedExtensions = new Set(['.mp3', '.flac', '.wav', '.m4a', '.mp4', '.aac', '.ogg']);

    let scannedCount = 0;
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let removedCount = 0;
    let errorCount = 0;

    try {
      // 1. Walk directory recursively
      const allFiles = await this.fileSystem.walk(env.UPLOAD_DIR);
      
      // Filter for supported audio files
      const audioFiles = allFiles.filter((filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        return supportedExtensions.has(ext);
      });

      // 2. Fetch existing songs from database
      const existingSongs = await this.songRepository.findAll();
      const dbSongsByHash = new Map(existingSongs.map((s) => [s.hash, s]));
      const dbSongsByPath = new Map(existingSongs.map((s) => [s.filePath, s]));

      const scannedFilePaths = new Set<string>();
      const scannedHashes = new Set<string>();

      // 3. Process each found file
      for (const filePath of audioFiles) {
        scannedCount++;
        scannedFilePaths.add(filePath);

        try {
          // Get file details
          const stats = await this.fileSystem.stat(filePath);
          const fileBuffer = await this.fileSystem.readFile(filePath);
          const hash = this.hashService.calculateHash(fileBuffer);
          const fileName = path.basename(filePath);
          const mimeType = this.getMimeType(filePath);

          scannedHashes.add(hash);

          // Extract ID3 metadata
          const metadata = await this.metadataService.extractMetadata(filePath);

          // Check if song already exists in DB by hash
          const songByHash = dbSongsByHash.get(hash);
          if (songByHash) {
            // Check if file path has changed (renamed / moved)
            if (songByHash.filePath !== filePath) {
              await this.songRepository.update(songByHash.id, {
                filePath,
                fileName,
                ...metadata,
              });
              updatedCount++;
            } else {
              // Check if metadata has changed (e.g. edited tags or size)
              const hasMetadataChanged =
                songByHash.title !== metadata.title ||
                songByHash.artist !== metadata.artist ||
                songByHash.album !== metadata.album ||
                songByHash.genre !== metadata.genre ||
                songByHash.size !== stats.size;

              if (hasMetadataChanged) {
                await this.songRepository.update(songByHash.id, {
                  size: stats.size,
                  ...metadata,
                });
                updatedCount++;
              } else {
                skippedCount++;
              }
            }
          } else {
            // No matching hash. Check if filepath matches a DB entry (content changed)
            const songByPath = dbSongsByPath.get(filePath);
            if (songByPath) {
              await this.songRepository.update(songByPath.id, {
                hash,
                size: stats.size,
                ...metadata,
              });
              updatedCount++;
            } else {
              // Completely new song (not in DB by hash or path)
              await this.songRepository.create({
                hash,
                title: metadata.title,
                artist: metadata.artist,
                album: metadata.album,
                genre: metadata.genre,
                duration: metadata.duration,
                year: metadata.year,
                track: metadata.track,
                disc: metadata.disc,
                lyrics: metadata.lyrics,
                syncLyrics: metadata.syncLyrics,
                mimeType,
                size: stats.size,
                filePath,
                fileName,
              });
              importedCount++;
            }
          }
        } catch (err: any) {
          errorCount++;
          const errMsg = `Failed to process ${filePath}: ${err.message || err}`;
          errorDetails.push(errMsg);
          logger.error(err, errMsg);
        }
      }

      // 4. Clean up missing songs from DB (filesystem deletes)
      for (const dbSong of existingSongs) {
        if (!scannedFilePaths.has(dbSong.filePath)) {
          // Path no longer exists on filesystem.
          await this.songRepository.delete(dbSong.id);
          removedCount++;
        }
      }

      const durationMs = Date.now() - startTime;
      LibraryScannerService.lastScan = new Date().toISOString();
      LibraryScannerService.lastDurationMs = durationMs;

      logger.info(`Found ${scannedCount} files`);
      logger.info(`Imported ${importedCount}`);
      logger.info(`Updated ${updatedCount}`);
      logger.info(`Removed ${removedCount}`);
      logger.info(`Skipped ${skippedCount}`);
      logger.info(`Completed in ${(durationMs / 1000).toFixed(2)}s`);

      return {
        scanned: scannedCount,
        imported: importedCount,
        updated: updatedCount,
        removed: removedCount,
        skipped: skippedCount,
        errors: errorCount,
        durationMs,
        errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
      };
    } finally {
      LibraryScannerService.isScanning = false;
    }
  }
}
export default LibraryScannerService;
