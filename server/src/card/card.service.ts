import { Injectable } from '@nestjs/common';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(input: CreateCardInput, userId: number) {
    const card = await this.prismaService.card.create({
      data: {
        vc_name: input.name,
        ...(input.description && { vc_description: input.description }),
        fk_columnId: input.columnId,
        fk_userId: userId,
      },
      include: {
        assignedUser: {
          select: {
            sr_id: true,
            vc_name: true,
          },
        },
      },
    });

    return {
      id: card.sr_id,
      name: card.vc_name,
      description: card.vc_description,
      columnId: card.fk_columnId,
      assignedUserId: card.fk_assignedUserId,
      assignedUserName: card.assignedUser?.vc_name,
      createdAt: card.dt_createdAt,
    };
  }

  async moveCard(cardId: number, columnId: number) {
    const card = await this.prismaService.card.update({
      where: { sr_id: cardId },
      data: { fk_columnId: columnId },
      include: {
        assignedUser: {
          select: {
            sr_id: true,
            vc_name: true,
          },
        },
      },
    });

    return {
      id: card.sr_id,
      name: card.vc_name,
      description: card.vc_description,
      columnId: card.fk_columnId,
      assignedUserId: card.fk_assignedUserId,
      assignedUserName: card.assignedUser?.vc_name,
      createdAt: card.dt_createdAt,
    };
  }


  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  async update(id: number, updateCardInput: UpdateCardInput) {
    const card = await this.prismaService.card.update({
      where: { sr_id: id },
      data: {
        ...(updateCardInput.name && { vc_name: updateCardInput.name }),
        ...(updateCardInput.description !== undefined && { vc_description: updateCardInput.description }),
        ...(updateCardInput.assignedUserId !== undefined && { fk_assignedUserId: updateCardInput.assignedUserId }),
      },
      include: {
        assignedUser: {
          select: {
            sr_id: true,
            vc_name: true,
          },
        },
      },
    });

    return {
      id: card.sr_id,
      name: card.vc_name,
      description: card.vc_description,
      columnId: card.fk_columnId,
      assignedUserId: card.fk_assignedUserId,
      assignedUserName: card.assignedUser?.vc_name,
      createdAt: card.dt_createdAt,
    };
  }

  async remove(id: number) {
    const card = await this.prismaService.card.delete({
      where: { sr_id: id },
    });

    return {
      id: card.sr_id,
      name: card.vc_name,
      description: card.vc_description,
      columnId: card.fk_columnId,
      assignedUserId: card.fk_assignedUserId,
      createdAt: card.dt_createdAt,
    };
  }
}
