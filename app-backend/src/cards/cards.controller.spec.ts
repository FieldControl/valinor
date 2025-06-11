import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from '../cards/cards.controller';
import { CardsService } from '../cards/cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtService } from '@nestjs/jwt';

describe('CardsController', () => {
  let controller: CardsController;

  const cardsServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    move: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        { provide: CardsService, useValue: cardsServiceMock },
        { provide: JwtService, useValue: {} },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
