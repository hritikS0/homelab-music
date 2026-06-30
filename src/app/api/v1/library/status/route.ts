import { NextRequest, NextResponse } from 'next/server';
import { libraryScanner } from '@/services/library/index';
import { songRepository } from '@/repositories/songs/index';
import { handleApiError } from '@/lib/response';
import { logger } from '@/config/logger';

export async function GET(req: NextRequest) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);
  try {
    const songs = await songRepository.findAll();
    const status = libraryScanner.getStatus(songs.length);
    logger.info(`[REQUEST SUCCESS] ${method} ${path}`);
    return NextResponse.json(status);
  } catch (error) {
    return handleApiError(error, req);
  }
}
