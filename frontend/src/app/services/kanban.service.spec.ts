import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { KanbanService } from './kanban.service';
import { environment } from '../../environments/environment';
import { Kanban } from '../models/kanban';
import { Card } from '../models/card';

describe('KanbanService', () => {
  let service: KanbanService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [KanbanService]
    });
    service = TestBed.inject(KanbanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch kanbans from API', () => {
    const mockKanbans: Kanban[] = [
      { id: '1', name: 'Kanban 1', cards: [] },
      { id: '2', name: 'Kanban 2', cards: [] }
    ];

    service.list().subscribe(kanbans => {
      expect(kanbans.length).toBe(2);
      expect(kanbans).toEqual(mockKanbans);
    });

    const request = httpMock.expectOne(`${environment.baseApiUrl}/kanbans`);
    expect(request.request.method).toBe('GET');
    request.flush(mockKanbans);
  });

  it('should create a kanban', () => {
    const mockKanban: Kanban = { id: '1', name: 'New Kanban', cards: [] };
    const mockResponse = { kanban: mockKanban, message: 'Kanban created successfully' };
    service.create(mockKanban).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${environment.baseApiUrl}/kanbans`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
  });

  it('should delete a kanban', () => {
    const kanbanId = '1';
    const mockResponse = { kanban: { id: kanbanId, name: 'Kanban 1', cards: [] }, message: 'Kanban deleted successfully' };
    service.delete(kanbanId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${environment.baseApiUrl}/kanbans/${kanbanId}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(mockResponse);
  });

  it('should update a kanban', () => {
    const updatedKanban: Kanban = { id: '1', name: 'Updated Kanban', cards: [] };
    service.update(updatedKanban).subscribe(kanban => {
      expect(kanban).toEqual(updatedKanban);
    });
    const req = httpMock.expectOne(`${environment.baseApiUrl}/kanbans/${updatedKanban.id}`);
    expect(req.request.method).toEqual('PATCH');
    req.flush(updatedKanban);
  });

  it('should list cards for a kanban', () => {
    const kanbanId = '1';
    const mockCards: Card[] = [{ id: '1', title: 'Card 1', kanban_id: kanbanId, order: 0 }];
    service.listCardKanban(kanbanId).subscribe(cards => {
      expect(cards).toEqual(mockCards);
    });
    const req = httpMock.expectOne(`${environment.baseApiUrl}/kanbans/${kanbanId}/cards`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockCards);
  });

  it('should create a card in a kanban', () => {
    const kanbanId = '1';
    const newCard: Card = { id: '1', title: 'New Card', kanban_id: kanbanId, order: 0 };
    const mockResponse = { card: newCard, message: 'Card created successfully' };
    service.createCardInKanban(newCard, kanbanId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${environment.baseApiUrl}/kanbans/${kanbanId}/cards`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
  });

});
