import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getUpcoming(familyOfficeId: string) {
    const events = await this.prisma.capitalEvent.findMany({
      where: {
        type: 'CALL',
        holding: { entity: { familyOfficeId } },
        dueDate: { gte: new Date() },
      },
      include: {
        holding: { include: { fund: true, entity: true } },
        wireInstruction: true,
        document: { select: { id: true, fileName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return events.map((e: any) => ({
      id: e.id,
      fundName: e.holding.fund.name,
      entityName: e.holding.entity.name,
      amount: e.amount.toString(),
      currency: e.currency,
      eventDate: e.eventDate.toISOString(),
      dueDate: e.dueDate?.toISOString() ?? null,
      status: e.status,
      wireStatus: e.wireInstruction?.wireStatus ?? null,
      wireInstruction: e.wireInstruction
        ? {
            id: e.wireInstruction.id,
            bankName: e.wireInstruction.bankName,
            accountNumber: e.wireInstruction.accountNumber
              ? `****${e.wireInstruction.accountNumber.slice(-4)}`
              : null,
            reference: e.wireInstruction.reference,
            wireStatus: e.wireInstruction.wireStatus,
            wiredAt: e.wireInstruction.wiredAt?.toISOString() ?? null,
            confirmedAt: e.wireInstruction.confirmedAt?.toISOString() ?? null,
          }
        : null,
      document: e.document,
    }));
  }

  async getPast(familyOfficeId: string, limit = 20) {
    const events = await this.prisma.capitalEvent.findMany({
      where: {
        type: 'CALL',
        holding: { entity: { familyOfficeId } },
        dueDate: { lt: new Date() },
      },
      include: {
        holding: { include: { fund: true, entity: true } },
        wireInstruction: true,
      },
      orderBy: { dueDate: 'desc' },
      take: limit,
    });

    return events.map((e: any) => ({
      id: e.id,
      fundName: e.holding.fund.name,
      entityName: e.holding.entity.name,
      amount: e.amount.toString(),
      currency: e.currency,
      dueDate: e.dueDate?.toISOString() ?? null,
      status: e.status,
      wireStatus: e.wireInstruction?.wireStatus ?? null,
    }));
  }

  async markWired(
    capitalEventId: string,
    familyOfficeId: string,
    actorId: string,
  ) {
    const event = await this.prisma.capitalEvent.findFirst({
      where: { id: capitalEventId, holding: { entity: { familyOfficeId } } },
      include: { wireInstruction: true },
    });
    if (!event) throw new Error('Capital event not found');

    let wire = event.wireInstruction;
    if (!wire) {
      wire = await this.prisma.wireInstruction.create({
        data: { capitalEventId, wireStatus: 'WIRED', wiredAt: new Date() },
      });
    } else {
      wire = await this.prisma.wireInstruction.update({
        where: { id: wire.id },
        data: { wireStatus: 'WIRED', wiredAt: new Date() },
      });
    }

    await this.audit.log({
      familyOfficeId,
      action: 'WIRE_MARKED',
      entityType: 'CapitalEvent',
      entityId: capitalEventId,
      actorId,
      actorType: 'USER',
      after: { wireStatus: 'WIRED' },
    });

    return { success: true, wireStatus: wire.wireStatus };
  }

  async confirmWire(
    capitalEventId: string,
    familyOfficeId: string,
    actorId: string,
  ) {
    const event = await this.prisma.capitalEvent.findFirst({
      where: { id: capitalEventId, holding: { entity: { familyOfficeId } } },
      include: { wireInstruction: true },
    });
    if (!event) throw new Error('Capital event not found');
    if (!event.wireInstruction)
      throw new Error('No wire instruction found — mark as wired first');

    await this.prisma.wireInstruction.update({
      where: { id: event.wireInstruction.id },
      data: { wireStatus: 'CONFIRMED', confirmedAt: new Date() },
    });

    await this.prisma.capitalEvent.update({
      where: { id: capitalEventId },
      data: { status: 'COMPLETED' },
    });

    await this.audit.log({
      familyOfficeId,
      action: 'WIRE_CONFIRMED',
      entityType: 'CapitalEvent',
      entityId: capitalEventId,
      actorId,
      actorType: 'USER',
      after: { wireStatus: 'CONFIRMED' },
    });

    return { success: true, wireStatus: 'CONFIRMED' };
  }

  async addWireInstruction(
    capitalEventId: string,
    familyOfficeId: string,
    data: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      abaRouting?: string;
      swiftBic?: string;
      currency?: string;
      reference?: string;
    },
  ) {
    const event = await this.prisma.capitalEvent.findFirst({
      where: { id: capitalEventId, holding: { entity: { familyOfficeId } } },
    });
    if (!event) throw new Error('Capital event not found');

    return this.prisma.wireInstruction.upsert({
      where: { capitalEventId },
      create: { capitalEventId, ...data },
      update: data,
    });
  }
}
