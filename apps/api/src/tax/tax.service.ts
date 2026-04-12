import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPackages(familyOfficeId: string, taxYear: number) {
    const packages = await this.prisma.taxPackage.findMany({
      where: { familyOfficeId, taxYear },
      include: {
        entity: { select: { id: true, name: true, type: true } },
      },
      orderBy: [{ status: 'asc' }, { entity: { name: 'asc' } }],
    });

    const k1Docs = await this.prisma.document.findMany({
      where: {
        familyOfficeId,
        type: { in: ['K1', 'K-1', 'TAX_K1'] },
        status: { in: ['APPROVED', 'AUTO_APPROVED'] },
      },
      select: {
        id: true,
        fileName: true,
        fundId: true,
        entityId: true,
        extractedFields: true,
        createdAt: true,
      },
    });

    return {
      packages: packages.map((p: any) => ({
        id: p.id,
        taxYear: p.taxYear,
        entityName: p.entity.name,
        entityType: p.entity.type,
        entityId: p.entityId,
        fundId: p.fundId,
        status: p.status,
        expectedDate: p.expectedDate?.toISOString() ?? null,
        receivedDate: p.receivedDate?.toISOString() ?? null,
      })),
      k1Documents: k1Docs.map((d: any) => ({
        id: d.id,
        fileName: d.fileName,
        fundId: d.fundId,
        entityId: d.entityId,
        createdAt: d.createdAt.toISOString(),
      })),
      summary: {
        total: packages.length,
        received: packages.filter((p: any) => p.status === 'RECEIVED').length,
        pending: packages.filter((p: any) => p.status === 'PENDING').length,
        overdue: packages.filter((p: any) => p.status === 'OVERDUE').length,
      },
    };
  }

  async createPackage(
    familyOfficeId: string,
    data: {
      taxYear: number;
      entityId: string;
      fundId?: string;
      expectedDate?: string;
    },
  ) {
    return this.prisma.taxPackage.create({
      data: {
        familyOfficeId,
        taxYear: data.taxYear,
        entityId: data.entityId,
        fundId: data.fundId ?? null,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
      },
    });
  }

  async markReceived(
    familyOfficeId: string,
    packageId: string,
    actorId: string,
    documentId?: string,
  ) {
    const pkg = await this.prisma.taxPackage.update({
      where: { id: packageId },
      data: {
        status: 'RECEIVED',
        receivedDate: new Date(),
        documentId: documentId ?? null,
      },
    });

    await this.audit.log({
      familyOfficeId,
      action: 'TAX_PACKAGE_RECEIVED',
      entityType: 'TaxPackage',
      entityId: packageId,
      actorId,
      actorType: 'USER',
      after: { status: 'RECEIVED', receivedDate: new Date().toISOString() },
    });

    return pkg;
  }

  async getYears(familyOfficeId: string) {
    const years = await this.prisma.taxPackage.groupBy({
      by: ['taxYear'],
      where: { familyOfficeId },
      _count: { taxYear: true },
      orderBy: { taxYear: 'desc' },
    });

    if (years.length === 0) {
      const currentYear = new Date().getFullYear();
      return [{ year: currentYear, count: 0 }, { year: currentYear - 1, count: 0 }];
    }

    return years.map((y: any) => ({ year: y.taxYear, count: y._count.taxYear }));
  }

  async exportForCpa(familyOfficeId: string, taxYear: number) {
    const packages = await this.prisma.taxPackage.findMany({
      where: { familyOfficeId, taxYear, status: 'RECEIVED' },
      include: {
        entity: { select: { name: true, type: true } },
      },
    });

    const docs = await this.prisma.document.findMany({
      where: {
        familyOfficeId,
        type: { in: ['K1', 'K-1', 'TAX_K1'] },
        status: { in: ['APPROVED', 'AUTO_APPROVED'] },
      },
      include: {
        fund: { select: { name: true } },
        entity: { select: { name: true } },
      },
    });

    return {
      taxYear,
      exportDate: new Date().toISOString(),
      packages: packages.map((p: any) => ({
        entityName: p.entity.name,
        entityType: p.entity.type,
        receivedDate: p.receivedDate?.toISOString(),
      })),
      documents: docs.map((d: any) => ({
        fileName: d.fileName,
        fundName: d.fund?.name ?? 'N/A',
        entityName: d.entity?.name ?? 'N/A',
        extractedFields: d.extractedFields,
      })),
    };
  }
}
