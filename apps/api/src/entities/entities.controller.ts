import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('entities')
@UseGuards(AuthGuard)
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  async listEntities(@Request() req: AuthenticatedRequest) {
    return this.entitiesService.listEntities(req.user.familyOfficeId);
  }

  @Get(':id')
  async getEntity(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.entitiesService.getEntity(id, req.user.familyOfficeId);
  }

  @Post()
  async createEntity(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      name: string;
      type: string;
      parentId?: string;
    },
  ) {
    return this.entitiesService.createEntity(
      req.user.familyOfficeId,
      body.name,
      body.type,
      body.parentId,
    );
  }
}
