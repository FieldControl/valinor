import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CardsService } from '../cards/cards.service';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userEntityList: User[] = [
  new User({ 
    name: 'user 1', 
    email: 'email@exemplo.com', 
    password: 'senha'
}),
  new User({ 
    name: 'user 2', 
    email: 'email@exemplo.com', 
    password: 'senha'
})
]

const updatedUserEntity = new User({name: 'updated user', email: 'email@exemplo.com', password: 'senha'})

describe('UsersService', () => {
  let userService: UsersService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findByMail: jest.fn(),
            create: jest.fn().mockResolvedValue(userEntityList[0]),
            find: jest.fn().mockResolvedValue(userEntityList),
            findById: jest.fn().mockResolvedValue(userEntityList[0]),
            findOne: jest.fn().mockResolvedValue(userEntityList[0]),
            findByIdAndUpdate: jest.fn().mockResolvedValue(updatedUserEntity),
            findByIdAndDelete: jest.fn().mockResolvedValue(userEntityList[0])
          }
        },
        {
          provide: CardsService, // Forneça um mock para o CardsService
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          }
        }
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name))
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userModel).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a user list successfully', async () => {
      // Act
      const result = await userService.findAll()

      // Assert
      expect(result).toEqual(userEntityList)
      expect(userModel.find).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(userModel, 'find').mockRejectedValueOnce(new Error())

      // Assert
      expect(userService.findAll()).rejects.toThrow(Error)
    })
  })
  
  describe('findOne', () => {
    it('should return a user entity successfully', async () => {
      // Act
      const result = await userService.findOne('1')

      // Assert
      expect(result).toEqual(userEntityList[0])
      expect(userModel.findById).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange
      jest.spyOn(userModel, 'findById').mockRejectedValueOnce(new NotFoundException)

      // Assert
      expect(userService.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create an user item successfully', async () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'user 1', 
        email: 'email@exemplo.com', 
        password: 'senha',
        creation: undefined
      }

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      // Act
      const result = await userService.create(body)

      // Assert
      expect(result).toEqual(userEntityList[0])
      expect(userModel.findOne).toHaveBeenCalledWith({ email: body.email });
      expect(userModel.create).toHaveBeenCalledTimes(1)
    })

    it('should throw an error when a user with the same email already exists', async () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'user 1', 
        email: 'email@exemplo.com', 
        password: 'senha',
        creation: undefined
      };
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(userEntityList[0]);
  
      // Assert
      await expect(userService.create(body)).rejects.toThrow(`Já existe um usuário com este e-mail`);
    });

    it('should throw an exception', () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'user 1', 
        email: 'email@exemplo.com', 
        password: 'senha',
        creation: undefined
      };

      jest.spyOn(userModel, 'create').mockRejectedValueOnce(new Error())

      // Assert
      expect(userService.create(body)).rejects.toThrow(Error)
    })
  })

  describe('update', () => {
    it('should update an user item successfully', async () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'updated user', 
        email: 'email@exemplo.com', 
        password: 'senha'
      }

      // Act 
      const result = await userService.update('1', body)

      // Assert
      expect(result).toEqual(updatedUserEntity)
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'updated user', 
        email: 'email@exemplo.com', 
        password: 'senha'
      }
      
      jest.spyOn(userModel, 'findByIdAndUpdate').mockRejectedValueOnce(new NotFoundException)

      // Assert
      expect(userService.update('1', body)).rejects.toThrow(NotFoundException)
    })
  })
  
  describe('deleteById', () => {
    it('should delete an user item successfully', async () => {
      // Act
      const result = await userService.remove('1')

      // Assert
      expect(result).toEqual(userEntityList[0])
      expect(userModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
    })
  })

  it('should throw a not found exception', () => {
    // Arrange    
    jest.spyOn(userModel, 'findByIdAndDelete').mockRejectedValueOnce(new NotFoundException)

    // Assert
    expect(userService.remove('1')).rejects.toThrow(NotFoundException)
  })

  describe('findByMail', () => {
    it('should return a user successfully when a user with the given email exists', async () => {
      // Arrange
      const email = 'email@exemplo.com';
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(userEntityList[0]);
  
      // Act
      const result = await userService.findByMail(email);
  
      // Assert
      expect(result).toEqual(userEntityList[0]);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: email });
    });
  
    it('should return undefined when no user with the given email exists', async () => {
      // Arrange
      const email = 'email@exemplo.com';
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(undefined);
  
      // Act
      const result = await userService.findByMail(email);
  
      // Assert
      expect(result).toBeUndefined();
      expect(userModel.findOne).toHaveBeenCalledWith({ email: email });
    });
  });
  
});
