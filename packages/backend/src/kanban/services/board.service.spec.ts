import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BoardService } from './board.service';
import { SupabaseService } from '../../supabase/supabase.service';

describe('BoardService', () => {
  let service: BoardService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBoard', () => {
    it('should create a board successfully', async () => {
      const createBoardInput = {
        title: 'Test Board',
        description: 'Test Description',
      };

      const expectedBoard = {
        id: 'test-id',
        title: 'Test Board',
        description: 'Test Description',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      };

      mockSupabaseClient.insert.mockResolvedValue({
        data: expectedBoard,
        error: null,
      });

      const result = await service.createBoard(createBoardInput);

      expect(result).toEqual(expectedBoard);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('boards');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw error when database operation fails', async () => {
      const createBoardInput = {
        title: 'Test Board',
        description: 'Test Description',
      };

      mockSupabaseClient.insert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      try {
        await service.createBoard(createBoardInput);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toContain('Failed to create board: Database error');
      }
    });
  });

  describe('getAllBoards', () => {
    it('should return all boards', async () => {
      const expectedBoards = [
        {
          id: 'board-1',
          title: 'Board 1',
          description: 'Description 1',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
        {
          id: 'board-2',
          title: 'Board 2',
          description: 'Description 2',
          created_at: '2023-01-02T00:00:00.000Z',
          updated_at: '2023-01-02T00:00:00.000Z',
        },
      ];

      mockSupabaseClient.select.mockResolvedValue({
        data: expectedBoards,
        error: null,
      });

      const result = await service.getAllBoards();

      expect(result).toEqual(expectedBoards);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('boards');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('getBoardById', () => {
    it('should return a board by id', async () => {
      const boardId = 'test-board-id';
      const expectedBoard = {
        id: boardId,
        title: 'Test Board',
        description: 'Test Description',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: expectedBoard,
        error: null,
      });

      const result = await service.getBoardById(boardId);

      expect(result).toEqual(expectedBoard);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('boards');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', boardId);
    });

    it('should throw NotFoundException when board not found', async () => {
      const boardId = 'non-existent-id';

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Board not found' },
      });

      try {
        await service.getBoardById(boardId);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
}); 