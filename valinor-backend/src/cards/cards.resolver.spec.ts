import { Test, TestingModule } from '@nestjs/testing';
import { CardsResolver } from './cards.resolver';
import { CardsService } from './cards.service';

describe('CardsResolver', () => {
  let resolver: CardsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsResolver,
        {
          provide: CardsService,
          useValue: {
            create: jest.fn(),
            findByColumn: jest.fn(),
            update: jest.fn(),
            move: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<CardsResolver>(CardsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});