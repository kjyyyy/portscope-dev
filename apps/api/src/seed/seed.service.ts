import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const existing = await this.prisma.familyOffice.findFirst();
    if (existing) {
      this.logger.log('Data already exists, skipping seed');
      return { seeded: false, message: 'Data already exists' };
    }

    this.logger.log('Seeding initial data...');

    const fo = await this.prisma.familyOffice.create({
      data: { name: 'Demo Family Office' },
    });

    const staff = await this.prisma.user.create({
      data: {
        email: 'staff@portscope.io',
        name: 'Staff User',
        role: 'STAFF',
        familyOfficeId: fo.id,
      },
    });

    const client = await this.prisma.user.create({
      data: {
        email: 'client@portscope.io',
        name: 'Client User',
        role: 'CLIENT',
        familyOfficeId: fo.id,
      },
    });

    const trust = await this.prisma.entity.create({
      data: {
        name: 'Family Trust I',
        type: 'TRUST',
        familyOfficeId: fo.id,
      },
    });

    const llc = await this.prisma.entity.create({
      data: {
        name: 'Ventures LLC',
        type: 'LLC',
        familyOfficeId: fo.id,
        parentId: trust.id,
      },
    });

    const fund1 = await this.prisma.fund.create({
      data: {
        name: 'Real Estate Fund IX',
        manager: 'Fund Manager A',
        strategy: 'Real Estate',
        vintage: 2022,
        geography: 'Global',
      },
    });

    const fund2 = await this.prisma.fund.create({
      data: {
        name: 'PE Americas XII',
        manager: 'Fund Manager B',
        strategy: 'Private Equity',
        vintage: 2021,
        geography: 'Americas',
      },
    });

    const fund3 = await this.prisma.fund.create({
      data: {
        name: 'Credit Fund VIII',
        manager: 'Fund Manager C',
        strategy: 'Credit',
        vintage: 2023,
        geography: 'Global',
      },
    });

    const h1 = await this.prisma.holding.create({
      data: {
        entityId: trust.id,
        fundId: fund1.id,
        commitment: 36_000_000,
        calledAmount: 18_500_000,
        distributedAmount: 2_100_000,
        currentNav: 42_300_000,
        irr: 0.142,
        tvpi: 1.35,
        dpi: 0.11,
        asOfDate: new Date('2026-03-31'),
      },
    });

    const h2 = await this.prisma.holding.create({
      data: {
        entityId: trust.id,
        fundId: fund2.id,
        commitment: 25_000_000,
        calledAmount: 22_000_000,
        distributedAmount: 8_400_000,
        currentNav: 28_900_000,
        irr: 0.183,
        tvpi: 1.7,
        dpi: 0.38,
        asOfDate: new Date('2026-03-31'),
      },
    });

    const h3 = await this.prisma.holding.create({
      data: {
        entityId: llc.id,
        fundId: fund3.id,
        commitment: 15_000_000,
        calledAmount: 12_000_000,
        distributedAmount: 3_100_000,
        currentNav: 13_240_000,
        irr: 0.098,
        tvpi: 1.36,
        dpi: 0.26,
        asOfDate: new Date('2026-03-31'),
      },
    });

    await this.prisma.capitalEvent.create({
      data: {
        type: 'CALL',
        amount: 847_500,
        eventDate: new Date('2026-04-07'),
        dueDate: new Date('2026-04-30'),
        holdingId: h1.id,
        status: 'PENDING',
      },
    });

    await this.prisma.capitalEvent.create({
      data: {
        type: 'DISTRIBUTION',
        amount: 1_240_000,
        eventDate: new Date('2026-03-15'),
        holdingId: h2.id,
        status: 'COMPLETED',
      },
    });

    await this.prisma.report.create({
      data: {
        familyOfficeId: fo.id,
        title: 'Q1 2026 — Full Portfolio Review',
        quarterLabel: 'Q1 2026',
        status: 'DELIVERED',
        deliveredAt: new Date('2026-04-05'),
      },
    });

    this.logger.log('Seed data created');
    return {
      seeded: true,
      familyOfficeId: fo.id,
      staffUserId: staff.id,
      clientUserId: client.id,
    };
  }
}
