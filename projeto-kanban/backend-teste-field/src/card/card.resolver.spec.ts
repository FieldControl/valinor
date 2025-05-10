import { Test, TestingModule } from '@nestjs/testing';
import { CardResolver } from './card.resolver';
import { CardService } from './card.service';

describe('CardResolver', () => {
  let resolver: CardResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardResolver, CardService],
    }).compile();

    resolver = module.get<CardResolver>(CardResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
