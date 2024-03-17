import { UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';
import { hashPasswordTransform } from '../common/helpers/crypto';
import TesteUtil from '../common/test/TestUtil';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
    signAsync: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'jwt-token-teste',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    mockRepository.findOne.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When validated user', () => {
    it('should be valid user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const hashedPassword = hashPasswordTransform.to(user.password);
      const userWithHashedPassword = { ...user, password: hashedPassword };

      mockRepository.findOne.mockReturnValue(userWithHashedPassword);

      const fakeRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const valited = await service.validateUser(
        {
          email: user.email,
          password: user.password,
        },
        fakeRes,
      );

      expect(valited.token).toEqual(expect.any(String));
    });

    it('should not be possible to validate a user with an invalid password', async () => {
      const user = TesteUtil.giveAMeAValidUser();

      const hashedPassword = hashPasswordTransform.to(user.password);
      const userWithHashedPassword = { ...user, password: hashedPassword };

      mockRepository.findOne.mockReturnValue(userWithHashedPassword);

      const fakeRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const data = {
        email: user.email,
        password: '123123',
      };

      await service.validateUser(data, fakeRes).catch((e) => {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e).toMatchObject({
          message: 'Credentials invalid',
        });
      });
    });
  });

  describe('When revalidate token', () => {
    it('should revalidate token successfully', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.findOne.mockResolvedValue(user);

      const userId = '1';
      mockJwtService.verify.mockReturnValue({ sub: userId });
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const req = {
        cookies: { refreshToken: 'new-token' },
      } as any;
      const fakeRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await service.revalidateToken(req, fakeRes);

      expect(result.token).toBe('new-token');
      expect(fakeRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        {
          httpOnly: true,
          sameSite: 'none',
          path: '/',
          secure: true,
          domain: 'localhost',
        },
      );
    });

    it('should throw UnauthorizedException when refreshToken is not found', async () => {
      const req = {
        cookies: { refreshToken: 'new-token' },
      } as any;
      const fakeRes = {} as Response;

      await expect(service.revalidateToken(req, fakeRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
