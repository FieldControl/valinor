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
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateBoardDto } from './dto/create-board.dto';

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
    dueDate: '2024-12-31', 
    responsibles: userEntityList,
    column: '664fa1f6d2e549d1d6b42bbb',
    position: 0 }),
  new Card({ 
    name: 'card 2', 
    description: 'Descrição', 
    createdAt: new Date(), 
    dueDate: '2024-12-31', 
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

const boardEntityList: Board[] =[
  new Board({
      name: 'board 1', 
      columns: columnEntityList,
      responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']}),
  new Board({
      name: 'board 2', 
      columns: columnEntityList,
      responsibles: ['664fa1f6d2e549d1d6b42xxx', '664fa1f6d2e549d1d6b42xyz']})
]

const userId = '664fa1f6d2e549d1d6b4user'  

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
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
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
    it('should create a board by mail successfully', async () => {
      // Arrange
      const body: CreateBoardDto = {
        name: 'board 1',
        columns: columnEntityList,
        responsibles: ['email@exemplo.com', 'email2@exemplo.com']
      };
  
      // Act
      const result = await boardService.createbyMail(body, 'email@exemplo.com');
  
      // Assert
      expect(result).toEqual(boardEntityList[0]);
      expect(userService.findByMail).toHaveBeenCalledWith('email@exemplo.com');
      expect(userService.findByMail).toHaveBeenCalledWith('email2@exemplo.com');
      expect(userService.findByMail).toHaveBeenCalledTimes(body.responsibles.length);
      expect(boardModel.create).toHaveBeenCalledWith({...body, responsibles: [testUserEntityList[0]['_id'].toString(), testUserEntityList[1]['_id'].toString(), 'email@exemplo.com']});
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
  
});
