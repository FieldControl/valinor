import { Test, TestingModule } from '@nestjs/testing';
import { ColumnResolver } from './column.resolver';

describe('ColumnResolver', () => {
  let resolver: ColumnResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColumnResolver],
    }).compile();

    resolver = module.get<ColumnResolver>(ColumnResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
