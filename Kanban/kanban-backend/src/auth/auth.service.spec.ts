// ARQUIVO: src/auth/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Simulamos a biblioteca bcrypt para que os testes sejam rápidos.
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// O 'describe' agrupa todos os testes para o AuthService.
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Criamos "mocks" (objetos falsos) para as dependências do AuthService.
  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockAccessToken'),
  };

  // 'beforeEach' roda antes de cada teste, criando um ambiente limpo.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // Providenciamos os nossos mocks no lugar dos serviços reais.
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // Teste 1: Verifica se o serviço foi criado.
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // Testes para o método register
  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashedPassword' });
      
      const registerDto = { email: 'test@example.com', password: 'password123' };
      
      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(result).toEqual({ id: 1, email: 'test@example.com' });
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedPassword',
      });
    });

    it('should throw a ConflictException if email already exists', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashedPassword' });
      const registerDto = { email: 'test@example.com', password: 'password123' };

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  // Testes para o método login
  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      // Arrange
      const user = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      mockUsersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const loginDto = { email: 'test@example.com', password: 'password123' };

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result).toEqual({ access_token: 'mockAccessToken' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
    });

    it('should throw an UnauthorizedException for invalid credentials', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      
      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});