import { NextResponse } from 'next/server';
import { HealthService } from '@/services/health.service';
import { handleApiError } from '@/lib/response';

const healthService = new HealthService();

export async function GET() {
  try {
    const health = await healthService.checkHealth();

    if (!health.databaseHealthy) {
      return NextResponse.json(
        {
          success: false,
          message: 'Homelab Music API database is unhealthy',
          timestamp: health.timestamp,
          uptime: health.uptime,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Homelab Music API is healthy',
      timestamp: health.timestamp,
      uptime: health.uptime,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
