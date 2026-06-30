import { NextRequest, NextResponse } from 'next/server';
import { SongService } from '@/services/songs/index';
import { songRepository } from '@/repositories/songs/index';
import { handleApiError } from '@/lib/response';
import { AppError } from '@/utils/appError';
import { logger } from '@/config/logger';

export async function POST(req: NextRequest) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw AppError.badRequest('No file selected.');
    }

    const songService = new SongService(songRepository);
    const song = await songService.uploadSong(file);

    logger.info(`[REQUEST SUCCESS] ${method} ${path}`);
    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    return handleApiError(error, req);
  }
}
