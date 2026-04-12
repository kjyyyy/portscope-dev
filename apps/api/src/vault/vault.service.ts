import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class VaultService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    familyOfficeId: string,
    filters: {
      q?: string;
      type?: string;
      fundId?: string;
      entityId?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      amountMin?: string;
      amountMax?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { familyOfficeId };

    if (filters.type) where.type = filters.type;
    if (filters.fundId) where.fundId = filters.fundId;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.status) where.status = filters.status;

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    if (filters.amountMin || filters.amountMax) {
      where.amount = {};
      if (filters.amountMin) where.amount.gte = parseFloat(filters.amountMin);
      if (filters.amountMax) where.amount.lte = parseFloat(filters.amountMax);
    }

    if (filters.q) {
      where.OR = [
        { fileName: { contains: filters.q, mode: 'insensitive' } },
        { type: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const limit = Math.min(filters.limit ?? 50, 200);
    const offset = filters.offset ?? 0;

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          fund: { select: { id: true, name: true } },
          entity: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items: items.map((d: any) => ({
        id: d.id,
        fileName: d.fileName,
        type: d.type,
        status: d.status,
        overallConfidence: d.overallConfidence,
        amount: d.amount?.toString() ?? null,
        fundName: d.fund?.name ?? null,
        entityName: d.entity?.name ?? null,
        createdAt: d.createdAt.toISOString(),
        processedAt: d.processedAt?.toISOString() ?? null,
      })),
      total,
      limit,
      offset,
    };
  }

  async getDocumentTypes(familyOfficeId: string) {
    const types = await this.prisma.document.groupBy({
      by: ['type'],
      where: { familyOfficeId },
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
    });
    return types.map((t: any) => ({ type: t.type, count: t._count.type }));
  }

  async getStats(familyOfficeId: string) {
    const [total, byStatus] = await Promise.all([
      this.prisma.document.count({ where: { familyOfficeId } }),
      this.prisma.document.groupBy({
        by: ['status'],
        where: { familyOfficeId },
        _count: { status: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((s: any) => {
      statusMap[s.status] = s._count.status;
    });

    return { total, byStatus: statusMap };
  }
}
