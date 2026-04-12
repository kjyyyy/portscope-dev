import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Decimal from 'decimal.js';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPortalOverview(familyOfficeId: string) {
    const familyOffice = await this.prisma.familyOffice.findUnique({
      where: { id: familyOfficeId },
    });

    if (!familyOffice) throw new NotFoundException('Family office not found');

    const holdings = await this.prisma.holding.findMany({
      where: { entity: { familyOfficeId } },
      include: { fund: true },
    });

    let totalNav = new Decimal(0);
    let totalDistributed = new Decimal(0);
    let altsNav = new Decimal(0);

    for (const h of holdings) {
      const nav = new Decimal(h.currentNav?.toString() ?? '0');
      totalNav = totalNav.plus(nav);
      altsNav = altsNav.plus(nav);
      totalDistributed = totalDistributed.plus(
        h.distributedAmount?.toString() ?? '0',
      );
    }

    const nextCall = await this.prisma.capitalEvent.findFirst({
      where: {
        holding: { entity: { familyOfficeId } },
        type: 'CALL',
        dueDate: { gte: new Date() },
        status: 'PENDING',
      },
      orderBy: { dueDate: 'asc' },
      include: { holding: { include: { fund: true } } },
    });

    const latestReport = await this.prisma.report.findFirst({
      where: { familyOfficeId, status: 'DELIVERED' },
      orderBy: { deliveredAt: 'desc' },
    });

    const now = new Date();
    const quarterLabel = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

    return {
      familyOfficeName: familyOffice.name,
      netWorth: totalNav.toString(),
      altsNav: altsNav.toString(),
      liquidValue: '0',
      distributions: totalDistributed.toString(),
      delta: 0,
      deltaPercent: 0,
      asOf: now.toISOString(),
      quarterLabel,
      nextCall: nextCall
        ? {
            amount: nextCall.amount.toString(),
            dueDate: nextCall.dueDate?.toISOString(),
            fundName: nextCall.holding.fund.name,
          }
        : null,
      latestReport: latestReport
        ? {
            id: latestReport.id,
            title: latestReport.title,
            quarterLabel: latestReport.quarterLabel,
            s3Key: latestReport.s3Key,
          }
        : null,
    };
  }

  async listReports(familyOfficeId: string) {
    return this.prisma.report.findMany({
      where: { familyOfficeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReport(id: string, familyOfficeId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, familyOfficeId },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async approveReport(id: string, familyOfficeId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, familyOfficeId, status: 'DRAFT' },
    });
    if (!report) throw new NotFoundException('Report not in draft');

    return this.prisma.report.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
  }
}
