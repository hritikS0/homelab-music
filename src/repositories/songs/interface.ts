import { Song, CreateSongInput, UpdateSongInput } from '@/types/song';

export interface SongRepository {
  findAll(): Promise<Song[]>;
  findById(id: string): Promise<Song | null>;
  create(song: CreateSongInput): Promise<Song>;
  delete(id: string): Promise<void>;
  update(id: string, data: UpdateSongInput): Promise<Song>;
}
