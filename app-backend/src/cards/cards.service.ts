// src/cards/cards.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnsService } from '../columns/columns.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private columnsService: ColumnsService,
  ) {}

  findAll() {
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
    return this.prisma.card.create({ data: dto });
  }

  async update(id: number, dto: UpdateCardDto) {
    await this.findOne(id);
    return this.prisma.card.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.card.delete({ where: { id } });
  }

  /**
   * Move um card para outra coluna e posição (order).
   */
  async move(id: number, columnId: number, order: number) {
    // valida existência sem criar variável
    await this.findOne(id);
    await this.columnsService.findOne(columnId);

    return this.prisma.card.update({
      where: { id },
      data: { columnId, order },
    });
  }
}
