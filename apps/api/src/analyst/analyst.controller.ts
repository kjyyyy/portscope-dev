import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalystService } from './analyst.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('analyst')
@UseGuards(AuthGuard)
export class AnalystController {
  constructor(private readonly analystService: AnalystService) {}

  @Post('query')
  async query(
    @Request() req: AuthenticatedRequest,
    @Body() body: { question: string },
  ) {
    return this.analystService.query(req.user.familyOfficeId, body.question);
  }

  @Get('history')
  async getHistory(@Request() req: AuthenticatedRequest) {
    return this.analystService.getHistory(req.user.familyOfficeId);
  }
}
