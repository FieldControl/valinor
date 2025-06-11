import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from '../columns/columns.controller';
import { ColumnsService } from '../columns/columns.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtService } from '@nestjs/jwt';

describe('ColumnsController', () => {
  let controller: ColumnsController;

  const columnsServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [
        { provide: ColumnsService, useValue: columnsServiceMock },
        { provide: JwtService, useValue: {} },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
