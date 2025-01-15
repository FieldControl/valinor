import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class KanbanService {
  constructor(private prisma: PrismaService) {}

  async createBoard(title: string) {
    return this.prisma.board.create({
      data: {
        title,
      },
    });
  }

  async getBoards() {
    return this.prisma.board.findMany();
  }

  async getBoard(id: string) {
    return this.prisma.board.findUnique({
      where: { id },
    });
  }

  async updateBoard(id: string, title: string) {
    return this.prisma.board.update({
      where: { id },
      data: { title },
    });
  }

  async deleteBoard(id: string) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.card.deleteMany({
          where: {
            column: {
              boardId: id,
            },
          },
        });
        await prisma.column.deleteMany({
          where: {
            boardId: id,
          },
        });
        await prisma.board.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.error('Erro ao excluir board:', error);
      throw error;
    }
  }

  async getColumnsByBoardId(boardId: string) {
    return this.prisma.column.findMany({
      where: { boardId },
      include: {
        cards: true,
      },
    });
  }

  async createColumn(boardId: string, title: string) {
    return this.prisma.column.create({
      data: {
        title,
        boardId,
      },
    });
  }

  async updateColumn(columnId: string, title: string) {
    return this.prisma.column.update({
      where: { id: columnId },
      data: { title },
    });
  }

  async deleteColumn(columnId: string) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.card.deleteMany({
        where: { columnId },
      });
      await prisma.column.delete({
        where: { id: columnId },
      });
    });
  }

  async createCard(columnId: string, description: string) {
    return this.prisma.card.create({
      data: {
        description,
        columnId,
      },
    });
  }

  async getCardById(cardId: string) {
    return this.prisma.card.findUnique({
      where: { id: cardId },
    });
  }

  async updateCard(cardId: string, isCompleted: boolean) {
    return this.prisma.card.update({
      where: { id: cardId },
      data: { isCompleted },
    });
  }

  async deleteCard(cardId: string) {
    return this.prisma.card.delete({
      where: { id: cardId },
    });
  }

  async updateCardDescription(cardId: string, description: string) {
    return this.prisma.card.update({
      where: { id: cardId },
      data: { description },
    });
  }
}
