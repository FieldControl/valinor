import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service.js';
import { PrismaService } from '../../prisma.service.js';

const mockPrisma = {
  board: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('BoardService', () => {
  let service: BoardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('deve criar um board', async () => {
      const input = { title: 'Novo Board' };
      const expectedResult = { id: 1, ...input, isArchived: false };

      (prisma.board.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.create(input);

      expect(result).toEqual(expectedResult);
      expect(prisma.board.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar apenas boards não arquivados', async () => {
      // O mock do service deve garantir que o filtro 'isArchived: false' foi passado
      await service.findAll();

      expect(prisma.board.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isArchived: false },
        }),
      );
    });
  });
});
