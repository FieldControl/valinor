import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnsService } from './columns.service';
import { ColumnEntity } from './column.entity';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let repository: Repository<ColumnEntity>;

  const mockColumnRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: mockColumnRepository,
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    repository = module.get<Repository<ColumnEntity>>(
      getRepositoryToken(ColumnEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all columns', async () => {
    const columns = [{ id: 1, title: 'A Fazer' }];
    mockColumnRepository.find.mockResolvedValue(columns);

    const result = await service.findAll();

    expect(result).toEqual(columns);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should create a column', async () => {
    const dto = { title: 'Nova Coluna' };
    const column = { id: 1, title: 'Nova Coluna' };

    mockColumnRepository.create.mockReturnValue(column);
    mockColumnRepository.save.mockResolvedValue(column);

    const result = await service.create(dto);

    expect(result).toEqual(column);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(column);
  });
});
