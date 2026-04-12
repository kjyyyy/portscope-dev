import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async listEntities(familyOfficeId: string) {
    return this.prisma.entity.findMany({
      where: { familyOfficeId },
      include: {
        children: true,
        holdings: { include: { fund: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getEntity(id: string, familyOfficeId: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id, familyOfficeId },
      include: {
        children: true,
        parent: true,
        holdings: { include: { fund: true } },
      },
    });

    if (!entity) throw new NotFoundException('Entity not found');
    return entity;
  }

  async createEntity(
    familyOfficeId: string,
    name: string,
    type: any,
    parentId?: string,
  ) {
    return this.prisma.entity.create({
      data: { familyOfficeId, name, type, parentId },
    });
  }
}
