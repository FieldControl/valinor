import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
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

  create(dto: CreateColumnDto) {
    return this.prisma.column.create({ data: dto });
  }

  async update(id: number, dto: UpdateColumnDto) {
    await this.findOne(id);
    return this.prisma.column.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number): Promise<void> {
    // lança NotFound se não existir
    await this.findOne(id);

    // delete cards relacionados
    await this.prisma.card.deleteMany({
      where: { columnId: id },
    });

    // delete a coluna
    await this.prisma.column.delete({
      where: { id },
    });
  }
}
