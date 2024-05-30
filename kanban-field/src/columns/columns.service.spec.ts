import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { Column, ColumnDocument } from './entities/column.entity';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';
import { Card } from '../cards/entities/card.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { BoardsService } from '../boards/boards.service';
import { CardsService } from '../cards/cards.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateColumnDto } from './dto/update-column.dto';

const userEntityList: User[] = [
  new User({ name: 'user 1', email: 'email@exemplo.com', password: 'senha' })
];

const cardEntityList: Card[] = [
  new Card({ name: 'card 1', description: 'Descrição', createdAt: new Date(), dueDate: '2024-12-31', column: '664fa1f6d2e549d1d6b42bbb' })
];

const columnEntityList: Column[] = [
  new Column({
    name: 'column 1',
    board: '664fa1f6d2e549d1d6b42ccc',
    responsibles: userEntityList,
    cards: cardEntityList
  }),
  new Column({
    name: 'column 2',
    board: '664fa1f6d2e549d1d6b42ccd',
    responsibles: userEntityList,
    cards: cardEntityList
  })
];

const updatedColumnEntity = new Column({
  name: 'updated column',
  board: '664fa1f6d2e549d1d6b42ccd',
  responsibles: userEntityList,
  cards: cardEntityList})

const boardId = '1'
const userId = '1'  

