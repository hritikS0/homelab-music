export interface FileStats {
  size: number;
  mtime: Date;
}

export interface IFileSystem {
  walk(dirPath: string): Promise<string[]>;
  stat(filePath: string): Promise<FileStats>;
  exists(filePath: string): Promise<boolean>;
  readFile(filePath: string): Promise<Buffer>;
}
