import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardColumn } from './board.entity';
import { Card } from '../card/card.entity';

// Criando mocks dos repositórios
const mockBoardColumnRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockCardRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('BoardService', () => {
  let service: BoardService;
  let boardColumnRepo: Repository<BoardColumn>;
  let cardRepo: Repository<Card>;
  let module: TestingModule; // Declaração no escopo do describe

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(BoardColumn),
          useValue: mockBoardColumnRepo,
        },
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepo,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    boardColumnRepo = module.get<Repository<BoardColumn>>(getRepositoryToken(BoardColumn));
    cardRepo = module.get<Repository<Card>>(getRepositoryToken(Card));
  });

  afterAll(async () => {
    await module?.close(); // Agora module está acessível aqui
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma nova coluna no board', async () => {
    const boardColumn = { title: 'Nova Coluna' };

    mockBoardColumnRepo.create.mockReturnValue(boardColumn);
    mockBoardColumnRepo.save.mockResolvedValue(boardColumn);

    const result = await service.createColumn(boardColumn);
    expect(result).toEqual(boardColumn);
  });
});
