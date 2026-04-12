import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    familyOfficeId: string;
    action: string;
    entityType: string;
    entityId: string;
    actorId?: string;
    actorType?: 'USER' | 'SYSTEM';
    before?: any;
    after?: any;
    metadata?: any;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          familyOfficeId: params.familyOfficeId,
          action: params.action as any,
          entityType: params.entityType,
          entityId: params.entityId,
          actorId: params.actorId ?? null,
          actorType: (params.actorType as any) ?? 'SYSTEM',
          before: params.before ?? undefined,
          after: params.after ?? undefined,
          metadata: params.metadata ?? undefined,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to write audit log: ${err.message}`);
    }
  }

  async findLogs(
    familyOfficeId: string,
    filters: {
      entityType?: string;
      entityId?: string;
      action?: string;
      from?: string;
      to?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { familyOfficeId };

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    const limit = Math.min(filters.limit ?? 50, 200);
    const offset = filters.offset ?? 0;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, limit, offset };
  }
}
