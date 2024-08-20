import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateService } from './authenticate.service';

describe('AuthenticateService', () => {
  let service: AuthenticateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticateService],
    }).compile();

    service = module.get<AuthenticateService>(AuthenticateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
