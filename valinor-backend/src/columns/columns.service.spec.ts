import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Column } from './columns.entity';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn().mockResolvedValue([{ id: 'col1', title: 'A Fazer' }]),
      findOne: jest.fn().mockResolvedValue({ id: 'col1', title: 'A Fazer' }),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        { provide: getRepositoryToken(Column), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
  });

  it('deve retornar todas as colunas', async () => {
    const result = await service.findAll();
    expect(result.length).toBeGreaterThan(0);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('deve retornar uma coluna pelo id', async () => {
    const result = await service.findOne('col1');
    expect(result.id).toBe('col1');
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'col1' },
      relations: ['cards'],
      order: { cards: { order: 'ASC' } },
    });
  });
});