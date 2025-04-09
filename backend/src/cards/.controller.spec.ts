import { Test, TestingModule } from '@nestjs/testing';
import { Controller } from './.controller';
import { Service } from './.service';

describe('Controller', () => {
  let controller: Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Controller],
      providers: [Service],
    }).compile();

    controller = module.get<Controller>(Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
