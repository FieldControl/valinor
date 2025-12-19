import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../common/hash/hash.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;
  let hashService: jest.Mocked<HashService>;

  const mockUser = {
    sr_id: 1,
    vc_name: 'Test User',
    vc_email: 'test@example.com',
    vc_password: 'hashedPassword123',
    dt_createdAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HashService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
    hashService = module.get(HashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserInput = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'plainPassword123',
      };
      const hashedPassword = 'hashedPassword123';

      hashService.hashPassword.mockResolvedValue(hashedPassword);
      prismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserInput);

      expect(result).toEqual({
        id: mockUser.sr_id,
        name: mockUser.vc_name,
        email: mockUser.vc_email,
        createdAt: mockUser.dt_createdAt,
      });

      expect(hashService.hashPassword).toHaveBeenCalledWith(createUserInput.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          vc_name: createUserInput.name,
          vc_email: createUserInput.email,
          vc_password: hashedPassword,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { sr_id: 1 },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { vc_email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
