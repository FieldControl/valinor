import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColumnsService {
  constructor(private prismaService: PrismaService) {}

  async create(createColumnDto: CreateColumnDto) {
    const newColumn = await this.prismaService.column.create({
      data: {
        ...createColumnDto,
      },
    });

    return newColumn;
  }

  async findAll() {
    return this.prismaService.column.findMany({
      include: {
        tasks: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(columnId: string) {
    const column = await this.prismaService.column.findUnique({
      where: {
        id: columnId,
      },
    });

    if (!column) throw new NotFoundException('column not found');

    return column;
  }

  async update(columnId: string, updateColumnDto: UpdateColumnDto) {
    await this.findOne(columnId);

    const updatedColumn = await this.prismaService.column.update({
      where: {
        id: columnId,
      },
      data: {
        ...updateColumnDto,
      },
    });

    return updatedColumn;
  }

  async remove(columnId: string) {
    await this.findOne(columnId);

    await this.prismaService.column.delete({
      where: {
        id: columnId,
      },
    });
  }
}
