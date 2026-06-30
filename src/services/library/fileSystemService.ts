import fs from 'node:fs/promises';
import path from 'node:path';
import { IFileSystem, FileStats } from './fileSystem.interface';

export class FileSystemService implements IFileSystem {
  public async walk(dirPath: string): Promise<string[]> {
    const results: string[] = [];

    const walkDir = async (currentDir: string) => {
      let list: string[];
      try {
        list = await fs.readdir(currentDir);
      } catch {
        return;
      }
      
      for (const file of list) {
        const fullPath = path.join(currentDir, file);
        let statVal;
        try {
          statVal = await fs.stat(fullPath);
        } catch {
          continue;
        }
        if (statVal.isDirectory()) {
          await walkDir(fullPath);
        } else {
          results.push(fullPath);
        }
      }
    };

    await walkDir(dirPath);
    return results;
  }

  public async stat(filePath: string): Promise<FileStats> {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime,
    };
  }

  public async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }
}
