import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockedJwtToken'),
  };

  const mockUsersService = {
    findOneByUsername: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token if credentials are valid', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'password' };
      const userDatabase = { id: 1, username: 'test', password: 'hashedPassword', boards: [], status:1 };

      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(userDatabase);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'mockedJwtToken' });
      expect(usersService.findOneByUsername).toHaveBeenCalledWith('test');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'test', sub: 1 });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'password' };

      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByUsername).toHaveBeenCalledWith('test');
      
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'password' };
      const userDatabase = { id: 1, username: 'test', password: 'hashedPassword', boards:[], status:1 };

      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(userDatabase);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByUsername).toHaveBeenCalledWith('test');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});