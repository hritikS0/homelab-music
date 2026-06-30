import { PrismaClient, Song } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class SongRepository {
  private db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  public async findById(id: string): Promise<Song | null> {
    return this.db.song.findUnique({
      where: { id },
    });
  }

  public async findAll(): Promise<Song[]> {
    return this.db.song.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public async create(data: {
    title: string;
    originalFileName: string;
    storedFileName: string;
    filePath: string;
    mimeType: string;
    size: number;
    duration: number;
  }): Promise<Song> {
    return this.db.song.create({
      data,
    });
  }

  public async delete(id: string): Promise<Song> {
    return this.db.song.delete({
      where: { id },
    });
  }
}

export default SongRepository;
