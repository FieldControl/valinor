import { Test, TestingModule } from '@nestjs/testing';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ColumnResolver', () => {
  let resolver: ColumnResolver;
  let service: ColumnService;

  const mockPrismaService = {
    column: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnResolver,
        ColumnService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<ColumnResolver>(ColumnResolver);
    service = module.get<ColumnService>(ColumnService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should have ColumnService injected', () => {
    expect(service).toBeDefined();
  });
});
