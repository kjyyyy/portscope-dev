import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly extractorUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {
    this.extractorUrl = process.env.EXTRACTOR_URL ?? 'http://localhost:8001';
  }

  async getReviewQueue(familyOfficeId: string) {
    const items = await this.prisma.document.findMany({
      where: {
        familyOfficeId,
        status: { in: ['REVIEW', 'AUTO_APPROVED', 'APPROVED', 'PROCESSING'] },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        fund: { select: { name: true, manager: true } },
        entity: { select: { name: true } },
      },
    });

    const pending = items.filter((d: any) => d.status === 'REVIEW').length;
    return { items, pending };
  }

  async getDocument(id: string, familyOfficeId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, familyOfficeId },
      include: {
        fund: true,
        entity: true,
      },
    });

    if (!doc) throw new NotFoundException('Document not found');

    let presignedUrl: string | null = null;
    try {
      presignedUrl = await this.storage.getPresignedUrl(doc.s3Key);
    } catch {
      this.logger.warn(`Could not generate presigned URL for ${doc.s3Key}`);
    }

    return { ...doc, presignedUrl };
  }

  async approveDocument(
    id: string,
    familyOfficeId: string,
    reviewerId: string,
    corrections: Record<string, string>,
  ) {
    const doc = await this.prisma.document.findFirst({
      where: { id, familyOfficeId, status: { in: ['REVIEW', 'AUTO_APPROVED'] } },
    });

    if (!doc) throw new NotFoundException('Document not in review state');

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        corrections: corrections as any,
      },
    });

    this.materializeToPortfolio(updated).catch((err) =>
      this.logger.error(`Portfolio materialization failed for ${id}`, err),
    );

    this.notifySlack(familyOfficeId, `✅ *Document Approved:* ${updated.fileName}\nType: ${updated.type}`);

    this.audit.log({
      familyOfficeId,
      action: 'DOCUMENT_APPROVED',
      entityType: 'Document',
      entityId: id,
      actorId: reviewerId,
      actorType: 'USER',
      before: { status: doc.status },
      after: { status: 'APPROVED', corrections },
    });

    return updated;
  }

  async flagDocument(id: string, familyOfficeId: string, reason: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, familyOfficeId },
    });

    if (!doc) throw new NotFoundException('Document not found');

    const result = await this.prisma.document.update({
      where: { id },
      data: {
        status: 'REJECTED',
        corrections: { flagReason: reason } as any,
      },
    });

    this.audit.log({
      familyOfficeId,
      action: 'DOCUMENT_REJECTED',
      entityType: 'Document',
      entityId: id,
      actorType: 'USER',
      before: { status: doc.status },
      after: { status: 'REJECTED', reason },
    });

    return result;
  }

  async reExtract(id: string, familyOfficeId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, familyOfficeId },
    });

    if (!doc) throw new NotFoundException('Document not found');

    await this.prisma.document.update({
      where: { id },
      data: { status: 'PROCESSING', extractedFields: null as any, overallConfidence: null, flaggedFieldCount: 0 },
    });

    this.processInBackground(doc.id, doc.s3Key).catch((err) =>
      this.logger.error(`Re-extraction failed for ${doc.id}`, err),
    );

    return { id: doc.id, status: 'PROCESSING' };
  }

  async uploadAndProcess(
    file: Express.Multer.File,
    familyOfficeId: string,
  ) {
    const s3Key = `uploads/${Date.now()}-${file.originalname}`;

    await this.storage.upload(s3Key, file.buffer, file.mimetype);
    this.logger.log(`Uploaded ${file.originalname} as ${s3Key}`);

    const doc = await this.prisma.document.create({
      data: {
        fileName: file.originalname,
        s3Key,
        familyOfficeId,
        status: 'PROCESSING',
        type: 'UNKNOWN',
      },
    });

    this.audit.log({
      familyOfficeId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: doc.id,
      actorType: 'USER',
      after: { fileName: file.originalname, s3Key },
    });

    this.processInBackground(doc.id, s3Key).catch((err) =>
      this.logger.error(`Background processing failed for ${doc.id}`, err),
    );

    return doc;
  }

  async getIntegrationsStatus(familyOfficeId: string) {
    const [s3Integration, slackIntegration] = await Promise.all([
      this.prisma.integration.findUnique({ where: { familyOfficeId_provider: { familyOfficeId, provider: 'S3' } } }),
      this.prisma.integration.findUnique({ where: { familyOfficeId_provider: { familyOfficeId, provider: 'SLACK' } } }),
    ]);

    return {
      s3: s3Integration
        ? {
            connected: s3Integration.status === 'ACTIVE',
            name: s3Integration.name,
            bucket: (s3Integration.config as any).bucket,
            endpoint: (s3Integration.config as any).endpoint,
            lastSyncAt: s3Integration.lastSyncAt,
          }
        : { connected: false },
      slack: slackIntegration
        ? {
            connected: slackIntegration.status === 'ACTIVE',
            channel: (slackIntegration.config as any).channel,
          }
        : { connected: false },
      availableIntegrations: [],
    };
  }

  async connectS3(
    familyOfficeId: string,
    config: { name: string; bucket: string; endpoint: string; region: string; accessKey: string; secretKey: string },
  ) {
    const client = this.createTenantS3Client(config);
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      await client.send(new ListObjectsV2Command({ Bucket: config.bucket, MaxKeys: 1 }));
    } catch (err: any) {
      const code = err.Code || err.name || '';
      if (code === 'InvalidAccessKeyId' || code === 'SignatureDoesNotMatch') {
        throw new BadRequestException('Invalid credentials. Check your Access Key ID and Secret Access Key.');
      }
      if (code === 'NoSuchBucket') {
        throw new BadRequestException(`Bucket "${config.bucket}" not found. Check the bucket name and region.`);
      }
      if (code === 'AccessDenied' || code === 'AllAccessDisabled') {
        throw new BadRequestException('Access denied. Ensure the IAM user has s3:ListBucket permission on this bucket.');
      }
      if (err.message?.includes('getaddrinfo') || err.message?.includes('ENOTFOUND')) {
        throw new BadRequestException('Cannot reach the endpoint URL. For AWS S3, use: https://s3.<region>.amazonaws.com');
      }
      throw new BadRequestException(`Cannot connect to bucket: ${err.message}`);
    }

    const integration = await this.prisma.integration.upsert({
      where: { familyOfficeId_provider: { familyOfficeId, provider: 'S3' } },
      create: {
        familyOfficeId,
        provider: 'S3',
        name: config.name || config.bucket,
        config: {
          bucket: config.bucket,
          endpoint: config.endpoint,
          region: config.region || 'auto',
          accessKey: config.accessKey,
          secretKey: config.secretKey,
        },
        status: 'ACTIVE',
      },
      update: {
        name: config.name || config.bucket,
        config: {
          bucket: config.bucket,
          endpoint: config.endpoint,
          region: config.region || 'auto',
          accessKey: config.accessKey,
          secretKey: config.secretKey,
        },
        status: 'ACTIVE',
      },
    });

    return { connected: true, integration };
  }

  async disconnectS3(familyOfficeId: string) {
    await this.prisma.integration.updateMany({
      where: { familyOfficeId, provider: 'S3' },
      data: { status: 'INACTIVE' },
    });
    return { disconnected: true };
  }

  async connectSlack(familyOfficeId: string, config: { webhookUrl: string; channel: string }) {
    const testPayload = {
      text: '🔗 *Portscope Connected!*\nYou will receive notifications here when documents are processed, flagged, or approved.',
    };

    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    if (!res.ok) {
      throw new Error(`Slack webhook returned ${res.status}: ${await res.text()}`);
    }

    const integration = await this.prisma.integration.upsert({
      where: { familyOfficeId_provider: { familyOfficeId, provider: 'SLACK' } },
      create: {
        familyOfficeId,
        provider: 'SLACK',
        name: config.channel || 'Slack',
        config: { webhookUrl: config.webhookUrl, channel: config.channel },
        status: 'ACTIVE',
      },
      update: {
        name: config.channel || 'Slack',
        config: { webhookUrl: config.webhookUrl, channel: config.channel },
        status: 'ACTIVE',
      },
    });

    return { connected: true, integration };
  }

  async disconnectSlack(familyOfficeId: string) {
    await this.prisma.integration.updateMany({
      where: { familyOfficeId, provider: 'SLACK' },
      data: { status: 'INACTIVE' },
    });
    return { disconnected: true };
  }

  async notifySlack(familyOfficeId: string, message: string) {
    try {
      const integration = await this.prisma.integration.findUnique({
        where: { familyOfficeId_provider: { familyOfficeId, provider: 'SLACK' } },
      });
      if (!integration || integration.status !== 'ACTIVE') return;

      const webhookUrl = (integration.config as any).webhookUrl;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    } catch (err) {
      this.logger.warn(`Slack notification failed for ${familyOfficeId}`, err);
    }
  }

  async listS3Files(familyOfficeId: string, prefix = '') {
    const integration = await this.prisma.integration.findUnique({
      where: { familyOfficeId_provider: { familyOfficeId, provider: 'S3' } },
    });
    if (!integration || integration.status !== 'ACTIVE') {
      throw new Error('No active S3 integration. Connect your bucket first.');
    }

    const config = integration.config as any;
    const client = this.createTenantS3Client(config);
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');

    const result = await client.send(
      new ListObjectsV2Command({ Bucket: config.bucket, Prefix: prefix, MaxKeys: 200 }),
    );

    const existingKeys = new Set(
      (await this.prisma.document.findMany({
        where: { familyOfficeId },
        select: { s3Key: true },
      })).map((d) => d.s3Key),
    );

    const files = (result.Contents ?? [])
      .filter((f: any) => {
        const key = f.Key ?? '';
        return key && /\.(pdf|PDF|csv|txt|xlsx?)$/i.test(key);
      })
      .map((f: any) => ({
        key: f.Key ?? '',
        size: f.Size ?? 0,
        lastModified: f.LastModified ?? null,
        alreadyImported: existingKeys.has(`ext:${integration.id}:${f.Key}`),
        fileName: (f.Key ?? '').split('/').pop() ?? f.Key,
      }));

    return files;
  }

  async importFromS3(familyOfficeId: string, s3Key: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { familyOfficeId_provider: { familyOfficeId, provider: 'S3' } },
    });
    if (!integration || integration.status !== 'ACTIVE') {
      throw new Error('No active S3 integration');
    }

    const config = integration.config as any;
    const internalKey = `ext:${integration.id}:${s3Key}`;

    const existing = await this.prisma.document.findFirst({ where: { s3Key: internalKey, familyOfficeId } });
    if (existing) {
      return { alreadyExists: true, document: existing };
    }

    const client = this.createTenantS3Client(config);
    const { GetObjectCommand, HeadObjectCommand } = await import('@aws-sdk/client-s3');

    await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: s3Key }));
    const result = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: s3Key }));
    const stream = result.Body as any;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const fileBuffer = Buffer.concat(chunks);

    const platformKey = `imports/${Date.now()}-${s3Key.split('/').pop()}`;
    await this.storage.upload(platformKey, fileBuffer, result.ContentType ?? 'application/pdf');

    const fileName = s3Key.split('/').pop() ?? s3Key;
    const doc = await this.prisma.document.create({
      data: {
        fileName,
        s3Key: internalKey,
        familyOfficeId,
        status: 'PROCESSING',
        type: 'UNKNOWN',
      },
    });

    await this.prisma.integration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    });

    this.processInBackground(doc.id, platformKey).catch((err) =>
      this.logger.error(`S3 import processing failed for ${doc.id}`, err),
    );

    return { alreadyExists: false, document: doc };
  }

  private createTenantS3Client(config: { endpoint: string; region?: string; accessKey: string; secretKey: string }) {
    const { S3Client } = require('@aws-sdk/client-s3');
    const isStandardAws =
      !config.endpoint ||
      /^https?:\/\/s3[.-][\w-]+\.amazonaws\.com\/?$/.test(config.endpoint);

    const clientConfig: any = {
      region: config.region ?? 'auto',
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    };

    if (!isStandardAws) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true;
    }

    return new S3Client(clientConfig);
  }

  private async materializeToPortfolio(doc: any) {
    const fields = (doc.extractedFields as any[]) ?? [];
    const corrections = (doc.corrections as Record<string, string>) ?? {};
    if (fields.length === 0) return;

    const getField = (key: string): string | null => {
      if (corrections[key]) return corrections[key];
      const f = fields.find((x: any) => x.key === key);
      return f?.value ?? null;
    };

    const parseAmount = (val: string | null): number | null => {
      if (!val) return null;
      const cleaned = val.replace(/[^0-9.\-()]/g, '').replace(/\((.+)\)/, '-$1');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    };

    const fundName = getField('fund_name') || getField('entity_name') || doc.fileName;
    const currency = getField('currency') || 'USD';

    let fund = await this.prisma.fund.findFirst({
      where: { name: fundName },
    });
    if (!fund) {
      fund = await this.prisma.fund.create({
        data: {
          name: fundName,
          manager: getField('fund_name') ? (getField('entity_name') ?? 'Unknown') : 'Unknown',
          currency,
          strategy: doc.type === 'FUND_REPORT' ? 'Private Equity' : null,
        },
      });
    }

    await this.prisma.document.update({
      where: { id: doc.id },
      data: { fundId: fund.id },
    });

    const entity = await this.prisma.entity.findFirst({
      where: { familyOfficeId: doc.familyOfficeId },
      orderBy: { createdAt: 'asc' },
    }) ?? await this.prisma.entity.create({
      data: {
        name: 'Primary Entity',
        type: 'LLC',
        familyOfficeId: doc.familyOfficeId,
      },
    });

    await this.prisma.document.update({
      where: { id: doc.id },
      data: { entityId: entity.id },
    });

    const holding = await this.prisma.holding.upsert({
      where: { entityId_fundId: { entityId: entity.id, fundId: fund.id } },
      create: {
        entityId: entity.id,
        fundId: fund.id,
        currentNav: parseAmount(getField('equity_value') || getField('nav_value') || getField('total_assets')),
        commitment: parseAmount(getField('total_investment') || getField('total_commitment')),
        calledAmount: parseAmount(getField('called_to_date')),
        distributedAmount: parseAmount(getField('distributed_to_date')),
        irr: parseAmount(getField('irr')),
        tvpi: parseAmount(getField('tvpi')),
        dpi: parseAmount(getField('dpi')),
        asOfDate: this.parseDate(getField('as_of_date')),
      },
      update: {
        currentNav: parseAmount(getField('equity_value') || getField('nav_value') || getField('total_assets')) ?? undefined,
        commitment: parseAmount(getField('total_investment') || getField('total_commitment')) ?? undefined,
        calledAmount: parseAmount(getField('called_to_date')) ?? undefined,
        distributedAmount: parseAmount(getField('distributed_to_date')) ?? undefined,
        irr: parseAmount(getField('irr')) ?? undefined,
        tvpi: parseAmount(getField('tvpi')) ?? undefined,
        dpi: parseAmount(getField('dpi')) ?? undefined,
        asOfDate: this.parseDate(getField('as_of_date')) ?? undefined,
      },
    });

    if (doc.type === 'CAPITAL_CALL' || doc.type === 'DISTRIBUTION') {
      const eventAmount = parseAmount(getField('amount') || getField('distribution_amount'));
      if (eventAmount) {
        await this.prisma.capitalEvent.create({
          data: {
            type: doc.type === 'CAPITAL_CALL' ? 'CALL' : 'DISTRIBUTION',
            amount: Math.abs(eventAmount),
            currency,
            eventDate: this.parseDate(getField('call_date') || getField('distribution_date')) ?? new Date(),
            dueDate: this.parseDate(getField('due_date')),
            holdingId: holding.id,
            documentId: doc.id,
            status: 'COMPLETED',
          },
        });
      }
    }

    this.logger.log(
      `Materialized doc ${doc.id} → fund=${fund.name}, holding=${holding.id}, entity=${entity.name}`,
    );
  }

  private parseDate(val: string | null | undefined): Date | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  private async processInBackground(documentId: string, s3Key: string) {
    try {
      const classifyRes = await fetch(`${this.extractorUrl}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3_key: s3Key }),
      });

      if (!classifyRes.ok) throw new Error(`Classify failed: ${classifyRes.status}`);
      const classification = await classifyRes.json();

      const docType = classification.documentType ?? classification.document_type ?? 'UNKNOWN';

      const extractRes = await fetch(`${this.extractorUrl}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3_key: s3Key, document_type: docType }),
      });

      if (!extractRes.ok) throw new Error(`Extract failed: ${extractRes.status}`);
      const extraction = await extractRes.json();

      const fields = extraction.fields ?? [];
      const overallConfidence = extraction.overallConfidence ?? extraction.overall_confidence ?? 0;
      const flaggedCount = fields.filter((f: any) => f.confidence < 0.85).length;

      const autoApprove = overallConfidence >= 0.95 && flaggedCount === 0;
      const amount = fields.find((f: any) => f.key === 'amount')?.value;
      const dueDate = fields.find((f: any) => f.key === 'due_date')?.value;

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          type: docType,
          status: autoApprove ? 'AUTO_APPROVED' : 'REVIEW',
          extractedFields: fields as any,
          overallConfidence,
          flaggedFieldCount: flaggedCount,
          amount: amount ? parseFloat(amount.replace(/[$,]/g, '')) || null : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          processedAt: new Date(),
        },
      });

      this.logger.log(
        `Processed ${documentId}: type=${docType}, confidence=${overallConfidence}, ` +
        `status=${autoApprove ? 'AUTO_APPROVED' : 'REVIEW'}`,
      );

      const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
      if (doc) {
        const emoji = autoApprove ? '🟢' : flaggedCount > 0 ? '🟡' : '📄';
        const statusLabel = autoApprove ? 'Auto-Approved' : `Needs Review (${flaggedCount} flagged)`;
        this.notifySlack(
          doc.familyOfficeId,
          `${emoji} *Document Processed:* ${doc.fileName}\nType: ${docType} · Confidence: ${(overallConfidence * 100).toFixed(0)}% · Status: ${statusLabel}`,
        );
      }
    } catch (err) {
      this.logger.error(`Processing failed for ${documentId}`, err);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'ERROR' },
      });
      const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
      if (doc) {
        this.notifySlack(doc.familyOfficeId, `🔴 *Document Error:* ${doc.fileName}\nExtraction failed -- please retry or check the document.`);
      }
    }
  }
}
