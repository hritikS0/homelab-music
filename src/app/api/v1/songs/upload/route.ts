import { NextRequest, NextResponse } from 'next/server';
import { SongService } from '@/services/songs/index';
import { handleApiError } from '@/lib/response';
import { AppError } from '@/utils/appError';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw AppError.badRequest('No file uploaded or invalid file format');
    }

    const songService = new SongService();
    const song = await songService.uploadSong(file);

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
