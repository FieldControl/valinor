import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { BoardResolver } from './board.resolver.js';
import { BoardService } from './board.service.js';

// Mock do Service
const mockBoardService = {
  create: jest.fn((dto) => ({ id: 1, ...dto })),
  findAll: jest.fn(() => []),
  update: jest.fn((id, dto) => ({ id, ...dto })),
  remove: jest.fn((id) => ({ id, isArchived: true })),
};

describe('BoardResolver', () => {
  let resolver: BoardResolver;
  let service: BoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardResolver,
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    resolver = module.get<BoardResolver>(BoardResolver);
    service = module.get<BoardService>(BoardService);
  });

  it('deve criar um board via mutation', async () => {
    const dto = { title: 'board 1' };
    const result = await resolver.createBoard(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, title: 'board 1' });
  });

  it('deve remover um board (arquivar)', async () => {
    const result = await resolver.removeBoard(10);
    expect(service.remove).toHaveBeenCalledWith(10);
    expect(result.isArchived).toBe(true);
  });

  it('deve atualizar um board (mover)', async () => {
    const dto = { id: 1, title: ' board 1 - alterado' };
    await resolver.updateBoard(dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });
});
