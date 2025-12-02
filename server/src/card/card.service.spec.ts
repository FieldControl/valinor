import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { CardService } from './card.service.js';
import { PrismaService } from '../../prisma.service.js';

const mockPrisma = {
  card: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('CardService', () => {
  let service: CardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('deve criar um card vinculado a uma coluna', async () => {
      const dto = { title: 'Tarefa Teste', columnId: 10 };
      const expected = {
        id: 1,
        title: 'Tarefa Teste',
        columnId: 10,
        isArchived: false,
      };

      (prisma.card.create as jest.Mock<any>).mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          columnId: dto.columnId,
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar o columnId do card', async () => {
      const input = { id: 1, columnId: 99 };
      const expected = { id: 1, title: 'Card', columnId: 99 };

      (prisma.card.update as jest.Mock<any>).mockResolvedValue(expected);

      await service.update(input.id, input);

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          id: 1,
          columnId: 99,
        },
      });
    });
  });
});
