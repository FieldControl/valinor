import { Test, TestingModule } from '@nestjs/testing';
import { KanbanService } from './kanban.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// Mock do PrismaService para não afetar o banco de dados real durante os testes
const mockPrismaService = {
  column: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  card: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('KanbanService', () => {
  let kanbanService: KanbanService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanbanService, PrismaService],
    }).compile();

    kanbanService = module.get<KanbanService>(KanbanService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(kanbanService).toBeDefined();
  });


  describe('getColumns', () => {
    it('should return an array of columns', async () => {
      mockPrismaService.column.findMany.mockResolvedValue([{ id: 1, title: 'Column 1', cards: [] }]);

      const columns = await kanbanService.getColumns();
      expect(columns).toEqual([{ id: 1, title: 'Column 1', cards: [] }]);
    });
  });

  describe('createColumn', () => {
    it('should create a column successfully', async () => {
      const newColumn = { id: 1, title: 'New Column', cards: [] };
      mockPrismaService.column.findFirst.mockResolvedValue(null); // Garantindo que a coluna não exista
      mockPrismaService.column.create.mockResolvedValue(newColumn);

      const result = await kanbanService.createColumn('New Column');
      expect(result).toEqual(newColumn);
    });

    it('should throw NotFoundException if column title already exists', async () => {
      mockPrismaService.column.findFirst.mockResolvedValue({ id: 1, title: 'New Column' });

      await expect(kanbanService.createColumn('New Column')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateColumn', () => {
    it('should update a column title successfully', async () => {
      const column = { id: 1, title: 'Old Title' };
      const updatedColumn = { id: 1, title: 'Updated Title', cards: [] };

      mockPrismaService.column.findFirst.mockResolvedValue(column);
      mockPrismaService.column.update.mockResolvedValue(updatedColumn);

      const result = await kanbanService.updateColumn(1, 'Updated Title');
      expect(result).toEqual(updatedColumn);
    });

    it('should throw NotFoundException if column not found', async () => {
      mockPrismaService.column.findFirst.mockResolvedValue(null);

      await expect(kanbanService.updateColumn(1, 'Updated Title')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteColumn', () => {
    it('should delete a column successfully', async () => {
      const column = { id: 1, title: 'Column to Delete', cards: [] };
      mockPrismaService.column.findFirst.mockResolvedValue(column);
      mockPrismaService.column.delete.mockResolvedValue(column);
      mockPrismaService.card.deleteMany.mockResolvedValue({ count: 0 });

      const result = await kanbanService.deleteColumn(1);
      expect(result).toEqual({ ...column, cards: [] });
    });

    it('should throw NotFoundException if column not found', async () => {
      mockPrismaService.column.findFirst.mockResolvedValue(null);

      await expect(kanbanService.deleteColumn(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCard', () => {
    it('should create a card successfully', async () => {
      const column = { id: 1, title: 'Column 1', cards: [] };
      const card = { id: 1, title: 'New Card', description: 'Card description', columnId: 1 };
      mockPrismaService.column.findFirst.mockResolvedValue(column);
      mockPrismaService.card.create.mockResolvedValue(card);

      const result = await kanbanService.createCard('New Card', 'Card description', 1);
      expect(result).toEqual({
        ...card,
        column: { id: 1, title: 'Column 1', cards: [] },
      });
    });

    it('should throw NotFoundException if column does not exist', async () => {
      mockPrismaService.column.findFirst.mockResolvedValue(null);

      await expect(kanbanService.createCard('New Card', 'Card description', 1)).rejects.toThrow(NotFoundException);
    });
  });
});
