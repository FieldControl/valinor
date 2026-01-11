import { PrismaService } from '../../prisma.service.js';

import { Injectable } from '@nestjs/common';

import { CreateColumnInput } from './dto/create-column.input.js';
import { UpdateColumnInput } from './dto/update-column.input.js';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  create(createColumnInput: CreateColumnInput) {
    return this.prisma.column.create({
      data: {
        title: createColumnInput.title,
        board: {
          connect: { id: createColumnInput.boardId },
        },
      },
    });
  }

  findAll() {
    return this.prisma.column.findMany({
      include: {
        cards: {
          where: { isArchived: false },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.column.findUnique({
      where: { id: id, isArchived: false },
    });
  }

  update(id: number, updateColumnInput: UpdateColumnInput) {
    return this.prisma.column.update({
      where: { id },
      data: updateColumnInput,
    });
  }

  remove(id: number) {
    return this.prisma.column.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
