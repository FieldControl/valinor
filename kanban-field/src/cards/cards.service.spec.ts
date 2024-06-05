import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { Card, CardDocument } from './entities/card.entity';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ColumnsService } from '../columns/columns.service';
import { User } from '../users/entities/user.entity';
import { Column } from '../columns/entities/column.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateCardDto } from './dto/update-card.dto';

const userEntityList: User[] = [
  new User({ 
    name: 'user 1', 
    email: 'email@exemplo.com', 
    password: 'senha' }),
  new User({ 
    name: 'user 2', 
    email: 'email@exemplo.com', 
    password: 'senha' })
];

const cardEntityList: Card[] = [
  new Card({ 
    name: 'card 1', 
    description: 'Descrição', 
    createdAt: new Date(), 
    dueDate: new Date(), 
    responsibles: userEntityList,
    column: '664fa1f6d2e549d1d6b42bbb',
    position: 0 }),
  new Card({ 
    name: 'card 2', 
    description: 'Descrição', 
    createdAt: new Date(), 
    dueDate: new Date(), 
    responsibles: userEntityList,
    column: '664fa1f6d2e549d1d6b42bbb',
    position: 1 })
];

const updatedCardEntity = new Card({ 
  name: 'updated card', 
  description: 'Descrição', 
  createdAt: new Date(), 
  dueDate: new Date(), 
  responsibles: userEntityList,
  column: '664fa1f6d2e549d1d6b42bbb',
  position: 1 
})

const columnEntity = new Column({
  name: 'column 1',
  board: '664fa1f6d2e549d1d6b42ccd',
  responsibles: userEntityList,
  cards: cardEntityList})


const mockFindWithPopulateAndExec = (returnValue) => {
  return jest.fn().mockImplementationOnce(() => ({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValueOnce(returnValue),
  }));
};

const mockFindAndThrowError = () => {
  return jest.fn().mockImplementationOnce(() => {
    throw new Error();
  });
};

const columnId = '664fa1f6d2e549d1d6column'
const userId = '664fa1f6d2e549d1d6b4user'  

