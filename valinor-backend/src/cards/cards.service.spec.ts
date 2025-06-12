import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './cards.entity';
import { ColumnsService } from '../columns/columns.service';

describe('CardsService', () => {
  let service: CardsService;
  let mockRepo: any;
  let mockColumnsService: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((card) => Promise.resolve({ ...card, id: '1' })),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    mockColumnsService = {
      findOne: jest.fn().mockResolvedValue({ id: 'col1', title: 'A Fazer' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: mockRepo },
        { provide: ColumnsService, useValue: mockColumnsService },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('deve criar um card', async () => {
    const result = await service.create('conteudo', 'col1');
    expect(result.content).toBe('conteudo');
    expect(result.column.id).toBe('col1');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('deve deletar um card', async () => {
    const result = await service.remove('1');
    expect(result).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });
});