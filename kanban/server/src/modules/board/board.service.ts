import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BoardDTO } from './board.dto';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaClient) {}

  async findAllBoards() {
    return await this.prisma.board.findMany({
      include: {
        columns: true,
      },
    });
  }

  async getBoardById(id: string) {
    const boardExists = await this.prisma.board.findUnique({
      where: {
        id,
      },
    });

    if (!boardExists) {
      throw new NotFoundException('Board not found');
    }
    return this.prisma.board.findUnique({
      where: {
        id,
      },
      include: {
        columns: {
          include: {
            tasks: true,
          },
        },
      },
    });
  }

  async createBoard(data: BoardDTO) {
    const board = await this.prisma.board.create({
      data,
    });
    return board;
  }

  async updateBoard(id: string, data: BoardDTO) {
    const boardExists = await this.prisma.board.findUnique({
      where: {
        id,
      },
    });

    if (!boardExists) {
      throw new NotFoundException('Board not found');
    }
    return await this.prisma.board.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteBoard(id: string) {
    const boardExists = await this.prisma.board.findUnique({
      where: {
        id,
      },
    });

    if (!boardExists) {
      throw new NotFoundException('Board not found');
    }

    return await this.prisma.board.delete({
      where: {
        id,
      },
    });
  }
}
