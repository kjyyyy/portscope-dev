import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('calendar')
@UseGuards(AuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('upcoming')
  async getUpcoming(@Request() req: AuthenticatedRequest) {
    return this.calendarService.getUpcoming(req.user.familyOfficeId);
  }

  @Get('past')
  async getPast(@Request() req: AuthenticatedRequest) {
    return this.calendarService.getPast(req.user.familyOfficeId);
  }

  @Post(':id/mark-wired')
  async markWired(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.calendarService.markWired(
      id,
      req.user.familyOfficeId,
      req.user.id,
    );
  }

  @Post(':id/confirm')
  async confirmWire(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.calendarService.confirmWire(
      id,
      req.user.familyOfficeId,
      req.user.id,
    );
  }

  @Post(':id/wire-instruction')
  async addWireInstruction(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      abaRouting?: string;
      swiftBic?: string;
      currency?: string;
      reference?: string;
    },
  ) {
    return this.calendarService.addWireInstruction(
      id,
      req.user.familyOfficeId,
      body,
    );
  }
}
