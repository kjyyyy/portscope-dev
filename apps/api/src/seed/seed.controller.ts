import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seed() {
    if (process.env.NODE_ENV !== 'development') {
      return { error: 'Seed is only available in development mode' };
    }
    return this.seedService.seed();
  }
}
