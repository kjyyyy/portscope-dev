import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('reconciliation')
@UseGuards(AuthGuard)
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get('periods')
  async getPeriods(@Request() req: AuthenticatedRequest) {
    return this.reconciliationService.getPeriods(req.user.familyOfficeId);
  }

  @Get('periods/:id')
  async getPeriod(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.reconciliationService.getPeriod(req.user.familyOfficeId, id);
  }

  @Post('upload-custodian')
  async uploadCustodian(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      year: number;
      month: number;
      rows: { fundName: string; amount: number; date: string; type: string }[];
      tolerancePercent?: number;
    },
  ) {
    return this.reconciliationService.uploadCustodian(
      req.user.familyOfficeId,
      req.user.id,
      body,
    );
  }

  @Post(':id/accept')
  async accept(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.reconciliationService.acceptPeriod(
      req.user.familyOfficeId,
      id,
      req.user.id,
    );
  }
}
