import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Agrupa todos os testes de integração para o AuthController.
describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // Criamos um "mock" do AuthService para controlar o seu comportamento.
  const mockAuthService = {
    register: jest.fn(dto => {
      return {
        id: Date.now(),
        email: dto.email,
      };
    }),
    login: jest.fn(dto => {
      return {
        access_token: 'mockAccessToken',
      };
    }),
  };

  // Roda antes de cada teste para configurar um ambiente limpo.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      // Providenciamos o nosso mock no lugar do serviço real.
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService); // Instância do mock
  });

  // Teste 1: Verifica se o controller foi criado com sucesso.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Testes para o endpoint de registo
  describe('register', () => {
    it('should call the service to register a user and return the user', async () => {
      // Arrange: Prepara os dados de entrada.
      const registerDto = { email: 'test@example.com', password: 'password123' };

      // Act: Chama o método do controller.
      const result = await controller.register(registerDto);

      // Assert: Verifica se o método 'register' do nosso serviço mock foi chamado
      // com os dados corretos.
      expect(service.register).toHaveBeenCalledWith(registerDto);
      // E verifica se o resultado tem o email que esperamos.
      expect(result.email).toEqual(registerDto.email);
    });
  });

  // Testes para o endpoint de login
  describe('login', () => {
    it('should call the service to login a user and return a token', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'password123' };

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({ access_token: 'mockAccessToken' });
    });
  });
});