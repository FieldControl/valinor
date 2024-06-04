import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card } from './entities/card.entity';
import { User } from '../users/entities/user.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

const userEntity: User[] = [
  new User({ name: 'user 1', email: 'email@exemplo.com', password: 'senha' })
];

const cardEntity: Card[] =[
  new Card({
      name: 'card 1', 
      description: 'este é um card',
      createdAt: new Date(),
      dueDate: new Date(),
      responsibles: userEntity,
      column: '664fa1f6d2e549d1d6b42ccc',
      position: 1,
    }),
  new Card({
      name: 'card 2', 
      description: 'este é um card 2',
      createdAt: new Date(),
      dueDate: new Date(),
      responsibles: userEntity,
      column: '664fa1f6d2e549d1d6b42ccc',
      position: 2,
    }),
]

const newCardEntity = new Card({
  name: 'card 1', 
  description: 'este é um card',
  createdAt: new Date(),
  dueDate: new Date(),
  responsibles: userEntity,
  column: '664fa1f6d2e549d1d6b42ccc',
  position: 1,
})

const updatedCardEntity = new Card({
  name: 'updated card', 
  description: 'este é um card',
  createdAt: new Date(),
  dueDate: new Date(),
  responsibles: userEntity,
  column: '664fa1f6d2e549d1d6b42ccc',
  position: 1,
})

const req = {user: { userId: '664fa1f6d2e549d1d6b4user'} }

const userId = '664fa1f6d2e549d1d6b4user'

describe('CardsController', () => {
  let cardController: CardsController;
  let cardService: CardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: CardsService,
          useValue: {
            create: jest.fn().mockResolvedValue(newCardEntity),
            findAll: jest.fn().mockResolvedValue(cardEntity),
            findOne: jest.fn().mockResolvedValue(cardEntity[0]),
            update: jest.fn().mockResolvedValue(updatedCardEntity),
            updatePosition: jest.fn().mockResolvedValue({ ...updatedCardEntity, position: 2 }),
            remove: jest.fn().mockResolvedValue(undefined)
          }
        }
      ],
    }).compile();

    cardController = module.get<CardsController>(CardsController);
    cardService = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(cardController).toBeDefined();
    expect(cardService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new card item successfully', async () => {
      const columnId = '664fa1f6d2e549d1d6b42ccc'

      // Arrange
      const body: CreateCardDto = {
        name: 'card 1', 
        description: 'este é um card',
        createdAt: new Date(),
        dueDate: new Date(),
        responsibles: userEntity,
        column: '664fa1f6d2e549d1d6b42ccc',
        position: 1,
      }

      // Act
      const result = await cardController.create(body, req)

      // Assert
      expect(result).toEqual(newCardEntity)
      expect(cardService.create).toHaveBeenCalledWith(body, columnId, userId)
      expect(cardService.create).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: CreateCardDto = {
        name: 'card 1', 
        description: 'este é um card',
        createdAt: new Date(),
        dueDate: new Date(),
        responsibles: userEntity,
        column: '664fa1f6d2e549d1d6b42ccc',
        position: 1,
      }

      jest.spyOn(cardController, 'create').mockRejectedValueOnce(new Error())

      // Assert
      expect(cardController.create(body, req)).rejects.toThrow(Error)
    })

  })

  describe('findAll', () => {
    it('should return a list of cards successfully', async () => {
      // Act
      const result = await cardController.findAll(req);

      // Assert
      expect(result).toEqual(cardEntity)
      expect(cardService.findAll).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(cardService, 'findAll').mockRejectedValueOnce(new Error())

      // Assert
      expect(cardController.findAll(req)).rejects.toThrow(Error)
    })
  })

  describe('findOne', () => {
    it('should return a card item successfully', async () => {
      // Act
      const result = await cardController.findOne('1', req)

      // Assert
      expect(result).toEqual(cardEntity[0])
      expect(cardService.findOne).toHaveBeenCalledWith('1', userId)
      expect(cardService.findOne).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(cardService, 'findOne').mockRejectedValueOnce(new Error())
    
      // Assert
      expect(cardController.findOne('1', req)).rejects.toThrow(Error)
    })
  })

  describe('update', () => {
    it('should update a card item successfuly', async () => {
      // Arrange
      const body: UpdateCardDto = {
        name: 'updated card', 
        description: 'este é um card',
        createdAt: new Date(),
        dueDate: new Date(),
        responsibles: userEntity,
        column: '664fa1f6d2e549d1d6b42ccc',
        position: 1
      }

      // Act
      const result = await cardController.update('1', body, req)

      // Assert
      expect(result).toEqual(updatedCardEntity)
      expect(cardService.update).toHaveBeenCalledWith('1', body, userId)
      expect(cardService.update).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateCardDto = {
        name: 'updated card', 
        description: 'este é um card',
        createdAt: new Date(),
        dueDate: new Date(),
        responsibles: userEntity,
        column: '664fa1f6d2e549d1d6b42ccc',
        position: 1
      }

      jest.spyOn(cardService, 'update').mockRejectedValueOnce(new Error())

      // Assert
      expect(cardController.update('1', body, req)).rejects.toThrow(Error)
    })
  })

  describe('updatePosition', () => {
    it('should update the position of a card item successfully', async () => {
      // Arrange
      const newPosition = 2
      const cardId = '1';
      const updatedCardWithNewPosition = { ...updatedCardEntity, position: newPosition };
      
  
      // Act
      const result = await cardController.updatePosition(cardId, newPosition, req);
  
      // Assert
      expect(result).toEqual(updatedCardWithNewPosition);
      expect(cardService.updatePosition).toHaveBeenCalledWith(cardId, newPosition, userId);
      expect(cardService.updatePosition).toHaveBeenCalledTimes(1);
    });
  
    it('should throw an exception when the service fails', async () => {
      // Arrange
      const newPosition = 2;
      const cardId = '1';
      jest.spyOn(cardService, 'updatePosition').mockRejectedValueOnce(new Error());
  
      // Assert
      await expect(cardController.updatePosition(cardId, newPosition, req)).rejects.toThrow(Error);
    });
  });
  
  
  describe('remove', () => {
    it('should remove a card item successfuly', async () => {
      // Act
      const result = await cardController.remove('1', req)

      // Assert
      expect(result).toBeUndefined()
      expect(cardService.remove).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(cardService, 'remove').mockRejectedValueOnce(new Error())

      // Assert
      expect(cardController.remove('1',req)).rejects.toThrow(Error)
    })
  })

});
