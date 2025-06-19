import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ColumnsService', () => {
  let service: ColumnsService;

  const mockPrisma = {
    column: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Exemplo de teste
  it('should return all columns', async () => {
    const result = [{ id: 1, title: 'To Do', cards: [] }];
    mockPrisma.column.findMany.mockResolvedValue(result);

    expect(await service.findAll()).toBe(result);
  });
});