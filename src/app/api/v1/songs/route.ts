import { NextResponse } from 'next/server';
import { SongService } from '@/services/songs/index';
import { songRepository } from '@/repositories/songs/index';
import { handleApiError } from '@/lib/response';

export async function GET() {
  try {
    const songService = new SongService(songRepository);
    const songs = await songService.getSongs();
    return NextResponse.json(songs);
  } catch (error) {
    return handleApiError(error);
  }
}
