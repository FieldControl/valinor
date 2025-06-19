import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CardsService', () => {
  let service: CardsService;
  let prisma: PrismaService;

  const mockPrisma = {
    card: {
      create: jest.fn(),
      findMany: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a card', async () => {
      const dto = { content: 'Test card', columnId: 1 };
      mockPrisma.card.create.mockResolvedValue(dto);

      const result = await service.create(dto);
      expect(result).toEqual(dto);
      expect(mockPrisma.card.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of cards', async () => {
      const cards = [{ id: 1, content: 'Card 1', columnId: 1 }];
      mockPrisma.card.findMany.mockResolvedValue(cards);

      const result = await service.findAll();
      expect(result).toEqual(cards);
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith({
        include: { column: true },
      });
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const id = 1;
      const dto = { content: 'Updated card' };
      const updatedCard = { id, ...dto, columnId: 1 };
      mockPrisma.card.update.mockResolvedValue(updatedCard);

      const result = await service.update(id, dto);
      expect(result).toEqual(updatedCard);
      expect(mockPrisma.card.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a card', async () => {
      const id = 1;
      const deletedCard = { id, content: 'Card to delete', columnId: 1 };
      mockPrisma.card.delete.mockResolvedValue(deletedCard);

      const result = await service.remove(id);
      expect(result).toEqual(deletedCard);
      expect(mockPrisma.card.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});