import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsResolver } from './columns.resolver';
import { ColumnsService } from './columns.service';

describe('ColumnsResolver', () => {
  let resolver: ColumnsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsResolver,
        {
          provide: ColumnsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<ColumnsResolver>(ColumnsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});