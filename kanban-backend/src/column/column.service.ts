import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Column } from './column.entity';
import { UpdateColumnInput } from './dto/update.input';
import { CreateColumnInput } from './dto/create.input';

@Injectable()
export class ColumnService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllColumn(): Promise<Column[]> {
    return this.prisma.column.findMany({
      include: {
        cards: true,
        board: true,
      },
    });
  }

  async findColumnById(id: number): Promise<Column> {
    return this.prisma.column.findUnique({
      where: { id },
      include: {
        cards: true,
        board: true,
      },
    });
  }

  async createColumn(data: CreateColumnInput): Promise<Column> {
    return this.prisma.column.create({
      data: {
        name: data.name,
        position: data.position,
        board: { connect: { id: data.boardId } },
      },
    });
  }

  async updateColumn(
    id: number,
    updateColumnInput: UpdateColumnInput,
  ): Promise<Column> {
    return this.prisma.column.update({
      where: { id },
      data: updateColumnInput,
    });
  }

  async deleteColumn(id: number) {
    const column = await this.prisma.column.findUnique({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException(`Column with id ${id} not found`);
    }

    await this.prisma.column.delete({
      where: { id },
    });

    return true;
  }
}
