import { Test, TestingModule } from '@nestjs/testing';
import { SwimlaneController } from './swimlane.controller';
import { SwimlaneService } from './swimlane.service';

describe('SwimlaneController', () => {
  let controller: SwimlaneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwimlaneController],
      providers: [SwimlaneService],
    }).compile();

    controller = module.get<SwimlaneController>(SwimlaneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
