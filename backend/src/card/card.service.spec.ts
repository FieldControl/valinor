import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockPrismaService } from 'src/prisma/prisma.service.mock';
import { ColumnService } from 'src/column/column.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card, Column } from 'generated/prisma/client';
import { NotFoundException } from '@nestjs/common';
import { ReorderCardDto } from './dto/reorder-card-dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { EventsGateway } from 'src/gateways/events/events.gateway';
import { mockEventsGateway } from 'src/gateways/events/events.gateway.mock';

describe('CardService', () => {
  let service: CardService;
  let prisma: PrismaService;
  let columnService: ColumnService;
  let eventsGateway: EventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        ColumnService,
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    prisma = module.get<PrismaService>(PrismaService);
    columnService = module.get<ColumnService>(ColumnService);
    eventsGateway = module.get<EventsGateway>(EventsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Deve criar um card com a posição 0 quando não existirem cards na coluna', async () => {
      const createCardDto: CreateCardDto = {
        name: 'Novo Card',
        description: 'Descrição do novo card',
        columnId: 1,
      };

      const mockColumn: Column = {
        id: 1,
        name: 'To Do',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCard: Card = {
        id: 1,
        name: createCardDto.name,
        description: createCardDto.description ?? '',
        columnId: createCardDto.columnId,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(columnService, 'findOne').mockResolvedValue(mockColumn);
      mockPrismaService.card.findFirst.mockResolvedValue(null);
      mockPrismaService.card.create.mockResolvedValue(mockCard);

      const result = await service.create(createCardDto);

      expect(columnService.findOne).toHaveBeenCalledWith(
        createCardDto.columnId,
      );
      expect(mockPrismaService.card.findFirst).toHaveBeenCalledWith({
        orderBy: { position: 'desc' },
      });
      expect(mockPrismaService.card.create).toHaveBeenCalledWith({
        data: {
          ...createCardDto,
          position: 0,
        },
      });
      expect(result).toEqual(mockCard);
    });

    it('Deve criar um card com posição incrementada quando já existem cards na coluna', async () => {
      const createCardDto: CreateCardDto = {
        name: 'Segundo Card',
        description: 'Descrição do segundo card',
        columnId: 1,
      };

      const mockColumn: Column = {
        id: 1,
        name: 'To Do',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingCard: Card = {
        id: 1,
        name: 'Card Existente',
        description: 'Descrição',
        columnId: 1,
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCard: Card = {
        id: 2,
        name: createCardDto.name,
        description: createCardDto.description ?? '',
        columnId: createCardDto.columnId,
        position: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(columnService, 'findOne').mockResolvedValue(mockColumn);
      mockPrismaService.card.findFirst.mockResolvedValue(existingCard);
      mockPrismaService.card.create.mockResolvedValue(mockCard);

      const result = await service.create(createCardDto);

      expect(columnService.findOne).toHaveBeenCalledWith(
        createCardDto.columnId,
      );
      expect(mockPrismaService.card.findFirst).toHaveBeenCalledWith({
        orderBy: { position: 'desc' },
      });
      expect(mockPrismaService.card.create).toHaveBeenCalledWith({
        data: {
          ...createCardDto,
          position: 3,
        },
      });
      expect(result).toEqual(mockCard);
    });
  });

  describe('findAll', () => {
    it('Deve retornar todos os cards', async () => {
      const mockCards: Card[] = [
        {
          id: 1,
          name: 'Card 1',
          description: 'Descrição do Card 1',
          columnId: 1,
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Card 2',
          description: 'Descrição do Card 2',
          columnId: 1,
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.card.findMany.mockResolvedValue(mockCards);

      const result = await service.findAll();

      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockCards);
    });

    it('Deve retornar um array vazio quando não houver cards', async () => {
      mockPrismaService.card.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('Deve retornar um card pelo ID', async () => {
      const mockCard: Card = {
        id: 1,
        name: 'Card 1',
        description: 'Descrição do Card 1',
        columnId: 1,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(mockCard);

      const result = await service.findOne(mockCard.id);

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledWith({
        where: { id: mockCard.id },
      });
      expect(result).toEqual(mockCard);
    });

    it('Deve lançar NotFoundException quando o card não for encontrado', async () => {
      mockPrismaService.card.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('O card não foi encontrado.'),
      );
    });
  });

  describe('reorderCard', () => {
    it('Deve reordenar os cards da mesma coluna', async () => {
      const reorderCardDto: ReorderCardDto[] = [
        { id: 1, position: 2 },
        { id: 2, position: 1 },
      ];

      const mockCards = [
        {
          id: 1,
          name: 'Card 1',
          description: 'Descrição 1',
          position: 1,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Card 2',
          description: 'Descrição 2',
          position: 2,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.card.findUnique
        .mockResolvedValueOnce(mockCards[0])
        .mockResolvedValueOnce(mockCards[1]);

      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockCards[0], position: 2 },
        { ...mockCards[1], position: 1 },
      ]);

      await service.reorderCard(reorderCardDto);

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.card.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
      });
      expect(mockPrismaService.card.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 2 },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('Deve reordenar os cards de colunas diferentes', async () => {
      const reorderCardDto: ReorderCardDto[] = [
        { id: 1, position: 2, columnId: 2 },
        { id: 2, position: 1, columnId: 1 },
      ];

      const mockCards = [
        {
          id: 1,
          name: 'Card 1',
          description: 'Descrição 1',
          position: 1,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Card 2',
          description: 'Descrição 2',
          position: 2,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockColumns = [
        {
          id: 1,
          name: 'Column 1',
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Column 2',
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.card.findUnique
        .mockResolvedValueOnce(mockCards[0])
        .mockResolvedValueOnce(mockCards[1]);

      mockPrismaService.column.findUnique
        .mockResolvedValueOnce(mockColumns[1])
        .mockResolvedValueOnce(mockColumns[0]);

      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockCards[0], position: 2, columnId: 2 },
        { ...mockCards[1], position: 1, columnId: 1 },
      ]);

      await service.reorderCard(reorderCardDto);

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledTimes(2);

      expect(mockPrismaService.column.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.column.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 2 },
      });
      expect(mockPrismaService.column.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 1 },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('Deve lançar NotFoundException quando o card não for encontrado', async () => {
      const reorderCardDto: ReorderCardDto[] = [{ id: 1, position: 1 }];

      mockPrismaService.card.findUnique.mockResolvedValueOnce(null);

      await expect(service.reorderCard(reorderCardDto)).rejects.toThrow(
        new NotFoundException('O card não foi encontrado.'),
      );
    });
  });

  describe('update', () => {
    it('Deve atualizar um card', async () => {
      const updateCardDto: UpdateCardDto = {
        name: 'Card Atualizado',
        description: 'Descrição Atualizada',
        columnId: 1,
      };

      const mockCard = {
        id: 1,
        name: 'Card Original',
        description: 'Descrição Original',
        position: 1,
        columnId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockColumn = {
        id: 1,
        name: 'Column 1',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCard = {
        ...mockCard,
        ...updateCardDto,
      };

      mockPrismaService.column.findUnique.mockResolvedValue(mockColumn);

      mockPrismaService.card.findUnique.mockResolvedValue(mockCard);

      mockPrismaService.card.update.mockResolvedValue(updatedCard);

      const result = await service.update(1, updateCardDto);

      expect(mockPrismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockPrismaService.card.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateCardDto,
      });

      expect(result).toEqual(updatedCard);
    });

    it('Deve atualizar apenas o nome do card', async () => {
      const updateCardDto: UpdateCardDto = {
        name: 'Novo Nome',
        columnId: 1,
      };

      const mockCard = {
        id: 1,
        name: 'Card Original',
        description: 'Descrição Original',
        position: 1,
        columnId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockColumn = {
        id: 1,
        name: 'Column 1',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCard = {
        ...mockCard,
        name: 'Novo Nome',
      };

      mockPrismaService.column.findUnique.mockResolvedValue(mockColumn);
      mockPrismaService.card.findUnique.mockResolvedValue(mockCard);
      mockPrismaService.card.update.mockResolvedValue(updatedCard);

      const result = await service.update(1, updateCardDto);

      expect(result).toEqual(updatedCard);
    });

    it('Deve lançar NotFoundException quando o card não existir', async () => {
      const updateCardDto: UpdateCardDto = {
        name: 'Card Atualizado',
        columnId: 1,
      };

      const mockColumn = {
        id: 1,
        name: 'Column 1',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.column.findUnique.mockResolvedValue(mockColumn);

      mockPrismaService.card.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateCardDto)).rejects.toThrow(
        new NotFoundException('O card não foi encontrado.'),
      );

      expect(mockPrismaService.card.update).not.toHaveBeenCalled();
    });

    it('Deve lançar NotFoundException quando a coluna não existir', async () => {
      const updateCardDto: UpdateCardDto = {
        name: 'Card Atualizado',
        columnId: 999,
      };

      mockPrismaService.column.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateCardDto)).rejects.toThrow(
        new NotFoundException('A coluna não existe.'),
      );

      expect(mockPrismaService.card.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.card.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('Deve remover um card pelo ID', async () => {
      const mockCard: Card = {
        id: 1,
        name: 'Card a ser removido',
        description: 'Descrição do card',
        columnId: 1,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(mockCard);
      mockPrismaService.card.delete.mockResolvedValue(mockCard);

      await service.remove(1);

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockPrismaService.card.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('Deve lançar NotFoundException quando o card não for encontrado', async () => {
      mockPrismaService.card.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('O card não foi encontrado.'),
      );
    });
  });
});
