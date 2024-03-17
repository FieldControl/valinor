import { TestBed } from '@angular/core/testing';

import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { CreateCardRequest } from 'src/app/models/interface/card/request/CreateCardRequest';
import { EditCardRequest } from 'src/app/models/interface/card/request/EditCardRequest';
import { EditColumnToCard } from 'src/app/models/interface/card/request/EditColumnToCard';
import { CardsResponse } from 'src/app/models/interface/card/response/CardsResponse';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [CardService],
    });
    service = TestBed.inject(CardService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Get all cards', () => {
    it('should return all columns', () => {
      const mockCards: Array<CardsResponse> = [
        {
          id: '1',
          title: 'new title',
          description: 'new description',
          columnsTable: {
            id: '1',
          },
          user: {
            id: '1',
            name: 'john doe',
          },
        },

        {
          id: '2',
          title: 'new title 2',
          description: 'new description 2',
          columnsTable: {
            id: '1',
          },
          user: {
            id: '1',
            name: 'john doe',
          },
        },
      ];

      service.getAllCards().subscribe((cards) => {
        expect(cards).toEqual(mockCards);
      });

      const op = controller.expectOne('GetAllCards');

      op.flush({
        data: {
          cards: mockCards,
        },
      });
    });
  });

  describe('Create card', () => {
    it('should possible to create a card', () => {
      const mockCards: CreateCardRequest = {
        title: 'new title',
        description: 'new description',
        column: '1',
        user: '1',
      };

      const mockCardsReturn: CardsResponse = {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: 'john doe',
        },
      };

      service.createCard(mockCards).subscribe((cards) => {
        expect(cards).toEqual(mockCardsReturn);
        expect(cards.id).toEqual(mockCardsReturn.id);
        expect(cards.title).toEqual(mockCardsReturn.title);
        expect(cards.description).toEqual(mockCardsReturn.description);
      });

      const op = controller.expectOne('createCard');

      op.flush({
        data: {
          cards: mockCardsReturn,
        },
      });
    });
  });

  describe('Edit card', () => {
    it('should possible to edit a card', () => {
      const mockCards: EditCardRequest = {
        id: '1',
        title: 'title update',
      };

      const mockCardsReturn: CardsResponse = {
        id: '1',
        title: 'title update',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: 'john doe',
        },
      };

      service.editCard(mockCards).subscribe((cards) => {
        expect(cards).toEqual(mockCardsReturn);
        expect(cards.id).toEqual(mockCardsReturn.id);
        expect(cards.title).toEqual(mockCardsReturn.title);
      });

      const op = controller.expectOne('updateCard');

      op.flush({
        data: {
          cards: mockCardsReturn,
        },
      });
    });

    it('should possible to edit a user to Card', () => {
      const mockCards: EditCardRequest = {
        id: '1',
        user: '2',
      };

      const mockCardsReturn: CardsResponse = {
        id: '1',
        title: 'title update',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '2',
          name: 'john doe',
        },
      };

      service.editUserToCard(mockCards).subscribe((cards) => {
        expect(cards).toEqual(mockCardsReturn);
        expect(cards.user.id).toEqual(mockCardsReturn.user.id);
      });

      const op = controller.expectOne('updateUserToCard');

      op.flush({
        data: {
          cards: mockCardsReturn,
        },
      });
    });

    it('should possible to edit a column to Card', () => {
      const mockCards: EditColumnToCard = {
        id: '1',
        column: '2',
      };

      const mockCardsReturn: CardsResponse = {
        id: '1',
        title: 'title update',
        description: 'new description',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '1',
          name: 'john doe',
        },
      };

      service.editColumnToCard(mockCards).subscribe((cards) => {
        expect(cards).toEqual(mockCardsReturn);
        expect(cards.columnsTable.id).toEqual(mockCardsReturn.columnsTable.id);
      });

      const op = controller.expectOne('UpdateColumnToCard');

      op.flush({
        data: {
          cards: mockCardsReturn,
        },
      });
    });
  });

  describe('Delete card', () => {
    it('should possible to delete a card', () => {
      const id: string = '1';

      service.deleteCard(id).subscribe((response) => {
        expect(response).toBeTrue();
      });

      const op = controller.expectOne('deleteCard');

      op.flush({
        data: {
          response: true,
        },
      });
    });
  });
});
