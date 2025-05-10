import { Test, TestingModule } from '@nestjs/testing';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';

describe('ColumnResolver', () => {
  let resolver: ColumnResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColumnResolver, ColumnService],
    }).compile();

    resolver = module.get<ColumnResolver>(ColumnResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
