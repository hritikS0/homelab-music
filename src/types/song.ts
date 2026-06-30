export interface Song {
  id: string;
  title: string;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSongInput {
  title: string;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  duration: number | null;
}

export interface UpdateSongInput {
  title?: string;
  originalFileName?: string;
  storedFileName?: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
  duration?: number | null;
}
