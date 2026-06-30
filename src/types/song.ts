export interface Song {
  id: string;
  hash: string;
  title: string;
  artist: string;
  album: string;
  genre: string | null;
  duration: number | null;
  year: number | null;
  track: number | null;
  disc: number | null;
  mimeType: string;
  size: number;
  filePath: string;
  fileName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSongInput {
  hash: string;
  title: string;
  artist: string;
  album: string;
  genre?: string | null;
  duration?: number | null;
  year?: number | null;
  track?: number | null;
  disc?: number | null;
  mimeType: string;
  size: number;
  filePath: string;
  fileName: string;
}

export interface UpdateSongInput {
  hash?: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string | null;
  duration?: number | null;
  year?: number | null;
  track?: number | null;
  disc?: number | null;
  mimeType?: string;
  size?: number;
  filePath?: string;
  fileName?: string;
}
