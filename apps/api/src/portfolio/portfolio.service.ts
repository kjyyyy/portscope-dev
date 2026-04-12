import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Decimal from 'decimal.js';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(familyOfficeId: string) {
    const holdings = await this.prisma.holding.findMany({
      where: { entity: { familyOfficeId } },
      include: { fund: true, entity: true },
    });

    let totalNav = new Decimal(0);
    let totalCommitment = new Decimal(0);
    let totalCalled = new Decimal(0);
    let totalDistributed = new Decimal(0);

    for (const h of holdings) {
      totalNav = totalNav.plus(h.currentNav ?? 0);
      totalCommitment = totalCommitment.plus(h.commitment ?? 0);
      totalCalled = totalCalled.plus(h.calledAmount ?? 0);
      totalDistributed = totalDistributed.plus(h.distributedAmount ?? 0);
    }

    const nextCall = await this.prisma.capitalEvent.findFirst({
      where: {
        holding: { entity: { familyOfficeId } },
        type: 'CALL',
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: 'asc' },
      include: { holding: { include: { fund: true } } },
    });

    return {
      totalNav: totalNav.toString(),
      totalCommitment: totalCommitment.toString(),
      totalCalled: totalCalled.toString(),
      totalDistributed: totalDistributed.toString(),
      holdingsCount: holdings.length,
      nextCall: nextCall
        ? {
            fundName: nextCall.holding.fund.name,
            amount: nextCall.amount.toString(),
            dueDate: nextCall.dueDate?.toISOString(),
          }
        : null,
    };
  }

  async listFunds(familyOfficeId: string) {
    return this.prisma.fund.findMany({
      where: { holdings: { some: { entity: { familyOfficeId } } } },
      include: {
        holdings: { include: { entity: true } },
        _count: { select: { documents: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async listHoldings(familyOfficeId: string) {
    return this.prisma.holding.findMany({
      where: { entity: { familyOfficeId } },
      include: { fund: true, entity: true },
      orderBy: { fund: { name: 'asc' } },
    });
  }

  async listCapitalEvents(familyOfficeId: string) {
    return this.prisma.capitalEvent.findMany({
      where: { holding: { entity: { familyOfficeId } } },
      include: {
        holding: { include: { fund: true, entity: true } },
        document: { select: { id: true, fileName: true } },
      },
      orderBy: { eventDate: 'desc' },
      take: 50,
    });
  }
}
