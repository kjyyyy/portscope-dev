import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let db = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {}

    return {
      status: db ? 'ok' : 'degraded',
      services: { database: db ? 'connected' : 'disconnected' },
      timestamp: new Date().toISOString(),
    };
  }
}
