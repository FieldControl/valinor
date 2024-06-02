import { Test, TestingModule } from '@nestjs/testing';
import { SwimlaneService } from './swimlane.service';

describe('SwimlaneService', () => {
  let service: SwimlaneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwimlaneService],
    }).compile();

    service = module.get<SwimlaneService>(SwimlaneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
