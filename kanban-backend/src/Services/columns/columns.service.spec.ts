import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Columns } from '../../Entities/columns.entity';
import { Repository } from 'typeorm';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let repository: Repository<Columns>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: getRepositoryToken(Columns),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    repository = module.get<Repository<Columns>>(getRepositoryToken(Columns));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of columns', async () => {
      const expectedColumns = [];
      jest.spyOn(repository, 'find').mockResolvedValue(expectedColumns);

      const result = await service.findAllColumns();
      expect(result).toEqual(expectedColumns);
    });
  });

  describe('findOne', () => {
    it('should return a column by ID', async () => {
      const columnId = '1';
      const expectedColumn = new Columns();
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedColumn);

      const result = await service.findOneColumn(columnId);
      expect(result).toEqual(expectedColumn);
    });
  });

  describe('create', () => {
    it('should create a new column', async () => {
      const columnDto = { title: 'New Column' };
      const expectedColumn = new Columns();
      jest.spyOn(repository, 'save').mockResolvedValue(expectedColumn);

      const result = await service.createColumn(columnDto);
      expect(result).toEqual(expectedColumn);
    });
  });

  describe('update', () => {
    it('should update a column', async () => {
      const columnId = '1';
      const updatedColumnDto = { title: 'Updated Column' };
      const expectedColumn = new Columns();
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedColumn);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedColumn);

      const result = await service.updateColumn(columnId, updatedColumnDto);
      expect(result).toEqual(expectedColumn);
    });
  });

  describe('remove', () => {
    it('should delete a column', async () => {
      const columnId = '1';
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.removeColumn(columnId);
      expect(repository.delete).toHaveBeenCalledWith(columnId);
    });
  });
});
