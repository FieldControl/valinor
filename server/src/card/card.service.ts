import { PrismaService } from '../../prisma.service.js';

import { Injectable } from '@nestjs/common';

import { CreateCardInput } from './dto/create-card.input.js';
import { UpdateCardInput } from './dto/update-card.input.js';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  create(createCardInput: CreateCardInput) {
    return this.prisma.card.create({
      data: createCardInput,
    });
  }

  findAll() {
    return this.prisma.card.findMany({
      where: { isArchived: false },
    });
  }

  findOne(id: number) {
    return this.prisma.card.findUnique({
      where: { id: id, isArchived: false },
    });
  }

  update(id: number, updateCardInput: UpdateCardInput) {
    return this.prisma.card.update({
      where: { id },
      data: updateCardInput,
    });
  }

  remove(id: number) {
    return this.prisma.card.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
