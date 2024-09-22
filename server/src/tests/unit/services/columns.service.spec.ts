import { Test, TestingModule } from '@nestjs/testing';

import { ColumnsService } from '../../../columns/columns.service';
import { PrismaService } from '../../../prisma/prisma.service';

// mocks
import {
  columnMock,
  updatedColumnMock,
  createColumnDto,
  updateColumnDto,
} from '../../mocks/columns.mocks';
import { NotFoundException } from '@nestjs/common';

describe('ColumnsService tests', () => {
  let columnsService: ColumnsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ColumnsService, PrismaService],
    }).compile();

    columnsService = testModule.get<ColumnsService>(ColumnsService);
    prismaService = testModule.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create method', () => {
    it('should create a new column', async () => {
      jest.spyOn(prismaService.column, 'create').mockResolvedValue(columnMock);

      const response = await columnsService.create(createColumnDto);

      expect(response).toEqual(columnMock);
      expect(prismaService.column.create).toHaveBeenCalledTimes(1);
      expect(prismaService.column.create).toHaveBeenCalledWith({
        data: createColumnDto,
      });
    });
  });

  describe('findAll method', () => {
    it('should return an array of columns', async () => {
      jest
        .spyOn(prismaService.column, 'findMany')
        .mockResolvedValue([columnMock]);

      const response = await columnsService.findAll();

      expect(response).toEqual([columnMock]);
      expect(prismaService.column.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne method', () => {
    it('should return the column with the specified id', async () => {
      jest
        .spyOn(prismaService.column, 'findUnique')
        .mockResolvedValue(columnMock);

      const response = await columnsService.findOne(columnMock.id);

      expect(response).toEqual(columnMock);
      expect(prismaService.column.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: columnMock.id },
      });
    });

    it('should throw an error when column is not found', async () => {
      jest
        .spyOn(prismaService.column, 'findUnique')
        .mockRejectedValue(new NotFoundException('column not found'));

      try {
        await columnsService.findOne('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('column not found'));
      }

      expect(prismaService.column.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: 'incorrect id' },
      });
    });
  });

  describe('update method', () => {
    it('should update the specified column correctly', async () => {
      jest
        .spyOn(prismaService.column, 'findUnique')
        .mockResolvedValue(columnMock);
      jest
        .spyOn(prismaService.column, 'update')
        .mockResolvedValue(updatedColumnMock);

      const response = await columnsService.update(
        columnMock.id,
        updateColumnDto,
      );

      expect(response).toEqual(updatedColumnMock);
      expect(prismaService.column.update).toHaveBeenCalledTimes(1);
      expect(prismaService.column.update).toHaveBeenCalledWith({
        where: { id: columnMock.id },
        data: updateColumnDto,
      });
    });

    it('should throw an error when column is not found', async () => {
      jest
        .spyOn(prismaService.column, 'findUnique')
        .mockRejectedValue(new NotFoundException('column not found'));

      try {
        await columnsService.update('incorrect id', updateColumnDto);
      } catch (error) {
        expect(error).toEqual(new NotFoundException('column not found'));
      }

      expect(prismaService.column.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: 'incorrect id' },
      });
    });
  });

  describe('remove method', () => {
    it('should delete the specified column', async () => {
      jest
        .spyOn(prismaService.column, 'findUnique')
        .mockResolvedValue(columnMock);
      jest.spyOn(prismaService.column, 'delete').mockImplementation(jest.fn());

      expect(await columnsService.remove(columnMock.id)).toBeUndefined();

      expect(prismaService.column.delete).toHaveBeenCalledTimes(1);
      expect(prismaService.column.delete).toHaveBeenCalledWith({
        where: { id: columnMock.id },
      });
    });

    it('should throw an error when column is not found', async () => {
      jest
        .spyOn(prismaService.column, 'findUnique')
        .mockRejectedValue(new NotFoundException('column not found'));

      try {
        await columnsService.remove('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('column not found'));
      }

      expect(prismaService.column.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.column.findUnique).toHaveBeenCalledWith({
        where: { id: 'incorrect id' },
      });
    });
  });
});
