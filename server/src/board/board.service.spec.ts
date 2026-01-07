import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BoardService', () => {
  let service: BoardService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockBoard = {
    sr_id: 1,
    vc_name: 'Test Board',
    dt_createdAt: new Date('2023-01-01'),
  };

  const mockColumn = {
    sr_id: 1,
    vc_name: 'To Do',
    fk_boardId: 1,
    it_position: 1,
    cards: [],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
      board: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userBoard: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a board and associate it with the user', async () => {
      const createBoardInput = { name: 'New Board' };
      const userId = 1;

      prismaService.board.create.mockResolvedValue(mockBoard);
      prismaService.userBoard.create.mockResolvedValue({
        sr_id: 1,
        fk_userId: userId,
        fk_boardId: mockBoard.sr_id,
        vc_role: 'admin',
        dt_createdAt: new Date(),
      });

      const result = await service.create(createBoardInput, userId);

      expect(result).toEqual({
        id: mockBoard.sr_id,
        name: mockBoard.vc_name,
        createdAt: mockBoard.dt_createdAt,
      });

      expect(prismaService.board.create).toHaveBeenCalledWith({
        data: { vc_name: createBoardInput.name },
      });

      expect(prismaService.userBoard.create).toHaveBeenCalledWith({
        data: {
          fk_userId: userId,
          fk_boardId: mockBoard.sr_id,
          vc_role: 'admin',
        },
      });
    });
  });

  describe('findBoardsByUser', () => {
    it('should return all boards for a user', async () => {
      const userId = 1;
      const mockBoards = [mockBoard];

      prismaService.board.findMany.mockResolvedValue(mockBoards);

      const result = await service.findBoardsByUser(userId);

      expect(result).toEqual([
        {
          id: mockBoard.sr_id,
          name: mockBoard.vc_name,
          createdAt: mockBoard.dt_createdAt,
        },
      ]);

      expect(prismaService.board.findMany).toHaveBeenCalledWith({
        where: {
          users: {
            some: { fk_userId: userId },
          },
        },
      });
    });

    it('should return empty array when user has no boards', async () => {
      prismaService.board.findMany.mockResolvedValue([]);

      const result = await service.findBoardsByUser(999);

      expect(result).toEqual([]);
    });
  });

  describe('findBoardWithColumns', () => {
    it('should return a board with its columns and cards', async () => {
      const boardWithColumns = {
        ...mockBoard,
        columns: [
          {
            ...mockColumn,
            cards: [
              {
                sr_id: 1,
                vc_name: 'Task 1',
                vc_description: 'Description',
                fk_columnId: 1,
                fk_assignedUserId: 1,
                dt_createdAt: new Date('2023-01-01'),
                assignedUser: {
                  sr_id: 1,
                  vc_name: 'User 1',
                },
              },
            ],
          },
        ],
      };

      prismaService.board.findUnique.mockResolvedValue(boardWithColumns);

      const result = await service.findBoardWithColumns(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBoard.sr_id);
      expect(result.columns).toHaveLength(1);
      expect(result.columns[0].cards).toHaveLength(1);
      expect(result.columns[0].cards[0].assignedUserName).toBe('User 1');
    });

    it('should return null when board does not exist', async () => {
      prismaService.board.findUnique.mockResolvedValue(null);

      const result = await service.findBoardWithColumns(999);

      expect(result).toBeNull();
    });
  });
});