describe('CardsService', () => {
  let cardService: CardsService;
  let cardModel: Model<CardDocument>
  let columnService: ColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getModelToken(Card.name),
          useValue: {
            create: jest.fn().mockResolvedValue(cardEntityList[0]),
            find: jest.fn().mockResolvedValue(cardEntityList),
            findById: jest.fn().mockResolvedValue(cardEntityList[0]),
            findByIdAndUpdate: jest.fn().mockResolvedValue(updatedCardEntity),
            findByIdAndDelete: jest.fn().mockResolvedValue(cardEntityList[0])
          }
        },
        {
          provide: ColumnsService,
          useValue: {
            findColumn: jest.fn().mockResolvedValue(columnEntity)
        }
        }
      ],
    }).compile();

    cardService = module.get<CardsService>(CardsService);
    columnService = module.get<ColumnsService>(ColumnsService);
    cardModel = module.get<Model<CardDocument>>(getModelToken(Card.name))
  });

  it('should be defined', () => {
    expect(cardService).toBeDefined();
  });

  describe('create', () => {
    it('should create a card item successfully', async () => {
      // Arrange
      const body: CreateCardDto = {
        name: 'card 1', 
        description: 'Descrição', 
        createdAt: new Date(), 
        dueDate: new Date(), 
        responsibles: userEntityList,
        column: '664fa1f6d2e549d1d6b42bbb',
        position: 2 // novos cards sempre vão pro ultimo index
      }    

      // Act
      const result = await cardService.create(body, columnId, userId);

      // Assert
      expect(result).toEqual(cardEntityList[0]);
      expect(columnService.findColumn).toHaveBeenCalledWith(columnId, userId);
      expect(cardModel.create).toHaveBeenCalledWith({...body, responsibles: userEntityList});
      expect(cardModel.create).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: CreateCardDto = {
        name: 'card 1', 
        description: 'Descrição', 
        createdAt: new Date(), 
        dueDate: new Date(), 
        responsibles: userEntityList,
        column: '664fa1f6d2e549d1d6b42bbb',
        position: 0
      }    

      jest.spyOn(cardModel, 'create').mockRejectedValueOnce(new Error())

      // Assert
      expect(cardService.create(body, columnId, userId)).rejects.toThrow(Error)
    })
  })

  describe('findAll', () => {
    it('should return a card list successfully', async () => {
      // Act
      const result = await cardService.findAll(userId)

      // Assert
      expect(result).toEqual(cardEntityList);
      expect(cardModel.find).toHaveBeenCalledWith({ responsibles: { $in: [userId] } });
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(cardModel, 'find').mockRejectedValueOnce(new Error())

      // Assert
      expect(cardService.findAll(userId)).rejects.toThrow(Error)
    })
  })

  describe('findOne', () => {
    it('should return a card entity successfully', async () => {
      // Act
      const result = await cardService.findOne('1', userId)

      // Assert
      expect(result).toEqual({...cardEntityList[0]})
      expect(cardModel.findById).toHaveBeenCalledWith({_id: '1', responsibles: { $in: [userId] } });
    })

    it('should throw a not found exception', () => {
      // Arrange
      jest.spyOn(cardModel, 'findById').mockRejectedValueOnce(new NotFoundException());
  
      // Assert
      expect(cardService.findOne('1', userId)).rejects.toThrow(NotFoundException);
    })
  })

  describe('find', () => {
    it('should return a list of card when any condition is given successfully', async () => {
      // Arrange
      const conditions = { name: 'card 1' };
      jest.spyOn(cardModel, 'find').mockImplementationOnce(mockFindWithPopulateAndExec(cardEntityList))
  
      // Act
      const result = await cardService.find(conditions, userId);
  
      // Assert
      expect(result).toEqual(cardEntityList);
      expect(cardModel.find).toHaveBeenCalledWith({ ...conditions, responsibles: { $in: [userId] } });
    });
  
    it('should throw an error', async () => {
      // Arrange
      const conditions = { name: 'card 1' };
      jest.spyOn(cardModel, 'find').mockImplementationOnce(mockFindAndThrowError())
  
      // Assert
      await expect(cardService.find(conditions, userId)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should update a card  item successfully', async () => {
      // Arrange
      const body: UpdateCardDto = {
        name: 'updated card', 
        description: 'Descrição', 
        createdAt: new Date(), 
        dueDate: new Date(), 
        responsibles: userEntityList,
        column: '664fa1f6d2e549d1d6b42bbb',
        position: 1 
      }

      // Act 
      const result = await cardService.update('1', body, userId)

      // Assert
      expect(result).toEqual(updatedCardEntity)
      expect(cardModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange
      const body: UpdateCardDto = {
        name: 'updated card', 
        description: 'Descrição', 
        createdAt: new Date(), 
        dueDate: new Date(), 
        responsibles: userEntityList,
        column: '664fa1f6d2e549d1d6b42bbb',
        position: 1 
      }
      
      jest.spyOn(cardModel, 'findByIdAndUpdate').mockRejectedValueOnce(new NotFoundException())

      // Assert
      expect(cardService.update('1', body, userId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updatePosition', () => {
    it('should update a card position successfully', async () => {
      // Arrange
      const newPosition = 2;
  
      // Act 
      const result = await cardService.updatePosition('1', newPosition, userId);
  
      // Assert
      expect(result).toEqual(updatedCardEntity)
      expect(cardModel.findByIdAndUpdate).toHaveBeenCalledWith(
        {_id: '1', responsibles: { $in: [userId] } }, 
        { position: newPosition }, 
        { new: true }
      );
      expect(cardModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
    })
  
    it('should throw a not found exception', () => {
      // Arrange
      const newPosition = 2;
      jest.spyOn(cardModel, 'findByIdAndUpdate').mockRejectedValueOnce(new NotFoundException());
  
      // Assert
      expect(cardService.updatePosition('1', newPosition, userId)).rejects.toThrow(NotFoundException);
    })
  })
  

  describe('remove', () => {
    it('should delete a card item successfully', async () => {
      // Act
      const result = await cardService.remove('1',  userId)

      // Assert
      expect(result).toEqual(cardEntityList[0])
      expect(cardModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange    
      jest.spyOn(cardModel, 'findByIdAndDelete').mockRejectedValueOnce(new NotFoundException())
  
      // Assert
      expect(cardService.remove('1', userId)).rejects.toThrow(NotFoundException)
    })  
  })
});
