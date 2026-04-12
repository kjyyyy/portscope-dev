import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { VaultService } from './vault.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('vault')
@UseGuards(AuthGuard)
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('search')
  async search(
    @Request() req: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('fundId') fundId?: string,
    @Query('entityId') entityId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('amountMin') amountMin?: string,
    @Query('amountMax') amountMax?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.vaultService.search(req.user.familyOfficeId, {
      q,
      type,
      fundId,
      entityId,
      status,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('types')
  async getDocumentTypes(@Request() req: AuthenticatedRequest) {
    return this.vaultService.getDocumentTypes(req.user.familyOfficeId);
  }

  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.vaultService.getStats(req.user.familyOfficeId);
  }
}
