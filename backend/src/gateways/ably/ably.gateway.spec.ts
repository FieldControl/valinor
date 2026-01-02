import { Test, TestingModule } from '@nestjs/testing';
import { AblyGateway } from './ably.gateway';

describe('AblyGateway', () => {
  let gateway: AblyGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AblyGateway],
    }).compile();

    gateway = module.get<AblyGateway>(AblyGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
