import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

describe('ColumnsController', () => {
  let controller: ColumnsController;

  const mockColumnsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updatePositions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [
        {
          provide: ColumnsService,
          useValue: mockColumnsService,
        },
      ],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new column', async () => {
      const createColumnDto: CreateColumnDto = {
        title: 'Test Column',
        description: 'Test Description',
        color: '#3B82F6',
      };

      const mockColumn = {
        id: 1,
        ...createColumnDto,
        position: 0,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockColumnsService.create.mockResolvedValue(mockColumn);

      const result = await controller.create(createColumnDto);

      expect(mockColumnsService.create).toHaveBeenCalledWith(createColumnDto);
      expect(result).toEqual(mockColumn);
    });
  });

  describe('findAll', () => {
    it('should return all columns', async () => {
      const mockColumns = [
        {
          id: 1,
          title: 'Column 1',
          position: 0,
          cards: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Column 2',
          position: 1,
          cards: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockColumnsService.findAll.mockResolvedValue(mockColumns);

      const result = await controller.findAll();

      expect(mockColumnsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockColumns);
    });
  });

  describe('findOne', () => {
    it('should return a column by id', async () => {
      const mockColumn = {
        id: 1,
        title: 'Test Column',
        position: 0,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockColumnsService.findOne.mockResolvedValue(mockColumn);

      const result = await controller.findOne(1);

      expect(mockColumnsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockColumn);
    });
  });

  describe('update', () => {
    it('should update a column', async () => {
      const updateColumnDto: UpdateColumnDto = {
        title: 'Updated Column',
        description: 'Updated Description',
      };

      const mockUpdatedColumn = {
        id: 1,
        ...updateColumnDto,
        position: 0,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockColumnsService.update.mockResolvedValue(mockUpdatedColumn);

      const result = await controller.update(1, updateColumnDto);

      expect(mockColumnsService.update).toHaveBeenCalledWith(
        1,
        updateColumnDto
      );
      expect(result).toEqual(mockUpdatedColumn);
    });
  });

  describe('remove', () => {
    it('should remove a column', async () => {
      mockColumnsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(mockColumnsService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe('updatePositions', () => {
    it('should update positions of multiple columns', async () => {
      const positionUpdates = [
        { id: 1, position: 1 },
        { id: 2, position: 0 },
        { id: 3, position: 2 },
      ];

      const mockUpdatedColumns = [
        { id: 1, title: 'Column 1', position: 1 },
        { id: 2, title: 'Column 2', position: 0 },
        { id: 3, title: 'Column 3', position: 2 },
      ];

      mockColumnsService.updatePositions.mockResolvedValue(mockUpdatedColumns);

      const result = await controller.updatePositions(positionUpdates);

      expect(mockColumnsService.updatePositions).toHaveBeenCalledWith(
        positionUpdates
      );
      expect(result).toEqual(mockUpdatedColumns);
    });
  });
});
