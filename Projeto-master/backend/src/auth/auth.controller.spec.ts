import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve retornar mensagem de sucesso no login válido', async () => {
    jest.spyOn(service, 'login').mockResolvedValueOnce({ success: true });

    const result = await controller.login({
      email: 'admin@gmail.com',
      password: '1234',
    });

    expect(result).toEqual({ message: 'Login bem-sucedido' });
    expect(service.login).toHaveBeenCalledWith('admin@gmail.com', '1234');
  });

  it('deve lançar exceção no login inválido', async () => {
    jest.spyOn(service, 'login').mockResolvedValueOnce({ success: false });

    await expect(
      controller.login({
        email: 'admin@gmail.com',
        password: 'errado',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

