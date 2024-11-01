import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashedpassword', 
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // Simula que nenhum usuário foi encontrado

      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async (password: string, hash: string) => {
        return false; // Simula que a senha está errada
      });

      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return an access token if login is successful', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async (password: string, hash: string) => {
        return true; // Simula que a senha está correta
      });
      mockJwtService.signAsync.mockResolvedValue('token'); // Simula o retorno de um token

      const loginDto: LoginDto = { email: 'test@example.com', password: 'correctpassword' };
      const result = await authService.login(loginDto);

      expect(result).toEqual({ accessToken: 'token' });
    });
  });
});
