import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ColumnsService {
  constructor(
    private prisma: PrismaService,
    private gateway: EventsGateway,
  ) {}

  async findAll() {
    return this.prisma.column.findMany({
      include: { cards: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: { cards: true },
    });
    if (!column) throw new NotFoundException('Coluna não encontrada');
    return column;
  }

  async create(dto: CreateColumnDto) {
    const created = await this.prisma.column.create({ data: dto });
    // dispara evento
    this.gateway.server.emit('columnCreated', created);
    return created;
  }

  async update(id: number, dto: UpdateColumnDto) {
    await this.findOne(id);
    const updated = await this.prisma.column.update({
      where: { id },
      data: dto,
    });
    this.gateway.server.emit('columnUpdated', updated);
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    // remove cards filhos
    await this.prisma.card.deleteMany({ where: { columnId: id } });
    // remove a coluna
    await this.prisma.column.delete({ where: { id } });
    this.gateway.server.emit('columnDeleted', { id });
  }
}
