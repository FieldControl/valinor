import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from '../cards/cards.service';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnsService } from '../columns/columns.service';
import { Card } from '@prisma/client';

describe('CardsService', () => {
  let service: CardsService;
  let prisma: PrismaService;
  let columnsService: ColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsService, PrismaService, ColumnsService],
    }).compile();

    service = module.get(CardsService);
    prisma = module.get(PrismaService);
    columnsService = module.get(ColumnsService);
  });

  it('deve criar card', async () => {
    const now = new Date();

    jest.spyOn(columnsService, 'findOne').mockResolvedValue({
      id: 1,
      title: 'Coluna X',
      order: 0,
      createdAt: now,
      updatedAt: now,
      cards: [],
    });

    const fakeCard: Card = {
      id: 1,
      columnId: 1,
      title: 'Tarefa',
      description: null,
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    jest.spyOn(prisma.card, 'create').mockResolvedValue(fakeCard);

    const card = await service.create({
      title: 'Tarefa',
      order: 0,
      columnId: 1,
    });
    expect(card.title).toBe('Tarefa');
    expect(card.columnId).toBe(1);
  });
});
