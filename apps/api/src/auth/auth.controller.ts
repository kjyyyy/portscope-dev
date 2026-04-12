import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import type { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Request() req: AuthenticatedRequest) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      familyOfficeId: req.user.familyOfficeId,
      familyOfficeName: req.user.familyOfficeName,
    };
  }
}
