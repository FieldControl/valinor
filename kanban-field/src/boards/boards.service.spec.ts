import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { Model } from 'mongoose';
import { Board, BoardDocument } from './entities/board.entity';
import { ColumnsService } from '../columns/columns.service';
import { Column, ColumnDocument } from '../columns/entities/column.entity';
import { User, UserDocument } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Card } from '../cards/entities/card.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateBoardDto } from './dto/update-board.dto';

const testUserEntityList = [
  { 
    ...new User({ 
      name: 'user 1', 
      email: 'email@exemplo.com', 
      password: 'senha' 
    }),
    _id: '664fa1f6d2e549d1d6buser1'
  },
  { 
    ...new User({ 
      name: 'user 2', 
      email: 'email2@exemplo.com', 
      password: 'senha' 
    }),
    _id: '664fa1f6d2e549d1d6buser2'
  }
];

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

const userId = '664fa1f6d2e549d1d6b4user'  

const boardEntityList: Board[] =[
  new Board({
      name: 'board 1', 
      columns: columnEntityList,
      responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz', userId]}),
  new Board({
      name: 'board 2', 
      columns: columnEntityList,
      responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']})
]

const updatedBoardEntity = new Board({
  name: 'updated board', 
  columns: columnEntityList,
  responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
})

describe('BoardsService', () => {
  let boardService: BoardsService;
  let boardModel: Model<BoardDocument>
  let columnService: ColumnsService;
  let columnModel: Model<ColumnDocument>
  let userService: UsersService;
  let userModel: Model<UserDocument>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getModelToken(Board.name),
          useValue: {
            create: jest.fn().mockResolvedValue(boardEntityList[0]),
            find: jest.fn().mockResolvedValue(boardEntityList),
            findById: jest.fn().mockResolvedValue(boardEntityList[0]),
            findOne: jest.fn().mockResolvedValue(boardEntityList[0]),
            findByIdAndUpdate: jest.fn().mockResolvedValue(updatedBoardEntity),
            findByIdAndDelete: jest.fn().mockResolvedValue(boardEntityList[0])
          }
        },
        {
          provide: UsersService, // Forneça um mock para o CardsService
          useValue: {
            findByMail: jest.fn().mockImplementation((email) => {
              return testUserEntityList.find(user => user.email === email);
            }),
          }
        },
        {
          provide: ColumnsService,
          useValue: {
            find: jest.fn().mockResolvedValue(columnEntityList)
        }
        }
      ],
    }).compile();

    boardService = module.get<BoardsService>(BoardsService);
    columnService = module.get<ColumnsService>(ColumnsService);
    userService = module.get<UsersService>(UsersService);
    boardModel = module.get<Model<BoardDocument>>(getModelToken(Board.name))
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });

  describe('create', () => {
    it('should create a board successfully', async () => {
      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1',
        columns: columnEntityList,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      };
  
      // Act
      const result = await boardService.create(body, userId);
  
      // Assert
      expect(result).toEqual(boardEntityList[0]);
      expect(boardModel.create).toHaveBeenCalledWith({...body, responsibles: [userId]});
    });
  
    it('should throw an exception', async () => {
      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1',
        columns: columnEntityList,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      };
  
      jest.spyOn(boardModel, 'create').mockRejectedValueOnce(new Error());
  
      // Assert
      await expect(boardService.create(body, userId)).rejects.toThrow(Error);
    });
  });
  
  describe('createByMail', () => {
    it('should create a board by the responsible email successfully', async () => {
      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1',
        columns: columnEntityList,
        responsibles: ['email@exemplo.com', 'email2@exemplo.com']
      };
      const userEmail = 'email@exemplo.com';
  
      // Act
      const result = await boardService.createbyMail(body, userEmail);
  
      // Assert
      expect(result).toEqual(boardEntityList[0]);
      expect(userService.findByMail).toHaveBeenCalledWith('email@exemplo.com');
      expect(userService.findByMail).toHaveBeenCalledWith('email2@exemplo.com');
      expect(userService.findByMail).toHaveBeenCalledTimes(body.responsibles.length);
      expect(boardModel.create).toHaveBeenCalledWith({...body, responsibles: [testUserEntityList[0]['_id'].toString(), testUserEntityList[1]['_id'].toString(), userEmail]});
    });
  
    it('should throw an exception', async () => {
      // Arrange
      const createBoardDto: CreateBoardDto = {
        name: 'board 1',
        columns: columnEntityList,
        responsibles: ['email@exemplo.com']
      };
  
      jest.spyOn(boardModel, 'create').mockRejectedValueOnce(new Error());
  
      // Assert
      await expect(boardService.createbyMail(createBoardDto, 'email@exemplo.com')).rejects.toThrow(Error);
    });
  });

  describe('findAll', () => {
    it('should return a board list with their columns successfully', async () => {
      // Act
      const result = await boardService.findAll(userId)

      // Assert
      expect(result).toEqual(boardEntityList);
      expect(boardModel.find).toHaveBeenCalledWith({ responsibles: { $in: [userId] } });
      for (const board of boardEntityList) {
        expect(columnService.find).toHaveBeenCalledWith({ column: board['_id'] }, userId);
      }
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(boardModel, 'find').mockRejectedValueOnce(new Error())

      // Assert
      expect(boardService.findAll(userId)).rejects.toThrow(Error)
    })
  })

  describe('findOne', () => {
    it('should return a board entity successfully', async () => {
      // Arrange
      const boardId = '1';

      // Act
      const result = await boardService.findOne(boardId, userId)

      // Assert
      expect(result).toEqual({
        ...boardEntityList[0],
        columns: columnEntityList
      });
      expect(boardModel.findById).toHaveBeenCalledWith({
        _id: boardId,
        responsibles: { $in: [userId] }
      });
      expect(columnService.find).toHaveBeenCalledWith({ board: boardId }, userId);
    })

    it('should throw a not found exception', () => {
      // Arrange
      jest.spyOn(boardModel, 'findById').mockRejectedValueOnce(new NotFoundException());
  
      // Assert
      expect(boardService.findOne('1', userId)).rejects.toThrow(NotFoundException);
    })
  })

  describe('findBoard', () => {
    it('should return a board successfully', async () => {
      // Arrange
      const id = '1';
  
      // Act
      const result = await boardService.findBoard(id, userId);
  
      // Assert
      expect(result).toEqual(boardEntityList[0]);
      expect(boardModel.findOne).toHaveBeenCalledWith({ _id: id, responsibles: { $in: [userId] } });
    });
  
    it('should throw a NotFoundException', async () => {
      // Arrange
      const id = '1';
      jest.spyOn(boardModel, 'findOne').mockRejectedValueOnce(new NotFoundException())
  
      // Assert
      await expect(boardService.findBoard(id, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a board item successfully', async () => {
      // Arrange
      const body: UpdateBoardDto = {
        name: 'updated board', 
        columns: columnEntityList,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      }

      // Act 
      const result = await boardService.update('1', body, userId)

      // Assert
      expect(result).toEqual(updatedBoardEntity)
      expect(boardModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange
      const body: UpdateBoardDto = {
        name: 'updated board', 
        columns: columnEntityList,
        responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']
      }
      
      jest.spyOn(boardModel, 'findByIdAndUpdate').mockRejectedValueOnce(new NotFoundException())

      // Assert
      expect(boardService.update('1', body, userId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateResponsiblesByEmail', () => {
    it('should update a board by the responsibles email successfully', async () => {
      // Arrange
      const id = '1';
      const body: UpdateBoardDto = {
        name: 'updated board',
        columns: columnEntityList,
        responsibles: ['email@exemplo.com', 'email2@exemplo.com']
      };
      const userEmail = 'email@exemplo.com';
  
      // Act
      const result = await boardService.updateResponsiblesByEmail(id, body, userEmail);
  
      // Assert
      expect(result).toEqual(updatedBoardEntity);
      expect(userService.findByMail).toHaveBeenCalledWith('email@exemplo.com');
      expect(userService.findByMail).toHaveBeenCalledWith('email2@exemplo.com');
      expect(userService.findByMail).toHaveBeenCalledTimes(body.responsibles.length);
      expect(boardModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: id, responsibles: { $in: [userEmail] } },
        { ...body, responsibles: [testUserEntityList[0]['_id'].toString(), testUserEntityList[1]['_id'].toString()] },
        { new: true }
      );
    });
  
    it('should throw an exception', async () => {
      // Arrange
      const id = '1';
      const body: UpdateBoardDto = {
        name: 'updated board',
        columns: columnEntityList,
        responsibles: ['email@exemplo.com']
      };
      const userEmail = 'email@exemplo.com';
  
      jest.spyOn(boardModel, 'findByIdAndUpdate').mockRejectedValueOnce(new Error());
  
      // Assert
      await expect(boardService.updateResponsiblesByEmail(id, body, userEmail)).rejects.toThrow(Error);
    });
  });
  
  describe('remove', () => {
    it('should delete a board item successfully', async () => {
      // Act
      const result = await boardService.remove('1',  userId)

      // Assert
      expect(result).toEqual(boardEntityList[0])
      expect(boardModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
    })

    it('should throw a not found exception', () => {
      // Arrange    
      jest.spyOn(boardModel, 'findByIdAndDelete').mockRejectedValueOnce(new NotFoundException())
  
      // Assert
      expect(boardService.remove('1', userId)).rejects.toThrow(NotFoundException)
    })  
  })
});
