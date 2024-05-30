import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userEntity: User[] = [
  new User({ 
    name: 'user 1', 
    email: 'email@exemplo.com', 
    password: 'senha' }),
  new User({ 
    name: 'user 2', 
    email: 'email@exemplo.com', 
    password: 'senha' })
];

const newUserEntity = new User({ 
  name: 'user 1', 
  email: 'email@exemplo.com', 
  password: 'senha' })

const updatedUserEntity = new User({ 
  name: 'updated user', 
  email: 'email@exemplo.com', 
  password: 'senha' })

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvbmF0aGFuQGdtYWlsLmNvbSIsInN1YiI6IjY2MWVjOGU1OWE2N2Y3NGQzZWU0ZDIxMSIsImlhdCI6MTcxNzAwMTc1OSwiZXhwIjoxNzE3MDIxNzU5fQ.c4JVuAmAKvJt7ijFBi6tPW0-B9LcsBAe_xxxxxxxxxx'

describe('UsersController', () => {
  let userController: UsersController;
  let userService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(newUserEntity),
            findAll: jest.fn().mockResolvedValue(userEntity),
            findOne: jest.fn().mockResolvedValue(userEntity[0]),
            update: jest.fn().mockResolvedValue(updatedUserEntity),
            remove: jest.fn().mockResolvedValue(undefined),
          }
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ accessToken: token})
          }
        }
      ],
    }).compile();

    userController = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user item successfully', async () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'user 1',
        email: 'email@exemplo.com',
        password: 'senha',
        creation: undefined
      }

      // Act
      const result = await userController.create(body)

      // Assert
      expect(result).toEqual(newUserEntity)
      expect(userService.create).toHaveBeenCalledWith(body)
      expect(userService.create).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'user 1',
        email: 'email@exemplo.com',
        password: 'senha',
        creation: undefined
      }

      jest.spyOn(userService, 'create').mockRejectedValueOnce(new Error())

      // Assert
      expect(userController.create(body)).rejects.toThrow(Error)
    })
  })

  describe('findAll', () => {
    it('should return a list of users successfully', async () => {
      // Act
      const result = await userController.findAll();

      // Assert
      expect(result).toEqual(userEntity)
      expect(userService.findAll).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(userService, 'findAll').mockRejectedValueOnce(new Error())

      // Assert
      expect(userController.findAll()).rejects.toThrow(Error)
    })
  })

  describe('findOne', () => {
    it('should return an user item successfully', async () => {
      // Act
      const result = await userController.findOne('1')

      // Assert
      expect(result).toEqual(userEntity[0])
      expect(userService.findOne).toHaveBeenCalledWith('1')
      expect(userService.findOne).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(userService, 'findOne').mockRejectedValueOnce(new Error())
    
      // Assert
      expect(userController.findOne('1')).rejects.toThrow(Error)
    })
  })

  describe('update', () => {
    it('should update an user item successfuly', async () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'update user',
        email: 'email@exemplo.com',
        password: 'senha',
        creation: undefined
      }

      // Act
      const result = await userController.update('1', body)

      // Assert
      expect(result).toEqual(updatedUserEntity)
      expect(userService.update).toHaveBeenCalledWith('1', body)
      expect(userService.update).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'update user',
        email: 'email@exemplo.com',
        password: 'senha',
        creation: undefined
      }

      jest.spyOn(userService, 'update').mockRejectedValueOnce(new Error())

      // Assert
      expect(userController.update('1', body)).rejects.toThrow(Error)
    })
  })

  describe('remove', () => {
    it('should remove an user item successfuly', async () => {
      // Act
      const result = await userController.remove('1')

      // Assert
      expect(result).toBeUndefined()
      expect(userService.remove).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(userService, 'remove').mockRejectedValueOnce(new Error())

      // Assert
      expect(userController.remove('1')).rejects.toThrow(Error)
    })
  })

  describe('login', () => {
    it('should return a token when login is successful', async () => {
      // Arrange
      const req = { user: newUserEntity };

      // Act
      const result = await userController.login(req);

      // Assert
      expect(result).toEqual({ accessToken: token });
      expect(authService.login).toHaveBeenCalledWith(req.user);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', async () => {
      // Arrange
      const req = { user: newUserEntity };

      jest.spyOn(authService, 'login').mockRejectedValueOnce(new Error());

      // Assert
      await expect(userController.login(req)).rejects.toThrow(Error);
    });
  });
});