describe('ColumnsService', () => {
  let columnService: ColumnsService;
  let columnModel: Model<ColumnDocument>
  let boardService: BoardsService;
  let cardService: CardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: getModelToken(Column.name),
          useValue: {
            create: jest.fn().mockResolvedValue(columnEntityList[0]),
            findBoard: jest.fn(),
            find: jest.fn().mockResolvedValue(columnEntityList),
            findById: jest.fn().mockResolvedValue(columnEntityList[0]),
            findOne: jest.fn().mockResolvedValue(columnEntityList[0]),
            findByIdAndUpdate: jest.fn().mockResolvedValue(updatedColumnEntity),
            findByIdAndDelete: jest.fn().mockResolvedValue(columnEntityList[0])
          }
        },
        {
          provide: BoardsService, // Adicione isto
          useValue: {
            findBoard: jest.fn().mockResolvedValue({
              name: 'board 1', 
              columns: columnEntityList,
              responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
            }),
          }
        },
        {
          provide: CardsService,
          useValue: {
            find: jest.fn().mockResolvedValue(cardEntityList)
          }
        }
      ],
    }).compile();

    columnService = module.get<ColumnsService>(ColumnsService);
    columnModel = module.get<Model<ColumnDocument>>(getModelToken(Column.name))
    boardService = module.get<BoardsService>(BoardsService);
    cardService = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(columnService).toBeDefined();
  });

  describe('create', () => {
    it('should create a column item successfully', async () => {
      // Arrange
      const body: CreateColumnDto = {
        name: 'column 1',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntityList,
        cards: cardEntityList
      }    

      // Act
      const result = await columnService.create(body, boardId, userId);

      // Assert
      expect(result).toEqual(columnEntityList[0]);
      expect(boardService.findBoard).toHaveBeenCalledWith(boardId, userId);
      expect(columnModel.create).toHaveBeenCalledWith({...body, responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']});
      expect(columnModel.create).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: CreateColumnDto = {
        name: 'column 1',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntityList,
        cards: cardEntityList
      }

      jest.spyOn(columnModel, 'create').mockRejectedValueOnce(new Error())

      // Assert
      expect(columnService.create(body, boardId, userId)).rejects.toThrow(Error)
    })
  })

  describe('findAll', () => {
    it('should return a column list with their cards successfully', async () => {
      // Act
      const result = await columnService.findAll(userId)

      // Assert
      expect(result).toEqual(columnEntityList);
      expect(columnModel.find).toHaveBeenCalledWith({ responsibles: { $in: [userId] } });
      for (const column of columnEntityList) {
        expect(cardService.find).toHaveBeenCalledWith({ column: column['_id'] }, userId);
      }
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(columnModel, 'find').mockRejectedValueOnce(new Error())

      // Assert
      expect(columnService.findAll(userId)).rejects.toThrow(Error)
    })
  })

  describe('findOne', () => {
    it('should return a user entity successfully', async () => {
      // Act
      const result = await columnService.findOne('1', userId)

      // Assert
      expect(result).toEqual({...columnEntityList[0], cards: cardEntityList})
      expect(columnModel.findById).toHaveBeenCalledWith({_id: '1', responsibles: { $in: [userId] } });
      expect(cardService.find).toHaveBeenCalledWith({ column: '1' }, userId);
    })

    it('should throw a not found exception', () => {
      // Arrange
      jest.spyOn(columnModel, 'findById').mockRejectedValueOnce(new NotFoundException);
  
      // Assert
      expect(columnService.findOne('1', userId)).rejects.toThrow(NotFoundException);
    })
  })

  describe('findByBoard', () => {
    it('should return a list of columns with their cards successfully', async () => {  
      // Arrange
      jest.spyOn(columnModel, 'find').mockImplementationOnce(() => ({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(columnEntityList),
      } as any));

      // Act
      const result = await columnService.findByBoard(boardId, userId);
  
      // Assert
      expect(result).toEqual(columnEntityList);
      expect(columnModel.find).toHaveBeenCalledWith({ board: boardId, responsibles: { $in: [userId] } });
      for (const column of columnEntityList) {
        expect(cardService.find).toHaveBeenCalledWith({ column: column['_id'] }, userId);
      }
    });

    it('should throw an exception', () => {
      // Arrange
      const findMock = jest.spyOn(columnModel, 'find');
      findMock.mockImplementationOnce(() => {
        throw new Error();
      });
  
      // Assert
      expect(columnService.findByBoard(boardId, userId)).rejects.toThrow(Error);

      findMock.mockRestore();
    });
  });

  describe('find', () => {
    it('should return a list of columns when any condition is given successfully', async () => {
      // Arrange
      const conditions = { name: 'column 1' };
      jest.spyOn(columnModel, 'find').mockImplementationOnce(() => ({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(columnEntityList),
      } as any));
  
      // Act
      const result = await columnService.find(conditions, userId);
  
      // Assert
      expect(result).toEqual(columnEntityList);
      expect(columnModel.find).toHaveBeenCalledWith({ ...conditions, responsibles: { $in: [userId] } });
    });
  
    it('should throw an error', async () => {
      // Arrange
      const conditions = { name: 'column 1' };
      jest.spyOn(columnModel, 'find').mockImplementationOnce(() => {
        throw new Error();
      });
  
      // Assert
      await expect(columnService.find(conditions, userId)).rejects.toThrow(Error);
    });
  });
  
  describe('findColumn', () => {
    it('should return a column successfully', async () => {
      // Arrange
      const id = '1';
      jest.spyOn(columnModel, 'findOne').mockImplementationOnce(() => ({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(columnEntityList[0]),
      } as any));
  
      // Act
      const result = await columnService.findColumn(id, userId);
  
      // Assert
      expect(result).toEqual(columnEntityList[0]);
      expect(columnModel.findOne).toHaveBeenCalledWith({ _id: id, responsibles: { $in: [userId] } });
      expect(cardService.find).toHaveBeenCalledWith({ column: columnEntityList[0]['_id'] }, userId);
    });
  
    it('should throw a NotFoundException', async () => {
      // Arrange
      const id = '1';
      jest.spyOn(columnModel, 'findOne').mockImplementationOnce(() => ({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(null), // Retorna null para simular uma coluna não encontrada
      } as any));
  
      // Assert
      await expect(columnService.findColumn(id, userId)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('update', () => {
    it('should update a column  item successfully', async () => {
      // Arrange
      const body: UpdateColumnDto = {
        name: 'updated column',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntityList,
        cards: cardEntityList
      }

      // Act 
      const result = await columnService.update('1', body, userId)

      // Assert
      expect(result).toEqual(updatedColumnEntity)
      expect(columnModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange
      const body: UpdateColumnDto = {
        name: 'column 1',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntityList,
        cards: cardEntityList
      }
      
      jest.spyOn(columnModel, 'findByIdAndUpdate').mockRejectedValueOnce(new NotFoundException)

      // Assert
      expect(columnService.update('1', body, userId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should delete a column item successfully', async () => {
      // Act
      const result = await columnService.remove('1',  userId)

      // Assert
      expect(result).toEqual(columnEntityList[0])
      expect(columnModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange    
      jest.spyOn(columnModel, 'findByIdAndDelete').mockRejectedValueOnce(new NotFoundException)
  
      // Assert
      expect(columnService.remove('1', userId)).rejects.toThrow(NotFoundException)
    })  
  })
});
