import { TestBed } from '@angular/core/testing';
import { ColumnModel, KanbanService } from './kanban.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';

describe('KanbanService', () => {
  let service: KanbanService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KanbanService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(KanbanService);
    httpTesting = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getColumnsWithCards - Deve retornar lista de colunas com cards', async () => {
    const mockResponse: ColumnModel[] = [
      {
        id: 1,
        name: 'To Do',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        cards: [
          {
            id: 1,
            name: 'Sample Card',
            columnId: 1,
            position: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ];

    const promise = firstValueFrom(service.getColumnsWithCards());

    const req = httpTesting.expectOne(`${environment.apiUrl}/column/with-cards`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const columns = await promise;
    expect(columns).toEqual(mockResponse);
    expect(columns.length).toBe(1);
    expect(columns[0].cards.length).toBe(1);
  });

  it('createColumn - Deve fazer POST correto', () => {
    const newColumn = { name: 'In Progress' };
    const mockResponse: ColumnModel = {
      id: 2,
      name: 'In Progress',
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: [],
    };

    service.createColumn(newColumn).subscribe();

    const req = httpTesting.expectOne(`${environment.apiUrl}/column`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newColumn);
    req.flush(mockResponse);
  });
});
