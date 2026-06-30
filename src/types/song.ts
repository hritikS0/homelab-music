export interface Song {
  id: string;
  title: string;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  duration: number;
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
  duration: number;
}

export interface UpdateSongInput {
  title?: string;
  originalFileName?: string;
  storedFileName?: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
  duration?: number;
}
