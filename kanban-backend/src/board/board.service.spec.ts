import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardInput } from './dto/create.input';
import { UpdateBoardInput } from './dto/update.input';
import TestUtil from '../common/util/testUtil';

describe('BoardService', () => {
  let service: BoardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: PrismaService,
          useValue: {
            board: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const createBoardInput: CreateBoardInput = {
        name: 'New Board',
        userId: 1,
      };
      const createdBoard = TestUtil.giveMeAvalidBoard();

      jest.spyOn(prisma.board, 'create').mockResolvedValue(createdBoard);

      const result = await service.createBoard(createBoardInput);
      expect(result).toEqual(createdBoard);
      expect(prisma.board.create).toHaveBeenCalledWith({
        data: createBoardInput,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const boards = [
        TestUtil.giveMeAvalidBoard(),
        { ...TestUtil.giveMeAvalidBoard(), id: 2, name: 'Board 2' },
      ];

      jest.spyOn(prisma.board, 'findMany').mockResolvedValue(boards);

      const result = await service.findAllBoards();
      expect(result).toEqual(boards);
      expect(prisma.board.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a board by ID', async () => {
      const board = TestUtil.giveMeAvalidBoard();

      jest.spyOn(prisma.board, 'findUnique').mockResolvedValue(board);

      const result = await service.findBoardById(1);
      expect(result).toEqual(board);
      expect(prisma.board.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if board does not exist', async () => {
      jest.spyOn(prisma.board, 'findUnique').mockResolvedValue(null);

      const result = await service.findBoardById(999);
      expect(result).toBeNull();
      expect(prisma.board.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardInput: UpdateBoardInput = {
        id: 1,
        name: 'Updated Board',
        updatedBy: 1,
      };
      const updatedBoard = {
        ...TestUtil.giveMeAvalidBoard(),
        name: 'Updated Board',
      };

      jest.spyOn(prisma.board, 'update').mockResolvedValue(updatedBoard);

      const result = await service.updateBoard(1, updateBoardInput);
      expect(result).toEqual(updatedBoard);
      expect(prisma.board.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateBoardInput,
      });
    });
  });

  describe('remove', () => {
    it('should remove a board by ID', async () => {
      const board = TestUtil.giveMeAvalidBoard();
      prisma.board.findUnique = jest.fn().mockResolvedValue(board);
      prisma.board.delete = jest.fn().mockResolvedValue(board);

      const deletedBoard = await service.deleteBoard(board.id);

      expect(deletedBoard).toBe(true);
      expect(prisma.board.delete).toHaveBeenCalledWith({
        where: { id: board.id },
      });
    });

    it('should throw an exception if board to delete not found', async () => {
      prisma.board.delete = jest
        .fn()
        .mockRejectedValue(new Error('Board not found'));

      await expect(service.deleteBoard(999)).rejects.toThrow(
        `Board with ID 999 not found`,
      );
      expect(prisma.board.delete).toHaveBeenCalledTimes(1);
    });
  });
});
