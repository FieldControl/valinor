import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import TesteUtil from '../../common/test/TestUtil';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { ColumnTable } from '../columns/columns.entity';
import { ColumnsService } from '../columns/columns.service';
import { Card } from './cards.entity';
import { CardsService } from './cards.service';

describe('CardsService', () => {
  let service: CardsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRepositoryUser = {
    findOne: jest.fn(),
  };

  const mockRepositoryColumn = {
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        UserService,
        ColumnsService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepositoryUser,
        },
        {
          provide: getRepositoryToken(ColumnTable),
          useValue: mockRepositoryColumn,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  beforeEach(() => {
    mockRepository.find.mockReset();
    mockRepository.findOne.mockReset();
    mockRepository.create.mockReset();
    mockRepository.save.mockReset();
    mockRepository.update.mockReset();
    mockRepository.remove.mockReset();
    mockRepositoryColumn.findOne.mockReset();
    mockRepositoryUser.findOne.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When search all Cards', () => {
    it('should be list all cards', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.find.mockReturnValue([card, card]);
      const cards = await service.findAllCard();

      expect(cards).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('When search Card By Id', () => {
    it('should find a existing card by id', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.findOne.mockReturnValue(card);
      const cardFound = await service.findCardById('1');

      expect(cardFound).toMatchObject({ title: card.title });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return an expectation when it does not find a card by id', async () => {
      mockRepository.findOne.mockReturnValue(null);

      expect(service.findCardById('8')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('When search Card By userId', () => {
    it('should find a existing card by userId', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.find.mockReturnValue(card);
      const cardFound = await service.findCardByUserId('1');

      expect(cardFound).toMatchObject({ title: card.title });
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an expectation when it does not find a card by userId', async () => {
      mockRepository.find.mockReturnValue(null);

      expect(service.findCardByUserId('5')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('When search Card By columnId', () => {
    it('should find a existing card by columnId', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.find.mockReturnValue(card);
      const cardFound = await service.findCardByColumnId('1');

      expect(cardFound).toMatchObject({ title: card.title });
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an expectation when it does not find a card by columnId', async () => {
      mockRepository.find.mockReturnValue(null);

      expect(service.findCardByColumnId('5')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('When create card', () => {
    it('should create a card', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.save.mockReturnValue(card);
      mockRepository.create.mockReturnValue(card);
      mockRepositoryColumn.findOne.mockReturnValue(card.columnsTable);
      mockRepositoryUser.findOne.mockReturnValue(card.user);

      const data = {
        title: card.title,
        description: card.description,
        column: card.columnsTable.id,
        user: card.user.id,
      };

      const cardUser = await service.createCard(data);
      expect(cardUser).toMatchObject(card);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepositoryColumn.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepositoryUser.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return a expection when doesnt create a card', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.save.mockReturnValue(null);
      mockRepository.create.mockReturnValue(card);

      mockRepositoryColumn.findOne.mockReturnValue(card.columnsTable);
      mockRepositoryUser.findOne.mockReturnValue(card.user);

      const data = {
        title: card.title,
        description: card.description,
        column: card.columnsTable.id,
        user: card.user.id,
      };

      await service.createCard(data).catch((e) => {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e).toMatchObject({
          message: 'Error when creating a new card.',
        });
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
        expect(mockRepositoryColumn.findOne).toHaveBeenCalledTimes(1);
        expect(mockRepositoryUser.findOne).toHaveBeenCalledTimes(1);
      });
    });

    it('should return an error when it doesnt find a user', async () => {
      const card = TesteUtil.giveAMeAValidCard();

      mockRepositoryColumn.findOne.mockReturnValue(card.columnsTable);
      mockRepositoryUser.findOne.mockReturnValue(null);

      const data = {
        title: card.title,
        description: card.description,
        column: card.columnsTable.id,
        user: card.user.id,
      };

      await service.createCard(data).catch((e) => {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e).toMatchObject({
          message: 'User not found',
        });
      });

      expect(mockRepositoryColumn.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepositoryUser.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return an error when it doesnt find a column', async () => {
      const card = TesteUtil.giveAMeAValidCard();

      mockRepositoryColumn.findOne.mockReturnValue(null);

      const data = {
        title: card.title,
        description: card.description,
        column: card.columnsTable.id,
        user: card.user.id,
      };

      await service.createCard(data).catch((e) => {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e).toMatchObject({
          message: 'Column not found',
        });
      });

      expect(mockRepositoryColumn.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('When update Card', () => {
    it('should update a card', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      const newCardUpdate = {
        title: 'Card Alter',
        description: 'New description',
      };

      const cardUpdate = {
        ...card,
        ...newCardUpdate,
      };

      mockRepository.findOne.mockReturnValue(card);
      mockRepository.save.mockReturnValue(cardUpdate);

      const resultCard = await service.updateCard('1', newCardUpdate);

      expect(resultCard.title).toEqual(newCardUpdate.title);
      expect(resultCard.description).toEqual(newCardUpdate.description);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update the user of a card', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      const user = TesteUtil.giveAMeAValidUser();

      const userId = user.id;

      const updatedCard = {
        ...card,
        ...user,
      };

      mockRepositoryUser.findOne.mockReturnValue(user);
      mockRepository.findOne.mockReturnValue(card);
      mockRepository.save.mockReturnValue(updatedCard);

      const resultCard = await service.updateUserToCard('1', {
        user: userId,
      });

      expect(resultCard.user.id).toEqual(userId);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepositoryUser.findOne).toHaveBeenCalledTimes(1);
    });

    it('should update the column of a card', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      const column = TesteUtil.giveAMeAValidColumn();

      const columnId = column.id;

      const updatedCard = {
        ...card,
        ...column,
      };

      mockRepositoryColumn.findOne.mockReturnValue(column);
      mockRepository.findOne.mockReturnValue(card);
      mockRepository.save.mockReturnValue(updatedCard);

      const resultCard = await service.updateColumnToCard('1', {
        column: columnId,
      });

      expect(resultCard.columnsTable.id).toEqual(columnId);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepositoryColumn.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('When delete Card', () => {
    it('Should delete a existing card', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.findOne.mockReturnValue(card);
      mockRepository.remove.mockReturnValue(card);

      const deletedCard = await service.deleteCard('1');

      expect(deletedCard).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });

    it('Should not delete a inexisting card', async () => {
      const card = TesteUtil.giveAMeAValidCard();
      mockRepository.findOne.mockReturnValue(card);
      mockRepository.remove.mockReturnValue(null);

      const deletedCard = await service.deleteCard('9');

      expect(deletedCard).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });
  });
});
