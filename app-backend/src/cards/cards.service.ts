import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnsService } from '../columns/columns.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private columnsService: ColumnsService,
    private gateway: EventsGateway,
  ) {}

  async findAll() {
    return this.prisma.card.findMany({
      include: { column: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card não encontrado');
    return card;
  }

  async create(dto: CreateCardDto) {
    await this.columnsService.findOne(dto.columnId);
    const created = await this.prisma.card.create({ data: dto });
    this.gateway.server.emit('cardCreated', created);
    return created;
  }

  async update(id: number, dto: UpdateCardDto) {
    await this.findOne(id);
    const updated = await this.prisma.card.update({
      where: { id },
      data: dto,
    });
    this.gateway.server.emit('cardUpdated', updated);
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.card.delete({ where: { id } });
    this.gateway.server.emit('cardDeleted', { id });
  }

  /**
   * Move um card para outra coluna e posição (order).
   */
  async move(id: number, columnId: number, order: number) {
    await this.findOne(id);
    await this.columnsService.findOne(columnId);
    const moved = await this.prisma.card.update({
      where: { id },
      data: { columnId, order },
    });
    this.gateway.server.emit('cardMoved', moved);
    return moved;
  }
}
