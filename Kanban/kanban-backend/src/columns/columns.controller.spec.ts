import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ColumnsController', () => {
  let controller: ColumnsController;

  // Mock do ColumnsService
  const mockColumnsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [{ provide: ColumnsService, useValue: mockColumnsService }],
    })
    .overrideGuard(JwtAuthGuard) // Desativa o guarda
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ColumnsController>(ColumnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});