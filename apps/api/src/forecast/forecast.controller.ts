import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('forecast')
@UseGuards(AuthGuard)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('cashflow')
  async getCashFlow(
    @Request() req: AuthenticatedRequest,
    @Query('months') months?: string,
  ) {
    return this.forecastService.getCashFlow(
      req.user.familyOfficeId,
      months ? parseInt(months, 10) : 12,
    );
  }
}
