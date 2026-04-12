import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Decimal from 'decimal.js';

interface ForecastMonth {
  month: string;
  estimatedCalls: string;
  confirmedCalls: string;
  estimatedDistributions: string;
  netCashFlow: string;
}

@Injectable()
export class ForecastService {
  constructor(private readonly prisma: PrismaService) {}

  async getCashFlow(familyOfficeId: string, months = 12) {
    const holdings = await this.prisma.holding.findMany({
      where: { entity: { familyOfficeId } },
      include: { fund: true, capitalEvents: true },
    });

    const confirmedCalls = await this.prisma.capitalEvent.findMany({
      where: {
        type: 'CALL',
        holding: { entity: { familyOfficeId } },
        dueDate: { gte: new Date() },
        status: 'PENDING',
      },
    });

    const now = new Date();
    const forecast: ForecastMonth[] = [];

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

      let confirmed = new Decimal(0);
      for (const call of confirmedCalls) {
        if (call.dueDate) {
          const cd = new Date(call.dueDate);
          if (cd.getFullYear() === monthDate.getFullYear() && cd.getMonth() === monthDate.getMonth()) {
            confirmed = confirmed.plus(call.amount);
          }
        }
      }

      let estimated = new Decimal(0);
      for (const h of holdings) {
        const unfunded = new Decimal(h.commitment ?? 0).minus(h.calledAmount ?? 0);
        if (unfunded.lte(0)) continue;

        const vintageYear = h.fund.vintage ?? now.getFullYear();
        const fundLife = 10;
        const remainingYears = Math.max(1, vintageYear + fundLife - now.getFullYear());
        const monthlyEstimate = unfunded.div(remainingYears * 12);
        estimated = estimated.plus(monthlyEstimate);
      }

      estimated = Decimal.max(estimated.minus(confirmed), new Decimal(0));

      let estDistributions = new Decimal(0);
      for (const h of holdings) {
        const nav = new Decimal(h.currentNav ?? 0);
        if (nav.lte(0)) continue;
        const monthlyDist = nav.times(0.005);
        estDistributions = estDistributions.plus(monthlyDist);
      }

      const totalOut = confirmed.plus(estimated);
      const net = estDistributions.minus(totalOut);

      forecast.push({
        month: monthKey,
        estimatedCalls: estimated.toDP(2).toString(),
        confirmedCalls: confirmed.toDP(2).toString(),
        estimatedDistributions: estDistributions.toDP(2).toString(),
        netCashFlow: net.toDP(2).toString(),
      });
    }

    let totalUnfunded = new Decimal(0);
    let totalCommitment = new Decimal(0);
    let totalCalled = new Decimal(0);
    for (const h of holdings) {
      totalCommitment = totalCommitment.plus(h.commitment ?? 0);
      totalCalled = totalCalled.plus(h.calledAmount ?? 0);
      const unfunded = new Decimal(h.commitment ?? 0).minus(h.calledAmount ?? 0);
      if (unfunded.gt(0)) totalUnfunded = totalUnfunded.plus(unfunded);
    }

    return {
      forecast,
      summary: {
        totalCommitment: totalCommitment.toString(),
        totalCalled: totalCalled.toString(),
        totalUnfunded: totalUnfunded.toString(),
        holdingsCount: holdings.length,
        pendingCallsCount: confirmedCalls.length,
      },
    };
  }
}
