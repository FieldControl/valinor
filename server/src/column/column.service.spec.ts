import { Test, TestingModule } from '@nestjs/testing';
import { ColumnService } from './column.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ColumnService', () => {
  let service: ColumnService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockColumn = {
    sr_id: 1,
    vc_name: 'To Do',
    fk_boardId: 1,
    it_position: 1,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      column: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ColumnService>(ColumnService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a column as the first one when board has no columns', async () => {
      const input = { name: 'To Do', boardId: 1 };

      prismaService.column.aggregate.mockResolvedValue({
        _max: { it_position: null },
        _count: null,
        _avg: null,
        _min: null,
        _sum: null,
      });
      prismaService.column.create.mockResolvedValue(mockColumn);

      const result = await service.create(input);

      expect(result).toEqual({
        id: mockColumn.sr_id,
        name: mockColumn.vc_name,
        boardId: mockColumn.fk_boardId,
        position: mockColumn.it_position,
      });

      expect(prismaService.column.create).toHaveBeenCalledWith({
        data: {
          vc_name: input.name,
          fk_boardId: input.boardId,
          it_position: 1,
        },
      });
    });

    it('should create a column with incremented position', async () => {
      const input = { name: 'In Progress', boardId: 1 };
      const newColumn = { ...mockColumn, sr_id: 2, it_position: 3 };

      prismaService.column.aggregate.mockResolvedValue({
        _max: { it_position: 2 },
        _count: null,
        _avg: null,
        _min: null,
        _sum: null,
      });
      prismaService.column.create.mockResolvedValue(newColumn);

      const result = await service.create(input);

      expect(result.position).toBe(3);
      expect(prismaService.column.create).toHaveBeenCalledWith({
        data: {
          vc_name: input.name,
          fk_boardId: input.boardId,
          it_position: 3,
        },
      });
    });
  });

  describe('update', () => {
    it('should update column name', async () => {
      const updateInput = { name: 'Updated Name' };
      const updatedColumn = { ...mockColumn, vc_name: updateInput.name };

      prismaService.column.update.mockResolvedValue(updatedColumn);

      const result = await service.update(1, updateInput);

      expect(result.name).toBe(updateInput.name);
      expect(prismaService.column.update).toHaveBeenCalledWith({
        where: { sr_id: 1 },
        data: {
          vc_name: updateInput.name,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a column', async () => {
      prismaService.column.delete.mockResolvedValue(mockColumn);

      const result = await service.remove(1);

      expect(result).toEqual({
        id: mockColumn.sr_id,
        name: mockColumn.vc_name,
        boardId: mockColumn.fk_boardId,
        position: mockColumn.it_position,
      });

      expect(prismaService.column.delete).toHaveBeenCalledWith({
        where: { sr_id: 1 },
      });
    });
  });
});
