import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

describe('BoardService', () => {
  let service: BoardService;
  let mockBoardRepository: Partial<Repository<Board>>;
  let mockUserService: Partial<UserService>;

  beforeEach(async () => {
    // Criar mocks para as dependências
    mockBoardRepository = {
      count: jest.fn().mockResolvedValue(1),
      save: jest
        .fn()
        .mockImplementation((board) =>
          Promise.resolve({ ...board, id: Date.now() }),
        ),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest
        .fn()
        .mockImplementation((id) => Promise.resolve({ id, users: [] })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockUserService = {
      isConnectedToBoard: jest.fn().mockResolvedValue(true),
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'User' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
