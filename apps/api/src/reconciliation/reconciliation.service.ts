import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import Decimal from 'decimal.js';

interface CustodianRow {
  fundName: string;
  amount: number;
  date: string;
  type: string;
  [key: string]: any;
}

interface DiffItem {
  fundName: string;
  field: string;
  custodianValue: string;
  portscopeValue: string;
  difference: string;
  status: 'MATCH' | 'WITHIN_TOLERANCE' | 'EXCEPTION';
}

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPeriods(familyOfficeId: string) {
    return this.prisma.reconciliationPeriod.findMany({
      where: { familyOfficeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 24,
    });
  }

  async getPeriod(familyOfficeId: string, id: string) {
    return this.prisma.reconciliationPeriod.findFirst({
      where: { id, familyOfficeId },
    });
  }

  async uploadCustodian(
    familyOfficeId: string,
    actorId: string,
    data: {
      year: number;
      month: number;
      rows: CustodianRow[];
      tolerancePercent?: number;
    },
  ) {
    const tolerancePercent = data.tolerancePercent ?? 1;

    const events = await this.prisma.capitalEvent.findMany({
      where: {
        holding: { entity: { familyOfficeId } },
        eventDate: {
          gte: new Date(data.year, data.month - 1, 1),
          lt: new Date(data.year, data.month, 1),
        },
      },
      include: { holding: { include: { fund: true } } },
    });

    const diffs: DiffItem[] = [];
    let hasException = false;

    for (const row of data.rows) {
      const matchingEvents = events.filter(
        (e: any) => e.holding.fund.name.toLowerCase() === row.fundName.toLowerCase(),
      );

      if (matchingEvents.length === 0) {
        diffs.push({
          fundName: row.fundName,
          field: 'presence',
          custodianValue: `${row.type}: ${row.amount}`,
          portscopeValue: 'Not found',
          difference: 'Missing in Portscope',
          status: 'EXCEPTION',
        });
        hasException = true;
        continue;
      }

      for (const event of matchingEvents) {
        const custodianAmt = new Decimal(row.amount);
        const portscopeAmt = new Decimal(event.amount);
        const diff = custodianAmt.minus(portscopeAmt).abs();
        const pctDiff = portscopeAmt.isZero()
          ? 100
          : diff.div(portscopeAmt).times(100).toNumber();

        let status: 'MATCH' | 'WITHIN_TOLERANCE' | 'EXCEPTION';
        if (diff.isZero()) {
          status = 'MATCH';
        } else if (pctDiff <= tolerancePercent) {
          status = 'WITHIN_TOLERANCE';
        } else {
          status = 'EXCEPTION';
          hasException = true;
        }

        diffs.push({
          fundName: row.fundName,
          field: 'amount',
          custodianValue: custodianAmt.toString(),
          portscopeValue: portscopeAmt.toString(),
          difference: diff.toString(),
          status,
        });
      }
    }

    const unmatched = events.filter(
      (e: any) =>
        !data.rows.some(
          (r) => r.fundName.toLowerCase() === e.holding.fund.name.toLowerCase(),
        ),
    );
    for (const e of unmatched) {
      diffs.push({
        fundName: (e as any).holding.fund.name,
        field: 'presence',
        custodianValue: 'Not found',
        portscopeValue: `${e.type}: ${e.amount}`,
        difference: 'Missing in custodian data',
        status: 'EXCEPTION',
      });
      hasException = true;
    }

    const period = await this.prisma.reconciliationPeriod.upsert({
      where: {
        familyOfficeId_year_month: {
          familyOfficeId,
          year: data.year,
          month: data.month,
        },
      },
      create: {
        familyOfficeId,
        year: data.year,
        month: data.month,
        status: hasException ? 'EXCEPTION' : 'RECONCILED',
        diffs: diffs as any,
        reconciledAt: new Date(),
        reconciledBy: actorId,
      },
      update: {
        status: hasException ? 'EXCEPTION' : 'RECONCILED',
        diffs: diffs as any,
        reconciledAt: new Date(),
        reconciledBy: actorId,
      },
    });

    await this.audit.log({
      familyOfficeId,
      action: 'RECONCILIATION_COMPLETED',
      entityType: 'ReconciliationPeriod',
      entityId: period.id,
      actorId,
      actorType: 'USER',
      after: { year: data.year, month: data.month, exceptionsCount: diffs.filter((d) => d.status === 'EXCEPTION').length },
    });

    return {
      period,
      summary: {
        total: diffs.length,
        matches: diffs.filter((d) => d.status === 'MATCH').length,
        withinTolerance: diffs.filter((d) => d.status === 'WITHIN_TOLERANCE').length,
        exceptions: diffs.filter((d) => d.status === 'EXCEPTION').length,
      },
      diffs,
    };
  }

  async acceptPeriod(familyOfficeId: string, periodId: string, actorId: string) {
    return this.prisma.reconciliationPeriod.update({
      where: { id: periodId },
      data: { status: 'RECONCILED', reconciledAt: new Date(), reconciledBy: actorId },
    });
  }
}
