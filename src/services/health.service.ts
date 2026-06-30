import { prisma } from '@/lib/prisma';

export class HealthService {
  public async checkHealth() {
    let databaseHealthy = false;
    try {
      // Test Prisma client connection
      await prisma.$queryRaw`SELECT 1`;
      databaseHealthy = true;
    } catch {
      databaseHealthy = false;
    }

    return {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseHealthy,
    };
  }
}

export default HealthService;
