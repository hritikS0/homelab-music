import { NextRequest, NextResponse } from 'next/server';
import { stat, open, readFile } from 'node:fs/promises';
import { SongService } from '@/services/songs/index';
import { songRepository } from '@/repositories/songs/index';
import { handleApiError } from '@/lib/response';
import { AppError } from '@/utils/appError';
import { logger } from '@/config/logger';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);
  try {
    const { id } = await params;
    const songService = new SongService(songRepository);
    const song = await songService.getSongById(id);

    if (!song) {
      throw AppError.notFound('Song not found');
    }

    const { filePath, mimeType } = song;

    // Check if the physical file exists and get stats
    let fileSize: number;
    try {
      const stats = await stat(filePath);
      fileSize = stats.size;
    } catch {
      throw AppError.notFound('Physical song file not found on disk');
    }

    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
        logger.info(`[REQUEST SUCCESS] ${method} ${path} (Range Not Satisfiable)`);
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
            'Accept-Ranges': 'bytes',
          },
        });
      }

      const chunkSize = end - start + 1;
      const fd = await open(filePath, 'r');
      const buffer = Buffer.alloc(chunkSize);
      await fd.read(buffer, 0, chunkSize, start);
      await fd.close();

      logger.info(`[REQUEST SUCCESS] ${method} ${path} (Partial Content)`);
      return new NextResponse(new Uint8Array(buffer), {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType || 'audio/mpeg',
        },
      });
    }

    const fileBuffer = await readFile(filePath);
    logger.info(`[REQUEST SUCCESS] ${method} ${path} (OK)`);
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize.toString(),
        'Content-Type': mimeType || 'audio/mpeg',
      },
    });
  } catch (error) {
    return handleApiError(error, req);
  }
}
