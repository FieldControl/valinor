import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service.js';
import { PrismaService } from '../../prisma.service.js';

const mockPrismaService = {
  column: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

describe('ColumnsService', () => {
  let service: ColumnsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma coluna com sucesso', async () => {
      const input = { title: 'Nova Coluna', boardId: 1 };
      const resultadoEsperado = {
        id: 1,
        title: 'Nova Coluna',
        boardId: 1,
        isArchived: false,
      };

      (prisma.column.create as jest.Mock).mockResolvedValue(resultadoEsperado);

      const result = await service.create(input);

      expect(result).toEqual(resultadoEsperado);
      expect(prisma.column.create).toHaveBeenCalledWith({
        data: {
          title: input.title,
          board: { connect: { id: input.boardId } },
        },
      });
    });
  });
});
