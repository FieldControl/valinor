import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { HashService } from '../common/hash/hash.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let hashService: jest.Mocked<HashService>;

  const mockUser = {
    sr_id: 1,
    vc_name: 'Test User',
    vc_email: 'test@example.com',
    vc_password: 'hashedPassword123',
    dt_createdAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: {
            comparePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    hashService = module.get(HashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      hashService.comparePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(hashService.comparePassword).toHaveBeenCalledWith('password123', mockUser.vc_password);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      hashService.comparePassword.mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrongPassword'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(hashService.comparePassword).toHaveBeenCalledWith('wrongPassword', mockUser.vc_password);
    });
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token and user data when login is successful', async () => {
      const mockToken = 'jwt-token-123';
      usersService.findByEmail.mockResolvedValue(mockUser);
      hashService.comparePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginInput);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.sr_id,
          name: mockUser.vc_name,
          email: mockUser.vc_email,
          createdAt: mockUser.dt_createdAt,
        },
      });
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sr_id: mockUser.sr_id,
        email: mockUser.vc_email,
        name: mockUser.vc_name,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginInput))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
