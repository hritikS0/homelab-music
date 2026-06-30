import { NextRequest, NextResponse } from 'next/server';
import { SongService } from '@/services/songs/index';
import { handleApiError } from '@/lib/response';
import { AppError } from '@/utils/appError';

type RouteParams = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const songService = new SongService();
    const song = await songService.getSongById(id);

    if (!song) {
      throw AppError.notFound('Song not found');
    }

    return NextResponse.json(song);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const songService = new SongService();
    await songService.deleteSong(id);

    return NextResponse.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
