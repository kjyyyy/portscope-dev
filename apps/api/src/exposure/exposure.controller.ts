import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExposureService } from './exposure.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('exposure')
@UseGuards(AuthGuard)
export class ExposureController {
  constructor(private readonly exposureService: ExposureService) {}

  @Get('summary')
  async getSummary(@Request() req: AuthenticatedRequest) {
    return this.exposureService.getSummary(req.user.familyOfficeId);
  }

  @Get('alerts')
  async getAlerts(@Request() req: AuthenticatedRequest) {
    return this.exposureService.getAlerts(req.user.familyOfficeId);
  }

  @Get('thresholds')
  async getThresholds(@Request() req: AuthenticatedRequest) {
    return this.exposureService.getThresholds(req.user.familyOfficeId);
  }

  @Put('thresholds')
  async updateThresholds(
    @Request() req: AuthenticatedRequest,
    @Body() body: { thresholds: { dimension: string; maxPercent: number }[] },
  ) {
    return this.exposureService.updateThresholds(
      req.user.familyOfficeId,
      req.user.id,
      body.thresholds,
    );
  }
}
