import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { JwtService } from '@nestjs/jwt'; // Importe o JwtService

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

  const mockUserService = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  const createMockRequest = (userId: number, userEmail: string): PayloadRequest => ({
    user: { id: userId, email: userEmail },
    headers: {
      append: function (_name: string, _value: string): void {
        // Mock implementation, can be left empty or filled as necessary
      },
      delete: function (_name: string): void {
        // Mock implementation, can be left empty or filled as necessary
      },
      get: function (_name: string): string | null {
        // Mock implementation, can be left empty or filled as necessary
        return null;
      },
      getSetCookie: function (): string[] {
        return []; // Mock implementation
      },
      has: function (_name: string): boolean {
        return false; // Mock implementation
      },
      set: function (_name: string, _value: string): void {
        // Mock implementation, can be left empty or filled as necessary
      },
      entries: function (): IterableIterator<[string, string]> {
        return {} as IterableIterator<[string, string]>; // Mock implementation
      },
      keys: function (): IterableIterator<string> {
        return {} as IterableIterator<string>; // Mock implementation
      },
      values: function (): IterableIterator<string> {
        return {} as IterableIterator<string>; // Mock implementation
      },
      [Symbol.iterator]: function (): IterableIterator<[string, string]> {
        return {} as IterableIterator<[string, string]>; // Mock implementation
      },
      forEach: function (callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    },
    method: 'GET',
    url: '/user',
    cache: 'default',
    credentials: 'include',
    body: undefined,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0), // Mock implementation
    blob: async () => new Blob(), // Mock implementation
    formData: async () => new FormData(), // Mock implementation
    json: async () => ({}), // Mock implementation
    text: async () => '',
    destination: '',
    integrity: '',
    keepalive: false,
    mode: 'same-origin',
    redirect: 'error',
    referrer: '',
    referrerPolicy: '',
    signal: undefined,
    clone: function (): Request {
      throw new Error('Function not implemented.');
    }
  });

  describe('findOne', () => {
    it('should return the user', async () => {
      const req = createMockRequest(1, 'john@example.com');
      expect(await userController.findOne(req)).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update the user and return the updated user', async () => {
      const req = createMockRequest(1, 'john@example.com');
      const updateUserDto: UpdateUserDto = { email: 'Jane Doe', password: 'jane@example.com' };
      expect(await userController.update(updateUserDto, req)).toEqual(mockUser);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove the user and return true', async () => {
      const req = createMockRequest(1, 'john@example.com');
      expect(await userController.remove(req)).toBe(true);
      expect(userService.remove).toHaveBeenCalledWith(1);
    });
  });
});
