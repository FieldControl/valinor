import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from '../cards.service';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { Card } from '@prisma/client';

describe('CardsService', () => {
  let service: CardsService;
  let prisma: PrismaService;

  const mockPrisma = {
    card: {
      findFirst: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar card com posição correta quando já existem cards', async () => {
      const dto: CreateCardDto = { title: 'Card1', columnId: 1 };

      mockPrisma.card.findFirst.mockResolvedValue({ position: 2 } as Partial<Card>);
      mockPrisma.card.create.mockResolvedValue({
        id: 1,
        ...dto,
        position: 3,
      } as Card);

      const result = await service.create(dto);

      expect(mockPrisma.card.findFirst).toHaveBeenCalledWith({
        select: { position: true },
        orderBy: { position: 'desc' },
      });
      expect(mockPrisma.card.create).toHaveBeenCalledWith({
        data: { ...dto, position: 3 },
      });
      expect(result.position).toBe(3);
    });

    it('deve criar card na posição 1 quando não há cards', async () => {
      const dto: CreateCardDto = { title: 'CardInicial', columnId: 1 };

      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.card.create.mockResolvedValue({
        id: 1,
        ...dto,
        position: 1,
      } as Card);

      const result = await service.create(dto);

      expect(mockPrisma.card.create).toHaveBeenCalledWith({
        data: { ...dto, position: 1 },
      });
      expect(result.position).toBe(1);
    });
  });

  describe('createMany', () => {
    it('deve criar múltiplos cards com posições sequenciais', async () => {
      const input: CreateCardDto[] = [
        { title: 'C1', columnId: 1 },
        { title: 'C2', columnId: 1 },
      ];

      mockPrisma.card.findFirst.mockResolvedValue({ position: 2 } as Partial<Card>);
      mockPrisma.card.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createMany(input);

      expect(mockPrisma.card.createMany).toHaveBeenCalledWith({
        data: [
          { title: 'C1', columnId: 1, position: 3 },
          { title: 'C2', columnId: 1, position: 4 },
        ],
      });

      expect(result).toEqual([
        { title: 'C1', columnId: 1, position: 3 },
        { title: 'C2', columnId: 1, position: 4 },
      ]);
    });

    it('deve iniciar posição em 1 quando não há cards', async () => {
      const input: CreateCardDto[] = [{ title: 'Primeiro', columnId: 1 }];

      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.card.createMany.mockResolvedValue({ count: 1 });

      const result = await service.createMany(input);

      expect(mockPrisma.card.createMany).toHaveBeenCalledWith({
        data: [{ title: 'Primeiro', columnId: 1, position: 1 }],
      });
      expect(result).toEqual([{ title: 'Primeiro', columnId: 1, position: 1 }]);
    });
  });

  describe('update', () => {
    it('deve atualizar card com dados fornecidos', async () => {
      const dto: UpdateCardDto = { title: 'Atualizado' };
      const updated: Partial<Card> = { id: 1, title: 'Atualizado', position: 1 };

      mockPrisma.card.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockPrisma.card.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result).toBe(updated);
    });
  });

  describe('delete', () => {
    it('deve deletar card e retornar mensagem', async () => {
      mockPrisma.card.delete.mockResolvedValue({ id: 1, title: 'Remover', position: 1 } as Card);

      const result = await service.delete(1);

      expect(mockPrisma.card.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Card with ID [1] has been successfully deleted' });
    });
  });
});
