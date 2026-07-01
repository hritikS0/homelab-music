import { NextRequest, NextResponse } from 'next/server';
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

    logger.info(`[REQUEST SUCCESS] ${method} ${path}`);
    return NextResponse.json(song);
  } catch (error) {
    return handleApiError(error, req);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);
  try {
    const { id } = await params;
    const songService = new SongService(songRepository);
    await songService.deleteSong(id);

    logger.info(`[REQUEST SUCCESS] ${method} ${path}`);
    return NextResponse.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    return handleApiError(error, req);
  }
}
