import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
import { Column } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { Card } from '../cards/entities/card.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

const userEntity: User[] = [
  new User({ name: 'user 1', email: 'email@exemplo.com', password: 'senha' })
];

const cardEntity: Card[] = [
  new Card({ name: 'card 1', description: 'Descrição', createdAt: new Date(), dueDate: new Date(), column: '664fa1f6d2e549d1d6b42bbb' })
];

const columnEntity: Column[] = [
  new Column({
    name: 'column 1',
    board: '664fa1f6d2e549d1d6b42ccc',
    responsibles: userEntity,
    cards: cardEntity
  })
];

const boardEntity: Board[] =[
  new Board({
      name: 'board 1', 
      columns: columnEntity,
      responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']}),
  new Board({
      name: 'board 2', 
      columns: columnEntity,
      responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']})
]

const newBoardEntity = new Board({
  name: 'board 1', 
  columns: columnEntity,
  responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']})

  const updatedBoardEntity = new Board({
    name: 'updated board', 
    columns: columnEntity,
    responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']})

const req = {user: { userId: '664fa1f6d2e549d1d6b4user'} }

const userId = '664fa1f6d2e549d1d6b4user'

describe('BoardsController', () => {
  let boardController: BoardsController;
  let boardService: BoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: {
            create: jest.fn().mockResolvedValue(newBoardEntity),
            createbyMail: jest.fn().mockResolvedValue(newBoardEntity),
            findAll: jest.fn().mockResolvedValue(boardEntity),
            findOne: jest.fn().mockResolvedValue(boardEntity[0]),
            update: jest.fn().mockResolvedValue(updatedBoardEntity),
            updateResponsiblesByEmail: jest.fn().mockResolvedValue(updatedBoardEntity),
            remove: jest.fn().mockResolvedValue(undefined)
          }
        }
      ],
    }).compile();

    boardController = module.get<BoardsController>(BoardsController);
    boardService = module.get<BoardsService>(BoardsService);
  });

  it('should be defined', () => {
    expect(boardController).toBeDefined();
    expect(boardService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new column item successfully', async () => {
      const boardId = '664fa1f6d2e549d1d6b42ccc'

      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1', 
        columns: columnEntity,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      }

      // Act
      const result = await boardController.create(body, req)

      // Assert
      expect(result).toEqual(newBoardEntity)
      expect(boardService.create).toHaveBeenCalledWith(body, userId)
      expect(boardService.create).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1', 
        columns: columnEntity,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      }

      jest.spyOn(boardController, 'create').mockRejectedValueOnce(new Error())

      // Assert
      expect(boardController.create(body, req)).rejects.toThrow(Error)
    })

  })

  describe('createByEmail', () => {
    it('should create a new board item with responsibles emails successfully', async () => {
      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1', 
        columns: columnEntity,
        responsibles: ['email1@example.com', 'email2@example.com']
      };
  
      // Act
      const result = await boardController.createByEmail(body, req);
  
      // Assert
      expect(result).toEqual(newBoardEntity);
      expect(boardService.createbyMail).toHaveBeenCalledWith(body, userId);
      expect(boardService.createbyMail).toHaveBeenCalledTimes(1);
    });
  
    it('should throw an exception', () => {
      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1', 
        columns: columnEntity,
        responsibles: ['email1@example.com', 'email2@example.com']
      };
  
      jest.spyOn(boardService, 'createbyMail').mockRejectedValueOnce(new Error());
  
      // Assert
      expect(boardController.createByEmail(body, req)).rejects.toThrow(Error);
    });
  });

  describe('findAll', () => {
    it('should return a list of boards successfully', async () => {
      // Act
      const result = await boardController.findAll(req);

      // Assert
      expect(result).toEqual(boardEntity)
      expect(boardService.findAll).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(boardService, 'findAll').mockRejectedValueOnce(new Error())

      // Assert
      expect(boardController.findAll(req)).rejects.toThrow(Error)
    })
  })

  describe('findOne', () => {
    it('should return a board item successfully', async () => {
      // Act
      const result = await boardController.findOne('1', req)

      // Assert
      expect(result).toEqual(boardEntity[0])
      expect(boardService.findOne).toHaveBeenCalledWith('1', userId)
      expect(boardService.findOne).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(boardService, 'findOne').mockRejectedValueOnce(new Error())
    
      // Assert
      expect(boardController.findOne('1', req)).rejects.toThrow(Error)
    })
  })

  describe('update', () => {
    it('should update a board item successfuly', async () => {
      // Arrange
      const body: UpdateBoardDto = {
        name: 'updated board', 
        columns: columnEntity,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      }

      // Act
      const result = await boardController.update('1', body, req)

      // Assert
      expect(result).toEqual(updatedBoardEntity)
      expect(boardService.update).toHaveBeenCalledWith('1', body, userId)
      expect(boardService.update).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateBoardDto = {
        name: 'updated board', 
        columns: columnEntity,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      }

      jest.spyOn(boardService, 'update').mockRejectedValueOnce(new Error())

      // Assert
      expect(boardController.update('1', body, req)).rejects.toThrow(Error)
    })
  })

  describe('updateByEmail', () => {
    it('should update a board item successfully', async () => {
      // Arrange
      const body: UpdateBoardDto = {
        name: 'updated board', 
        columns: columnEntity,
        responsibles: ['email1@example.com', 'email2@example.com']
      };
  
      // Act
      const result = await boardController.updateByEmail('1', body, req);
  
      // Assert
      expect(result).toEqual(updatedBoardEntity);
      expect(boardService.updateResponsiblesByEmail).toHaveBeenCalledWith('1', body, userId);
      expect(boardService.updateResponsiblesByEmail).toHaveBeenCalledTimes(1);
    });
  
    it('should throw an exception', () => {
      // Arrange
      const body: UpdateBoardDto = {
        name: 'updated board', 
        columns: columnEntity,
        responsibles: ['email1@example.com', 'email2@example.com']
      };
  
      jest.spyOn(boardService, 'updateResponsiblesByEmail').mockRejectedValueOnce(new Error());
  
      // Assert
      expect(boardController.updateByEmail('1', body, req)).rejects.toThrow(Error);
    });
  });

  describe('remove', () => {
    it('should remove a board item successfuly', async () => {
      // Act
      const result = await boardController.remove('1', req)

      // Assert
      expect(result).toBeUndefined()
      expect(boardService.remove).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(boardService, 'remove').mockRejectedValueOnce(new Error())

      // Assert
      expect(boardController.remove('1',req)).rejects.toThrow(Error)
    })
  })
});
