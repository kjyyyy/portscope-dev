import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('portfolio')
@UseGuards(AuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('overview')
  async getOverview(@Request() req: AuthenticatedRequest) {
    return this.portfolioService.getOverview(req.user.familyOfficeId);
  }

  @Get('funds')
  async listFunds(@Request() req: AuthenticatedRequest) {
    return this.portfolioService.listFunds(req.user.familyOfficeId);
  }

  @Get('holdings')
  async listHoldings(@Request() req: AuthenticatedRequest) {
    return this.portfolioService.listHoldings(req.user.familyOfficeId);
  }

  @Get('events')
  async listCapitalEvents(@Request() req: AuthenticatedRequest) {
    return this.portfolioService.listCapitalEvents(req.user.familyOfficeId);
  }
}
