import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { Column } from './entities/column.entity';
import { User } from '../users/entities/user.entity';
import { Card } from '../cards/entities/card.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

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
  }),
  new Column({
    name: 'column 2',
    board: '664fa1f6d2e549d1d6b42ccd',
    responsibles: userEntity,
    cards: cardEntity
  })
];

const newColumnEntity = new Column({
  name: 'column 1',
  board: '664fa1f6d2e549d1d6b42ccc',
  responsibles: userEntity,
  cards: cardEntity
})

const updatedColumnEntity = new Column({
  name: 'updated column',
  board: '664fa1f6d2e549d1d6b42ccc',
  responsibles: userEntity,
  cards: cardEntity
})

const userId = '664fa1f6d2e549d1d6b4user'

const req = {user: { userId: '664fa1f6d2e549d1d6b4user'} }

describe('ColumnsController', () => {
  let columnController: ColumnsController;
  let columnService: ColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [
        {
          provide: ColumnsService,
          useValue: {
            create: jest.fn().mockResolvedValue(newColumnEntity),
            findAll: jest.fn().mockResolvedValue(columnEntity),
            findOne: jest.fn().mockResolvedValue(columnEntity[0]),
            findByBoard: jest.fn().mockResolvedValue(columnEntity),
            update: jest.fn().mockResolvedValue(updatedColumnEntity),
            remove: jest.fn().mockResolvedValue(undefined)
          }
        }
      ],
    }).compile();

    columnController = module.get<ColumnsController>(ColumnsController);
    columnService = module.get<ColumnsService>(ColumnsService);
  });

  it('should be defined', () => {
    expect(columnController).toBeDefined();
    expect(columnService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new column item successfully', async () => {
      const boardId = '664fa1f6d2e549d1d6b42ccc'

      // Arrange
      const body: CreateColumnDto = {
        name: 'column 1',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntity,
        cards: cardEntity
      }

      // Act
      const result = await columnController.create(body, req)

      // Assert
      expect(result).toEqual(newColumnEntity)
      expect(columnService.create).toHaveBeenCalledWith(body, boardId, userId)
      expect(columnService.create).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: CreateColumnDto = {
        name: 'column 1',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntity,
        cards: cardEntity
      }

      jest.spyOn(columnController, 'create').mockRejectedValueOnce(new Error())

      // Assert
      expect(columnController.create(body, req)).rejects.toThrow(Error)
    })

  })

  describe('findAll', () => {
    it('should return a list of columns successfully', async () => {
      // Act
      const result = await columnController.findAll(req);

      // Assert
      expect(result).toEqual(columnEntity)
      expect(columnService.findAll).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(columnService, 'findAll').mockRejectedValueOnce(new Error())

      // Assert
      expect(columnController.findAll(req)).rejects.toThrow(Error)
    })
  })

  describe('findOne', () => {
    it('should return a column item successfully', async () => {
      // Act
      const result = await columnController.findOne('1', req)

      // Assert
      expect(result).toEqual(columnEntity[0])
      expect(columnService.findOne).toHaveBeenCalledWith('1', userId)
      expect(columnService.findOne).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(columnService, 'findOne').mockRejectedValueOnce(new Error())
    
      // Assert
      expect(columnController.findOne('1', req)).rejects.toThrow(Error)
    })
  })

  describe('findColumnsByBoard', () => {
    it('should return a list of columns for a specific board successfully', async () => {
      // Arrange
      const boardId = '664fa1f6d2e549d1d6b42ccc';

      // Act
      const result = await columnController.findColumnsByBoard(boardId, req);

      // Assert
      expect(result).toEqual(columnEntity);
      expect(columnService.findByBoard).toHaveBeenCalledWith(boardId, userId);
      expect(columnService.findByBoard).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', async () => {
      // Arrange
      const boardId = '664fa1f6d2e549d1d6b42ccc';
      jest.spyOn(columnService, 'findByBoard').mockRejectedValueOnce(new Error());

      // Assert
      await expect(columnController.findColumnsByBoard(boardId, req)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should update a column item successfully', async () => {
      // Arrange
      const body: UpdateColumnDto = {
        name: 'updated column',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntity,
        cards: cardEntity
      }

      // Act
      const result = await columnController.update('1', body, req)

      // Assert
      expect(result).toEqual(updatedColumnEntity)
      expect(columnService.update).toHaveBeenCalledWith('1', body, userId)
      expect(columnService.update).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateColumnDto = {
        name: 'updated column',
        board: '664fa1f6d2e549d1d6b42ccc',
        responsibles: userEntity,
        cards: cardEntity
      }

      jest.spyOn(columnService, 'update').mockRejectedValueOnce(new Error())

      // Assert
      expect(columnController.update('1', body, req)).rejects.toThrow(Error)
    })
  })

  describe('remove', () => {
    it('should remove a column item successfully', async () => {
      // Act
      const result = await columnController.remove('1', req)

      // Assert
      expect(result).toBeUndefined()
      expect(columnService.remove).toHaveBeenCalledTimes(1)
    })

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(columnService, 'remove').mockRejectedValueOnce(new Error())

      // Assert
      expect(columnController.remove('1',req)).rejects.toThrow(Error)
    })
  })
});
