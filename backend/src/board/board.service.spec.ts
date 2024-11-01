import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';

const mockBoardRepository = () => ({
  save: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockUserService = () => ({
  findOne: jest.fn(),
});

describe('BoardService', () => {
  let service: BoardService;
  let boardRepository: Repository<Board>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        { provide: getRepositoryToken(Board), useFactory: mockBoardRepository },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    boardRepository = module.get(getRepositoryToken(Board));
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const createBoardDto = { name: 'New Board' };
      const userId = 1;
      const user = { id: userId, name: 'Test User' };

      userService.findOne = jest.fn().mockResolvedValue(user);
      boardRepository.save = jest.fn().mockResolvedValue({ id: 1, ...createBoardDto, users: [user] });

      const result = await service.create(createBoardDto, userId);
      expect(result).toEqual({ id: 1, ...createBoardDto, users: [user] });
      expect(boardRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: createBoardDto.name, users: [user] }));
    });
  });

  describe('isUserAssociatedWithBoard', () => {
    it('should return true if user is associated with board', async () => {
      const boardId = 1;
      const userId = 1;

      boardRepository.count = jest.fn().mockResolvedValue(1);
      const result = await service.isUserAssociatedWithBoard(boardId, userId);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if user is not associated with board', async () => {
      const boardId = 1;
      const userId = 1;

      boardRepository.count = jest.fn().mockResolvedValue(0);
      await expect(service.isUserAssociatedWithBoard(boardId, userId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findAllByUserId', () => {
    it('should return all boards associated with a user', async () => {
      const userId = 1;
      const boards = [{ id: 1, name: 'Board 1' }, { id: 2, name: 'Board 2' }];

      boardRepository.find = jest.fn().mockResolvedValue(boards);
      const result = await service.findAllByUserId(userId);
      expect(result).toEqual(boards);
      expect(boardRepository.find).toHaveBeenCalledWith({ where: { users: { id: userId } }, relations: ['users'] });
    });
  });

  describe('findOne', () => {
    it('should return a board if user is associated', async () => {
      const boardId = 1;
      const userId = 1;
      const board = { id: boardId, name: 'Board 1', users: [{ id: userId }] };

      boardRepository.findOne = jest.fn().mockResolvedValue(board);
      const result = await service.findOne(boardId, userId);
      expect(result).toEqual(board);
    });

    it('should return undefined if user is not associated', async () => {
      const boardId = 1;
      const userId = 2;

      boardRepository.findOne = jest.fn().mockResolvedValue(null);
      const result = await service.findOne(boardId, userId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing board', async () => {
      const boardId = 1;
      const userId = 1;
      const updateBoardDto = { name: 'Updated Board' };

      boardRepository.count = jest.fn().mockResolvedValue(1);
      boardRepository.update = jest.fn();

      await service.update(boardId, userId, updateBoardDto);
      expect(boardRepository.update).toHaveBeenCalledWith(boardId, { name: updateBoardDto.name });
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      const boardId = 1;
      const userId = 1;

      boardRepository.count = jest.fn().mockResolvedValue(1);
      boardRepository.delete = jest.fn();

      await service.remove(boardId, userId);
      expect(boardRepository.delete).toHaveBeenCalledWith(boardId);
    });
  });
});
