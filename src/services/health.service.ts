import { songRepository } from '@/repositories/songs/index';

export class HealthService {
  public async checkHealth() {
    let databaseHealthy = false;
    try {
      // Test database connection by reading songs list
      await songRepository.findAll();
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
