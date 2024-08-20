import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateController } from './authenticate.controller';
import { AuthenticateService } from './authenticate.service';

describe('AuthenticateController', () => {
  let controller: AuthenticateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticateController],
      providers: [AuthenticateService],
    }).compile();

    controller = module.get<AuthenticateController>(AuthenticateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
