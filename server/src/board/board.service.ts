import { PrismaService } from '../../prisma.service.js';

import { Injectable } from '@nestjs/common';

import { CreateBoardInput } from './dto/create-board.input.js';
import { UpdateBoardInput } from './dto/update-board.input.js';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  create(createBoardInput: CreateBoardInput) {
    return this.prisma.board.create({
      data: createBoardInput,
    });
  }

  findAll() {
    return this.prisma.board.findMany({
      where: {
        isArchived: false,
      },
      include: {
        columns: {
          where: { isArchived: false },
          include: {
            cards: {
              where: { isArchived: false },
            },
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.board.findUnique({
      where: { id: id, isArchived: false },
      include: {
        columns: {
          where: { isArchived: false },
          include: {
            cards: {
              where: { isArchived: false },
            },
          },
        },
      },
    });
  }

  update(id: number, updateBoardInput: UpdateBoardInput) {
    return this.prisma.board.update({
      where: { id },
      data: updateBoardInput,
    });
  }

  remove(id: number) {
    return this.prisma.board.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
