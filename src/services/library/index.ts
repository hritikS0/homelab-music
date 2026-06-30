import { songRepository } from '@/repositories/songs/index';
import { LibraryScannerService } from './libraryScannerService';
import { logger } from '@/config/logger';

// Instantiate the singleton scanner
export const libraryScanner = new LibraryScannerService(songRepository);

// Trigger a background startup library scan
logger.info('API server initialized. Triggering automatic startup library scan...');
libraryScanner.scan().catch((err) => {
  logger.error(err, 'Startup library scan failed');
});

export * from './libraryScannerService';
export * from './fileSystem.interface';
export * from './fileSystemService';
export * from './metadataService';
export * from './hashService';
