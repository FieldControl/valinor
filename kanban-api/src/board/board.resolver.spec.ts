import { Test, TestingModule } from '@nestjs/testing';
import { BoardResolver } from './board.resolver';
import { BoardService } from './board.service';

describe('BoardResolver', () => {
  let resolver: BoardResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardResolver,
        {
          provide: BoardService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<BoardResolver>(BoardResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
