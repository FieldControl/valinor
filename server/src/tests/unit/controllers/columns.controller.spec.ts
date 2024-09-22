import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ColumnsController } from '../../../columns/columns.controller';
import { ColumnsService } from '../../../columns/columns.service';

// mocks
import {
  columnMock,
  updatedColumnMock,
  createColumnDto,
  updateColumnDto,
} from '../../mocks/columns.mocks';

describe('ColumnsController tests', () => {
  let columnsController: ColumnsController;

  const mockColumnsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ColumnsController],
      providers: [
        {
          provide: ColumnsService,
          useValue: mockColumnsService,
        },
      ],
    }).compile();

    columnsController = testModule.get<ColumnsController>(ColumnsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create method', () => {
    it('should create a new task', async () => {
      jest.spyOn(mockColumnsService, 'create').mockResolvedValue(columnMock);

      const response = await columnsController.create(createColumnDto);

      expect(response).toEqual(columnMock);
      expect(mockColumnsService.create).toHaveBeenCalledTimes(1);
      expect(mockColumnsService.create).toHaveBeenCalledWith(createColumnDto);
    });
  });

  describe('findAll method', () => {
    it('should return an array of tasks', async () => {
      jest.spyOn(mockColumnsService, 'findAll').mockResolvedValue([columnMock]);

      const response = await columnsController.findAll();

      expect(response).toEqual([columnMock]);
      expect(mockColumnsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne method', () => {
    it('should return the task with the specified id', async () => {
      jest.spyOn(mockColumnsService, 'findOne').mockResolvedValue(columnMock);

      const response = await mockColumnsService.findOne(columnMock.id);

      expect(response).toEqual(columnMock);
      expect(mockColumnsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockColumnsService.findOne).toHaveBeenCalledWith(columnMock.id);
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(mockColumnsService, 'findOne')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await mockColumnsService.findOne('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(mockColumnsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockColumnsService.findOne).toHaveBeenCalledWith('incorrect id');
    });
  });

  describe('update method', () => {
    it('should update the specified task correctly', async () => {
      jest
        .spyOn(mockColumnsService, 'update')
        .mockResolvedValue(updatedColumnMock);

      const response = await mockColumnsService.update(
        columnMock.id,
        updateColumnDto,
      );

      expect(response).toEqual(updatedColumnMock);
      expect(mockColumnsService.update).toHaveBeenCalledTimes(1);
      expect(mockColumnsService.update).toHaveBeenCalledWith(
        columnMock.id,
        updateColumnDto,
      );
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(mockColumnsService, 'update')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await mockColumnsService.update('incorrect id', updateColumnDto);
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(mockColumnsService.update).toHaveBeenCalledTimes(1);
      expect(mockColumnsService.update).toHaveBeenCalledWith(
        'incorrect id',
        updateColumnDto,
      );
    });
  });

  describe('remove method', () => {
    it('should remove the specified task', async () => {
      jest.spyOn(mockColumnsService, 'remove').mockImplementation(jest.fn());

      expect(await mockColumnsService.remove(columnMock.id)).toBeUndefined();

      expect(mockColumnsService.remove).toHaveBeenCalledTimes(1);
      expect(mockColumnsService.remove).toHaveBeenCalledWith(columnMock.id);
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(mockColumnsService, 'remove')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await mockColumnsService.remove('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(mockColumnsService.remove).toHaveBeenCalledTimes(1);
      expect(mockColumnsService.remove).toHaveBeenCalledWith('incorrect id');
    });
  });
});
