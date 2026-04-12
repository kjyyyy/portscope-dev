import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('queue')
  async getReviewQueue(@Request() req: AuthenticatedRequest) {
    return this.documentsService.getReviewQueue(req.user.familyOfficeId);
  }

  @Get('integrations')
  async getIntegrations(@Request() req: AuthenticatedRequest) {
    return this.documentsService.getIntegrationsStatus(req.user.familyOfficeId);
  }

  @Post('integrations/s3/connect')
  async connectS3(
    @Request() req: AuthenticatedRequest,
    @Body() body: { name: string; bucket: string; endpoint: string; region: string; accessKey: string; secretKey: string },
  ) {
    return this.documentsService.connectS3(req.user.familyOfficeId, body);
  }

  @Post('integrations/s3/disconnect')
  async disconnectS3(@Request() req: AuthenticatedRequest) {
    return this.documentsService.disconnectS3(req.user.familyOfficeId);
  }

  @Post('integrations/slack/connect')
  async connectSlack(
    @Request() req: AuthenticatedRequest,
    @Body() body: { webhookUrl: string; channel: string },
  ) {
    return this.documentsService.connectSlack(req.user.familyOfficeId, body);
  }

  @Post('integrations/slack/disconnect')
  async disconnectSlack(@Request() req: AuthenticatedRequest) {
    return this.documentsService.disconnectSlack(req.user.familyOfficeId);
  }

  @Get('integrations/s3/files')
  async listS3Files(@Request() req: AuthenticatedRequest, @Query('prefix') prefix?: string) {
    return this.documentsService.listS3Files(req.user.familyOfficeId, prefix ?? '');
  }

  @Post('integrations/s3/import')
  async importFromS3(
    @Request() req: AuthenticatedRequest,
    @Body() body: { s3Key: string },
  ) {
    return this.documentsService.importFromS3(req.user.familyOfficeId, body.s3Key);
  }

  @Post('integrations/s3/import-batch')
  async importBatchFromS3(
    @Request() req: AuthenticatedRequest,
    @Body() body: { s3Keys: string[] },
  ) {
    const results = [];
    for (const key of body.s3Keys) {
      const result = await this.documentsService.importFromS3(req.user.familyOfficeId, key);
      results.push(result);
    }
    return { imported: results.filter((r) => !r.alreadyExists).length, skipped: results.filter((r) => r.alreadyExists).length, results };
  }

  @Get(':id')
  async getDocument(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.documentsService.getDocument(id, req.user.familyOfficeId);
  }

  @Post(':id/approve')
  async approveDocument(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { corrections?: Record<string, string> },
  ) {
    return this.documentsService.approveDocument(
      id,
      req.user.familyOfficeId,
      req.user.id,
      body.corrections ?? {},
    );
  }

  @Post(':id/flag')
  async flagDocument(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.documentsService.flagDocument(
      id,
      req.user.familyOfficeId,
      body.reason ?? 'Flagged for review',
    );
  }

  @Post(':id/re-extract')
  async reExtract(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.documentsService.reExtract(id, req.user.familyOfficeId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.uploadAndProcess(file, req.user.familyOfficeId);
  }
}
