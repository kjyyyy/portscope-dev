import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import Decimal from 'decimal.js';

interface ConcentrationBucket {
  label: string;
  nav: string;
  percent: number;
  holdingsCount: number;
}

@Injectable()
export class ExposureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getSummary(familyOfficeId: string) {
    const holdings = await this.prisma.holding.findMany({
      where: { entity: { familyOfficeId } },
      include: { fund: true, entity: true },
    });

    let totalNav = new Decimal(0);
    for (const h of holdings) {
      totalNav = totalNav.plus(h.currentNav ?? 0);
    }

    const byStrategy = this.aggregate(holdings, totalNav, (h: any) => h.fund.strategy ?? 'Unclassified');
    const byGeography = this.aggregate(holdings, totalNav, (h: any) => h.fund.geography ?? 'Unclassified');
    const byManager = this.aggregate(holdings, totalNav, (h: any) => h.fund.manager ?? 'Unknown');
    const byVintage = this.aggregate(holdings, totalNav, (h: any) =>
      h.fund.vintage ? String(h.fund.vintage) : 'Unclassified',
    );

    const thresholds = await this.prisma.exposureThreshold.findMany({
      where: { familyOfficeId },
    });

    const thresholdMap: Record<string, number> = {};
    thresholds.forEach((t: any) => {
      thresholdMap[t.dimension] = t.maxPercent;
    });

    const alerts = this.checkAlerts(
      { STRATEGY: byStrategy, GEOGRAPHY: byGeography, MANAGER: byManager, VINTAGE: byVintage },
      thresholdMap,
    );

    return {
      totalNav: totalNav.toString(),
      byStrategy,
      byGeography,
      byManager,
      byVintage,
      thresholds: thresholdMap,
      alerts,
    };
  }

  async getAlerts(familyOfficeId: string) {
    const summary = await this.getSummary(familyOfficeId);
    return summary.alerts;
  }

  async getThresholds(familyOfficeId: string) {
    return this.prisma.exposureThreshold.findMany({
      where: { familyOfficeId },
    });
  }

  async updateThresholds(
    familyOfficeId: string,
    actorId: string,
    thresholds: { dimension: string; maxPercent: number }[],
  ) {
    const results = [];
    for (const t of thresholds) {
      const result = await this.prisma.exposureThreshold.upsert({
        where: {
          familyOfficeId_dimension: {
            familyOfficeId,
            dimension: t.dimension as any,
          },
        },
        create: {
          familyOfficeId,
          dimension: t.dimension as any,
          maxPercent: t.maxPercent,
        },
        update: { maxPercent: t.maxPercent },
      });
      results.push(result);
    }

    await this.audit.log({
      familyOfficeId,
      action: 'THRESHOLD_UPDATED',
      entityType: 'ExposureThreshold',
      entityId: familyOfficeId,
      actorId,
      actorType: 'USER',
      after: thresholds,
    });

    return results;
  }

  private aggregate(
    holdings: any[],
    totalNav: Decimal,
    keyFn: (h: any) => string,
  ): ConcentrationBucket[] {
    const buckets: Record<string, { nav: Decimal; count: number }> = {};

    for (const h of holdings) {
      const key = keyFn(h);
      if (!buckets[key]) buckets[key] = { nav: new Decimal(0), count: 0 };
      buckets[key].nav = buckets[key].nav.plus(h.currentNav ?? 0);
      buckets[key].count++;
    }

    return Object.entries(buckets)
      .map(([label, data]) => ({
        label,
        nav: data.nav.toString(),
        percent: totalNav.isZero() ? 0 : data.nav.div(totalNav).times(100).toDP(2).toNumber(),
        holdingsCount: data.count,
      }))
      .sort((a, b) => b.percent - a.percent);
  }

  private checkAlerts(
    dimensions: Record<string, ConcentrationBucket[]>,
    thresholds: Record<string, number>,
  ) {
    const alerts: { dimension: string; label: string; percent: number; threshold: number }[] = [];

    for (const [dim, buckets] of Object.entries(dimensions)) {
      const threshold = thresholds[dim];
      if (!threshold) continue;
      for (const b of buckets) {
        if (b.percent > threshold) {
          alerts.push({
            dimension: dim,
            label: b.label,
            percent: b.percent,
            threshold,
          });
        }
      }
    }

    return alerts;
  }
}
