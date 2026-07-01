import { NextRequest, NextResponse } from 'next/server';
import { SongService } from '@/services/songs/index';
import { songRepository } from '@/repositories/songs/index';
import { handleApiError } from '@/lib/response';
import { logger } from '@/config/logger';

type RouteParams = {
  params: Promise<{ id: string }> | { id: string };
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);
  try {
    const { id } = await params;
    const songService = new SongService(songRepository);
    const song = await songService.toggleFavorite(id);

    logger.info(`[REQUEST SUCCESS] ${method} ${path}`);
    return NextResponse.json(song);
  } catch (error) {
    return handleApiError(error, req);
  }
}
