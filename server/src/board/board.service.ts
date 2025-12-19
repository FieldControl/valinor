import { Injectable } from '@nestjs/common';
import { CreateBoardInput } from './dto/create-board.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardService {
  constructor(
    private readonly prismaService: PrismaService
  ){}

  async create(createBoardInput: CreateBoardInput, userId: number) {
    return this.prismaService.$transaction(async (tx) => {
    // 1. Cria o board
    const board = await tx.board.create({
      data: {
        vc_name: createBoardInput.name,
      },
    });

    // 2. Cria o vínculo usuário ↔ board
    await tx.userBoard.create({
      data: {
        fk_userId: userId,
        fk_boardId: board.sr_id,
        vc_role: 'admin',
      },
    });

      return {
        id: board.sr_id,
        name: board.vc_name,
        createdAt: board.dt_createdAt
      };
    });
  }
  

  async findBoardsByUser(userId: number) {
    const boards = await this.prismaService.board.findMany({
      where: {
        users:{
          some: { 
            fk_userId: userId
          },
        },
      },
    });
    return boards.map(board => ({
      id: board.sr_id,
      name: board.vc_name,
      createdAt: board.dt_createdAt
    }));
  }

  async findBoardWithColumns(boardId: number) {
    const board = await this.prismaService.board.findUnique({
      where: { sr_id: boardId },
      include: {
        columns: {
          orderBy: { it_position: 'asc' },
          include: {
            cards: {
              include: {
                assignedUser: {
                  select: {
                    sr_id: true,
                    vc_name: true,
                  },
                },
              },
              orderBy: { dt_createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      return null;
    }

    return {
      id: board.sr_id,
      name: board.vc_name,
      createdAt: board.dt_createdAt,
      columns: board.columns.map(column => ({
        id: column.sr_id,
        name: column.vc_name,
        boardId: column.fk_boardId,
        position: column.it_position,
        cards: column.cards.map(card => ({
          id: card.sr_id,
          name: card.vc_name,
          description: card.vc_description,
          columnId: card.fk_columnId,
          assignedUserId: card.fk_assignedUserId,
          assignedUserName: card.assignedUser?.vc_name,
          createdAt: card.dt_createdAt,
        })),
      })),
    };
  }

  async getBoardUsers(boardId: number) {
    const users = await this.prismaService.userBoard.findMany({
      where: { fk_boardId: boardId },
      include: {
        user: {
          select: {
            sr_id: true,
            vc_name: true,
            vc_email: true,
          },
        },
      },
    });

    return users.map(ub => ({
      id: ub.user.sr_id,
      name: ub.user.vc_name,
      email: ub.user.vc_email,
    }));
  }

  async addUserToBoard(boardId: number, email: string, currentUserId: number) {
    // Verificar se o usuário atual é admin do board
    const userBoard = await this.prismaService.userBoard.findFirst({
      where: {
        fk_boardId: boardId,
        fk_userId: currentUserId,
        vc_role: 'admin',
      },
    });

    if (!userBoard) {
      throw new Error('Apenas administradores podem adicionar usuários ao board');
    }

    // Buscar usuário pelo email
    const user = await this.prismaService.user.findUnique({
      where: { vc_email: email },
    });

    if (!user) {
      throw new Error('Usuário não encontrado com este email');
    }

    // Verificar se o usuário já está no board
    const existingUserBoard = await this.prismaService.userBoard.findFirst({
      where: {
        fk_boardId: boardId,
        fk_userId: user.sr_id,
      },
    });

    if (existingUserBoard) {
      throw new Error('Usuário já está neste board');
    }

    // Adicionar usuário ao board
    await this.prismaService.userBoard.create({
      data: {
        fk_boardId: boardId,
        fk_userId: user.sr_id,
        vc_role: 'member',
      },
    });

    return {
      id: user.sr_id,
      name: user.vc_name,
      email: user.vc_email,
    };
  }
}