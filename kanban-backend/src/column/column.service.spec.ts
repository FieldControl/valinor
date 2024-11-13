import { Test, TestingModule } from '@nestjs/testing';
import { ColumnService } from './column.service';
import { PrismaService } from '../prisma/prisma.service';
import TestUtil from '../common/util/TestUtil';

describe('ColumnService', () => {
  let service: ColumnService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnService,
        {
          provide: PrismaService,
          useValue: {
            column: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ColumnService>(ColumnService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('create', () => {
    it('should create a column successfully', async () => {
      const column = TestUtil.giveMeAvalidColumn();
      prisma.column.create = jest.fn().mockResolvedValue(column);

      const createdColumn = await service.createColumn({
        name: column.name,
        position: column.position,
        boardId: column.boardId,
      });

      expect(createdColumn).toMatchObject(column);
      expect(prisma.column.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a column by id', async () => {
      const column = TestUtil.giveMeAvalidColumn();
      prisma.column.findUnique = jest.fn().mockResolvedValue(column);

      const foundColumn = await service.findColumnById(column.id);

      expect(foundColumn).toMatchObject(column);
      expect(prisma.column.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception if column not found', async () => {
      prisma.column.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findColumnById(999)).rejects.toThrowError(
        `Column with ID 999 not found`,
      );
      expect(prisma.column.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of columns', async () => {
      const column = TestUtil.giveMeAvalidColumn();
      prisma.column.findMany = jest.fn().mockResolvedValue([column, column]);

      const columns = await service.findAllColumn();

      expect(columns).toHaveLength(2);
      expect(prisma.column.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a column successfully', async () => {
      const column = TestUtil.giveMeAvalidColumn();
      const updatedColumn = { ...column, name: 'Updated Name' };
      prisma.column.update = jest.fn().mockResolvedValue(updatedColumn);

      const result = await service.updateColumn(column.id, {
        name: 'Updated Name',
      });

      expect(result).toMatchObject(updatedColumn);
      expect(prisma.column.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception if column to update not found', async () => {
      prisma.column.update = jest
        .fn()
        .mockRejectedValue(new Error('Column not found'));

      await expect(
        service.updateColumn(999, { name: 'Updated Name' }),
      ).rejects.toThrow(`Column with ID 999 not found`);
      expect(prisma.column.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a column successfully', async () => {
      const column = TestUtil.giveMeAvalidColumn();
      prisma.column.findUnique = jest.fn().mockResolvedValue(column);
      prisma.column.delete = jest.fn().mockResolvedValue(column);

      const deletedColumn = await service.deleteColumn(column.id);

      expect(deletedColumn).toBe(true);
      expect(prisma.column.delete).toHaveBeenCalledWith({
        where: { id: column.id },
      });
    });

    it('should throw an exception if column to delete not found', async () => {
      prisma.column.delete = jest
        .fn()
        .mockRejectedValue(new Error('Column not found'));

      await expect(service.deleteColumn(999)).rejects.toThrow(
        `Column with ID 999 not found`,
      );
      expect(prisma.column.delete).toHaveBeenCalledTimes(1);
    });
  });
});
