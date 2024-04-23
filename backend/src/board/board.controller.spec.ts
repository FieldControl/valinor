import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('BoardController', () => {
  let controller: BoardController;
  let mockBoardRepository: Partial<Repository<Board>>;
  let mockUserService: Partial<UserService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    // Mock para BoardRepository
    mockBoardRepository = {
      findOne: jest
        .fn()
        .mockImplementation((id) =>
          Promise.resolve({ id, name: 'Board', description: 'Description' }),
        ),
      save: jest.fn().mockImplementation((board) => Promise.resolve(board)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    // Mock para UserService
    mockUserService = {
      isConnectedToBoard: jest.fn().mockResolvedValue(true),
      isConnectedToSwimlane: jest.fn().mockResolvedValue(true),
    };

    // Mock para JwtService
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mockedToken'),
      verifyAsync: jest.fn().mockResolvedValue({ userId: 1 }),
      decode: jest.fn().mockReturnValue({ userId: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        BoardService,
        AuthGuard,
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<BoardController>(BoardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
