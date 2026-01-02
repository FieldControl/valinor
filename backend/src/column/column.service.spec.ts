import { Test, TestingModule } from '@nestjs/testing';
import { ColumnService } from './column.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from 'src/prisma/prisma.service.mock';
import { CreateColumnDto } from './dto/create-column.dto';
import { Column } from 'generated/prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReorderColumnDto } from './dto/reorder-column.dto';
import { EventsGateway } from 'src/gateways/events/events.gateway';
import { mockEventsGateway } from 'src/gateways/events/events.gateway.mock';

describe('ColumnService', () => {
  let service: ColumnService;
  let prisma: PrismaService;
  let eventsGateway: EventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<ColumnService>(ColumnService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.resetAllMocks();
  });

  it('Deve criar um serviço de coluna', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Deve criar uma coluna com posição 0 quando não existirem colunas', async () => {
      const createColumnDto: CreateColumnDto = { name: 'To Do' };

      mockPrismaService.column.findFirst.mockResolvedValue(null);

      const expectedColumn = {
        id: 1,
        name: 'To Do',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.column.create.mockResolvedValue(expectedColumn);

      const result = await service.create(createColumnDto);

      expect(mockPrismaService.column.findFirst).toHaveBeenCalledWith({
        orderBy: { position: 'desc' },
      });

      expect(mockPrismaService.column.create).toHaveBeenCalledWith({
        data: {
          ...createColumnDto,
          position: 0,
        },
      });

      expect(result).toEqual(expectedColumn);
    });

    it('Deve criar uma coluna com posição correta quando existirem colunas', async () => {
      const createColumnDto: CreateColumnDto = {
        name: 'In Progress',
      };

      mockPrismaService.column.findFirst.mockResolvedValue({
        id: 1,
        position: 1,
        name: 'To Do',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const expectedColumn = {
        id: 2,
        name: 'In Progress',
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.column.create.mockResolvedValue(expectedColumn);

      const result = await service.create(createColumnDto);

      expect(mockPrismaService.column.findFirst).toHaveBeenCalledWith({
        orderBy: { position: 'desc' },
      });

      expect(mockPrismaService.column.create).toHaveBeenCalledWith({
        data: {
          ...createColumnDto,
          position: 2,
        },
      });

      expect(result).toEqual(expectedColumn);
    });
  });

  describe('findAllWithCards', () => {
    it('Deve retornar todas as colunas ordenadas pela posição crescrente, incluindo os cards ordenados pela posição crescente', async () => {
      const mockDate = new Date();
      const expectedColumns = [
        {
          id: 1,
          name: 'A Fazer',
          position: 1,
          createdAt: mockDate,
          updatedAt: mockDate,
          cards: [
            {
              id: 1,
              name: 'Estudar NestJS',
              description: 'Concluir o curso de NestJS',
              columnId: 1,
              position: 1,
              createdAt: mockDate,
              updatedAt: mockDate,
            },
          ],
        },
        {
          id: 2,
          name: 'Fazendo',
          position: 2,
          createdAt: mockDate,
          updatedAt: mockDate,
          cards: [
            {
              id: 2,
              name: 'Estudar TypeScript',
              description: 'Concluir o curso de TypeScript',
              columnId: 2,
              position: 1,
              createdAt: mockDate,
              updatedAt: mockDate,
            },
            {
              id: 3,
              name: 'Estudar Jest',
              description: 'Concluir o curso de Jest',
              columnId: 2,
              position: 2,
              createdAt: mockDate,
              updatedAt: mockDate,
            },
          ],
        },
      ];

      mockPrismaService.column.findMany.mockResolvedValue(expectedColumns);

      const result = await service.findAllWithCards();

      expect(mockPrismaService.column.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
        include: {
          cards: { orderBy: { position: 'asc' } },
        },
      });

      expect(result).toEqual(expectedColumns);
    });

    it('Deve retornar um array vazio quando não existirem colunas', async () => {
      mockPrismaService.column.findMany.mockResolvedValue([]);

      const result = await service.findAllWithCards();

      expect(mockPrismaService.column.findMany).toHaveBeenCalledWith({
        orderBy: {
          position: 'asc',
        },
        include: {
          cards: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('Deve retornar a coluna quando ela existir', async () => {
      const mockColumn: Column = {
        id: 1,
        name: 'To Do',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.column.findUnique.mockResolvedValue(mockColumn);

      const result = await service.findOne(mockColumn.id);

      expect(mockPrismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: mockColumn.id },
      });

      expect(result).toEqual(mockColumn);
    });

    it('Deve lançar NotFoundException quando a coluna não existir', async () => {
      mockPrismaService.column.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('A coluna não existe.'),
      );
    });
  });

  describe('reorderColumn', () => {
    it('Deve atualizar as posições das colunas', async () => {
      const reorderColumnDto: ReorderColumnDto[] = [
        {
          id: 1,
          position: 2,
        },
        {
          id: 2,
          position: 1,
        },
        {
          id: 3,
          position: 3,
        },
      ];
      const dateMock = new Date();
      const mockColumns = [
        {
          id: 1,
          name: 'Column 1',
          position: 1,
          createdAt: dateMock,
          updatedAt: dateMock,
        },
        {
          id: 2,
          name: 'Column 2',
          position: 2,
          createdAt: dateMock,
          updatedAt: dateMock,
        },
        {
          id: 3,
          name: 'Column 3',
          position: 3,
          createdAt: dateMock,
          updatedAt: dateMock,
        },
      ];

      mockPrismaService.column.findUnique
        .mockResolvedValueOnce(mockColumns[0])
        .mockResolvedValueOnce(mockColumns[1])
        .mockResolvedValueOnce(mockColumns[2]);

      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockColumns[0], position: 2 },
        { ...mockColumns[1], position: 1 },
        { ...mockColumns[2], position: 3 },
      ]);

      await service.reorderColumn(reorderColumnDto);

      expect(mockPrismaService.column.findUnique).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.column.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
      });
      expect(mockPrismaService.column.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 2 },
      });
      expect(mockPrismaService.column.findUnique).toHaveBeenNthCalledWith(3, {
        where: { id: 3 },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('Deve lançar BadRequestException quando houver ids duplicados', async () => {
      const reorderColumnDto: ReorderColumnDto[] = [
        {
          id: 1,
          position: 2,
        },
        {
          id: 1,
          position: 1,
        },
      ];

      await expect(service.reorderColumn(reorderColumnDto)).rejects.toThrow(
        new BadRequestException('Ids duplicados não são permitidos.'),
      );
    });

    it('Deve lançar BadRequestException quando hover posições duplicadas', async () => {
      const reorderColumnDto: ReorderColumnDto[] = [
        {
          id: 1,
          position: 2,
        },
        {
          id: 2,
          position: 2,
        },
      ];

      await expect(service.reorderColumn(reorderColumnDto)).rejects.toThrow(
        new BadRequestException('Posições duplicadas não são permitidos.'),
      );
    });

    it('Deve lançar NotFoundException quando alguma coluna não for encontrada', async () => {
      const reorderColumnDto: ReorderColumnDto[] = [
        {
          id: 1,
          position: 2,
        },
        {
          id: 2,
          position: 1,
        },
      ];

      const mockColumn: Column = {
        id: 1,
        name: 'Column 1',
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.column.findUnique
        .mockResolvedValueOnce(mockColumn)
        .mockResolvedValueOnce(null);

      await expect(service.reorderColumn(reorderColumnDto)).rejects.toThrow(
        new NotFoundException('A coluna não existe.'),
      );
    });
  });

  describe('update', () => {
    it('Deve atualizar a coluna quando ela existir', async () => {
      const updateColumnDto = { name: 'Updated Column' };

      const mockColumn: Column = {
        id: 1,
        name: 'Column 1',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.column.findUnique.mockResolvedValue(mockColumn);
      mockPrismaService.column.update.mockResolvedValue({
        ...mockColumn,
        ...updateColumnDto,
      });

      const result = await service.update(mockColumn.id, updateColumnDto);

      expect(mockPrismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: mockColumn.id },
      });

      expect(result).toEqual({ ...mockColumn, ...updateColumnDto });
    });

    it('Deve lançar NotFoundException quando a coluna não existir', async () => {
      const updateColumnDto = { name: 'Updated Column' };

      mockPrismaService.column.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateColumnDto)).rejects.toThrow(
        new NotFoundException('A coluna não existe.'),
      );
    });
  });

  describe('remove', () => {
    it('Deve remover a coluna quando ela existir', async () => {
      const mockColumn: Column = {
        id: 1,
        name: 'Column 1',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.column.findUnique.mockResolvedValue(mockColumn);
      mockPrismaService.column.delete.mockResolvedValue(mockColumn);

      const result = await service.remove(mockColumn.id);

      expect(mockPrismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: mockColumn.id },
      });

      expect(mockPrismaService.column.delete).toHaveBeenCalledWith({
        where: { id: mockColumn.id },
      });

      expect(result).toEqual(mockColumn);
    });

    it('Deve lançar NotFoundException quando a coluna não existir', async () => {
      mockPrismaService.column.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('A coluna não existe.'),
      );
    });
  });
});
