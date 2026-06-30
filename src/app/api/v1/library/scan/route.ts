import { NextRequest, NextResponse } from 'next/server';
import { libraryScanner } from '@/services/library/index';
import { handleApiError } from '@/lib/response';
import { logger } from '@/config/logger';

export async function POST(req: NextRequest) {
  const method = req.method;
  const path = req.nextUrl.pathname;
  logger.info(`[REQUEST START] ${method} ${path}`);
  try {
    const summary = await libraryScanner.scan();
    logger.info(`[REQUEST SUCCESS] ${method} ${path}`);
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    return handleApiError(error, req);
  }
}
