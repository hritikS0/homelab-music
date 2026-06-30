import { SongRepository } from './interface';
import { JsonSongRepository } from './jsonRepository';

// Singleton instance of the repository
export const songRepository: SongRepository = new JsonSongRepository();

export * from './interface';
export * from './jsonRepository';
