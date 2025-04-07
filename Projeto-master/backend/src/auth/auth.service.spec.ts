// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar success true para email e senha corretos', async () => {
    const result = await service.login('admin@gmail.com', '1234');
    expect(result).toEqual({ success: true });
  });

  it('deve retornar success false para email ou senha incorretos', async () => {
    const result = await service.login('admin@gmail.com', 'errado');
    expect(result).toEqual({ success: false });
  });
});
