import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { SongService } from '@/services/songs/index';
import { songRepository } from '@/repositories/songs/index';
import { handleApiError } from '@/lib/response';
import { AppError } from '@/utils/appError';

type RouteParams = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(req: NextRequest, { params }: RouteParams) {
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
      // Parse Range header (e.g. "bytes=32768-")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
            'Accept-Ranges': 'bytes',
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(fileStream);

      return new NextResponse(webStream as unknown as ReadableStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType || 'audio/mpeg',
        },
      });
    } else {
      // Return whole file if no range header is requested
      const fileStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(fileStream);

      return new NextResponse(webStream as unknown as ReadableStream, {
        status: 200,
        headers: {
          'Accept-Ranges': 'bytes',
          'Content-Length': fileSize.toString(),
          'Content-Type': mimeType || 'audio/mpeg',
        },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
