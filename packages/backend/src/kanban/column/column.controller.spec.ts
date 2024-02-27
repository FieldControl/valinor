import { Test, TestingModule } from '@nestjs/testing';
import { ColumnController } from './column.controller';

describe('ColumnController', () => {
  let controller: ColumnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnController],
    }).compile();

    controller = module.get<ColumnController>(ColumnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
