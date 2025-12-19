import { Test, TestingModule } from '@nestjs/testing';
import { CardResolver } from './card.resolver';
import { CardService } from './card.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CardResolver', () => {
  let resolver: CardResolver;
  let service: CardService;

  const mockPrismaService = {
    card: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardResolver,
        CardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<CardResolver>(CardResolver);
    service = module.get<CardService>(CardService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should have CardService injected', () => {
    expect(service).toBeDefined();
  });
});
