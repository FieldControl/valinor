import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardInput } from './dto/create.input';
import { UpdateBoardInput } from './dto/update.input';
import { Board } from '@prisma/client';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async findAllBoards(): Promise<Board[]> {
    return this.prisma.board.findMany();
  }

  async findBoardById(id: number): Promise<Board | null> {
    return this.prisma.board.findUnique({
      where: { id },
    });
  }

  async createBoard(createBoardInput: CreateBoardInput): Promise<Board> {
    return this.prisma.board.create({
      data: createBoardInput,
    });
  }

  async updateBoard(
    id: number,
    updateBoardInput: UpdateBoardInput,
  ): Promise<Board> {
    return this.prisma.board.update({
      where: { id },
      data: updateBoardInput,
    });
  }

  async deleteBoard(id: number): Promise<boolean> {
    const board = await this.prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException(`Board with id ${id} not found`);
    }

    await this.prisma.board.delete({
      where: { id },
    });

    return true;
  }
}
