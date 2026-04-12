import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('reporting')
@UseGuards(AuthGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('portal-overview')
  async getPortalOverview(@Request() req: AuthenticatedRequest) {
    return this.reportingService.getPortalOverview(req.user.familyOfficeId);
  }

  @Get('reports')
  async listReports(@Request() req: AuthenticatedRequest) {
    return this.reportingService.listReports(req.user.familyOfficeId);
  }

  @Get('reports/:id')
  async getReport(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.reportingService.getReport(id, req.user.familyOfficeId);
  }

  @Post('reports/:id/approve')
  async approveReport(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.reportingService.approveReport(id, req.user.familyOfficeId);
  }
}
