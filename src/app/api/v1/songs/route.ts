import { NextRequest, NextResponse } from 'next/server';
import { SongService } from '@/services/songs/index';
import { songRepository } from '@/repositories/songs/index';
import { handleApiError } from '@/lib/response';
import { logger } from '@/config/logger';

export async function GET(req: NextRequest) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);
  try {
    const songService = new SongService(songRepository);
    const songs = await songService.getSongs();
    logger.info(`[REQUEST SUCCESS] ${method} ${path}`);
    return NextResponse.json(songs);
  } catch (error) {
    return handleApiError(error, req);
  }
}
