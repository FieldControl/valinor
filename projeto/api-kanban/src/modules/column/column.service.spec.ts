import { Test, TestingModule } from '@nestjs/testing';
import { ColumnService } from './column.service';

describe('ColumnService', () => {
  let service: ColumnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColumnService],
    }).compile();

    service = module.get<ColumnService>(ColumnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
