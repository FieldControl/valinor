import { Test, TestingModule } from '@nestjs/testing';
import { BoardResolver } from './board.resolver';
import { BoardService } from './board.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BoardResolver', () => {
  let resolver: BoardResolver;
  let service: BoardService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    board: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userBoard: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardResolver,
        BoardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<BoardResolver>(BoardResolver);
    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should have BoardService injected', () => {
    expect(service).toBeDefined();
  });
});
