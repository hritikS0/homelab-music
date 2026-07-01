/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { songRepository } from '@/repositories/songs/index';
import { parseFile } from 'music-metadata';
import { handleApiError } from '@/lib/response';
import { AppError } from '@/utils/appError';
import { logger } from '@/config/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);

  try {
    const { id } = await params;
    const song = await songRepository.findById(id);
    if (!song) {
      throw AppError.notFound('Song not found');
    }

    try {
      const metadata = await parseFile(song.filePath);
      const picture = metadata.common.picture?.[0];

      if (!picture) {
        return new NextResponse(null, {
          status: 204,
          headers: { 'Cache-Control': 'public, max-age=604800, immutable' },
        });
      }

      logger.info(`[REQUEST SUCCESS] ${method} ${path} - Serving artwork (${picture.format || 'image/jpeg'})`);
      return new NextResponse(picture.data as any, {
        headers: {
          'Content-Type': picture.format || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (parseErr) {
      logger.warn(parseErr, `Failed to parse metadata picture for ${song.filePath}`);
      return new NextResponse(null, {
        status: 204,
        headers: { 'Cache-Control': 'public, max-age=604800, immutable' },
      });
    }
  } catch (error) {
    return handleApiError(error, req);
  }
}
