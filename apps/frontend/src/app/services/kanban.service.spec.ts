import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { KanbanService } from './kanban.service';
import { Column, Card } from '../models';

describe('KanbanService', () => {
  let service: KanbanService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [KanbanService],
    });
    service = TestBed.inject(KanbanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getColumns', () => {
    it('should return columns', () => {
      const mockColumns: Column[] = [
        {
          id: 1,
          title: 'To Do',
          description: 'Tasks to be done',
          position: 0,
          color: '#3B82F6',
          cards: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.getColumns().subscribe((columns) => {
        expect(columns).toEqual(mockColumns);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/columns');
      expect(req.request.method).toBe('GET');
      req.flush(mockColumns);
    });
  });

  describe('createColumn', () => {
    it('should create a new column', () => {
      const newColumn = {
        title: 'New Column',
        description: 'New column description',
        color: '#FF5733',
      };

      const mockResponse: Column = {
        id: 2,
        title: 'New Column',
        description: 'New column description',
        position: 1,
        color: '#FF5733',
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.createColumn(newColumn).subscribe((column) => {
        expect(column).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/columns');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newColumn);
      req.flush(mockResponse);
    });
  });

  describe('updateColumn', () => {
    it('should update a column', () => {
      const columnId = 1;
      const updateData = {
        title: 'Updated Column',
        color: '#00FF00',
      };

      const mockResponse: Column = {
        id: 1,
        title: 'Updated Column',
        description: 'Tasks to be done',
        position: 0,
        color: '#00FF00',
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateColumn(columnId, updateData).subscribe((column) => {
        expect(column).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `http://localhost:3000/api/columns/${columnId}`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('deleteColumn', () => {
    it('should delete a column', () => {
      const columnId = 1;

      service.deleteColumn(columnId).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(
        `http://localhost:3000/api/columns/${columnId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('createCard', () => {
    it('should create a new card', () => {
      const newCard = {
        title: 'New Card',
        description: 'New card description',
        columnId: 1,
        priority: 'medium' as const,
      };

      const mockResponse: Card = {
        id: 1,
        title: 'New Card',
        description: 'New card description',
        position: 0,
        color: '#3B82F6',
        priority: 'medium',
        columnId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.createCard(newCard).subscribe((card) => {
        expect(card).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/cards');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCard);
      req.flush(mockResponse);
    });
  });

  describe('updateCard', () => {
    it('should update a card', () => {
      const cardId = 1;
      const updateData = {
        title: 'Updated Card',
        priority: 'high' as const,
      };

      const mockResponse: Card = {
        id: 1,
        title: 'Updated Card',
        description: 'New card description',
        position: 0,
        color: '#3B82F6',
        priority: 'high',
        columnId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateCard(cardId, updateData).subscribe((card) => {
        expect(card).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `http://localhost:3000/api/cards/${cardId}`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', () => {
      const cardId = 1;

      service.deleteCard(cardId).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(
        `http://localhost:3000/api/cards/${cardId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('moveCard', () => {
    it('should move a card to a different column', () => {
      const cardId = 1;
      const moveData = {
        columnId: 2,
        position: 0,
      };

      const mockResponse: Card = {
        id: 1,
        title: 'Moved Card',
        description: 'Card description',
        position: 0,
        color: '#3B82F6',
        priority: 'medium',
        columnId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.moveCard(cardId, moveData).subscribe((card) => {
        expect(card).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `http://localhost:3000/api/cards/${cardId}/move`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(moveData);
      req.flush(mockResponse);
    });
  });

  describe('updateColumnPositions', () => {
    it('should update column positions', () => {
      const columnUpdates = [
        { id: 1, position: 0 },
        { id: 2, position: 1 },
      ];

      const mockResponse: Column[] = [
        {
          id: 1,
          title: 'Column 1',
          position: 0,
          color: '#3B82F6',
          cards: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Column 2',
          position: 1,
          color: '#FF5733',
          cards: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.updateColumnPositions(columnUpdates).subscribe((columns) => {
        expect(columns).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/columns/positions/update'
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(columnUpdates);
      req.flush(mockResponse);
    });
  });

  describe('updateCardPositions', () => {
    it('should update card positions', () => {
      const cardUpdates = [
        { id: 1, position: 0, columnId: 1 },
        { id: 2, position: 1, columnId: 1 },
      ];

      const mockResponse: Card[] = [
        {
          id: 1,
          title: 'Card 1',
          position: 0,
          color: '#3B82F6',
          priority: 'medium',
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Card 2',
          position: 1,
          color: '#FF5733',
          priority: 'high',
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.updateCardPositions(cardUpdates).subscribe((cards) => {
        expect(cards).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/cards/positions/update'
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(cardUpdates);
      req.flush(mockResponse);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const mockResponse = {
        status: 'ok',
        message: 'API is running',
      };

      service.getHealth().subscribe((health) => {
        expect(health).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
