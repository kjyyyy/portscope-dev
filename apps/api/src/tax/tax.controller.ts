import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TaxService } from './tax.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('tax')
@UseGuards(AuthGuard)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get('years')
  async getYears(@Request() req: AuthenticatedRequest) {
    return this.taxService.getYears(req.user.familyOfficeId);
  }

  @Get(':year/packages')
  async getPackages(
    @Request() req: AuthenticatedRequest,
    @Param('year') year: string,
  ) {
    return this.taxService.getPackages(
      req.user.familyOfficeId,
      parseInt(year, 10),
    );
  }

  @Post(':year/packages')
  async createPackage(
    @Request() req: AuthenticatedRequest,
    @Param('year') year: string,
    @Body() body: { entityId: string; fundId?: string; expectedDate?: string },
  ) {
    return this.taxService.createPackage(req.user.familyOfficeId, {
      taxYear: parseInt(year, 10),
      ...body,
    });
  }

  @Post(':year/packages/:id/mark-received')
  async markReceived(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { documentId?: string },
  ) {
    return this.taxService.markReceived(
      req.user.familyOfficeId,
      id,
      req.user.id,
      body.documentId,
    );
  }

  @Get(':year/export')
  async exportForCpa(
    @Request() req: AuthenticatedRequest,
    @Param('year') year: string,
  ) {
    return this.taxService.exportForCpa(
      req.user.familyOfficeId,
      parseInt(year, 10),
    );
  }
}
