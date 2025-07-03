import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';

describe('CardController', () => {
  let controller: CardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
    }).compile();

    controller = module.get<CardController>(CardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
