import { Test, TestingModule } from '@nestjs/testing';
import { Service } from './.service';

describe('Service', () => {
  let service: Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Service],
    }).compile();

    service = module.get<Service>(Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
