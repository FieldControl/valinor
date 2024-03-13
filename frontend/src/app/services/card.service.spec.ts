import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { CardService } from './card.service';
import { Card } from '../models/card';

describe('CardService', () => {
  let service: CardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CardService]
    });
    service = TestBed.inject(CardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should delete a card', () => {
    const idCard = '1';
    service.deleteCard(idCard).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.message).toBe('Card deleted successfully');
    });
    const req = httpMock.expectOne(`${environment.baseApiUrl}/cards/${idCard}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({ card: null, message: 'Card deleted successfully' });
  });

  it('should update a card', () => {
    const cardToUpdate: Card = {
      id: '1',
      kanban_id: '1',
      title: 'Updated Title',
      description: 'Updated Description',
      date_end: new Date(),
      order: 0
    };

    service.updateCard(cardToUpdate).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.title).toBe(cardToUpdate.title);
      expect(response.description).toBe(cardToUpdate.description);
    });

    const req = httpMock.expectOne(`${environment.baseApiUrl}/cards/${cardToUpdate.id}`);
    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({
      kanban_id: cardToUpdate.kanban_id,
      title: cardToUpdate.title,
      description: cardToUpdate.description,
      date_end: cardToUpdate.date_end,
      order: cardToUpdate.order
    });

    req.flush(cardToUpdate);
  });

  it('should link a badge to a card', () => {
    const cardId = '1';
    const badgeId = '2';

    service.linkBadgeToCard(cardId, badgeId).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.baseApiUrl}/cards/${cardId}/badge/${badgeId}`);
    expect(req.request.method).toEqual('PATCH');

    req.flush({});
  });

  it('should unlink a badge from a card', () => {
    const cardId = '1';
    const badgeId = '2';

    service.unlinkBadgeToCard(cardId, badgeId).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.baseApiUrl}/cards/${cardId}/badge/${badgeId}`);
    expect(req.request.method).toEqual('DELETE');

    req.flush({});
  });
});
