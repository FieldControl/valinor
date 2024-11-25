import { TestBed } from '@angular/core/testing';
import { KanbanService } from './kanban.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('KanbanService', () => {
  let service: KanbanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Simula o HttpClient
      providers: [KanbanService], // Provedor do serviço
    });
    service = TestBed.inject(KanbanService); // Injeta o serviço
  });

  it('should be created', () => {
    expect(service).toBeTruthy(); // Testa se o serviço foi criado
  });

  it('should fetch columns', () => {
    // Simula uma chamada HTTP e verifica a estrutura básica
    const mockColumns = [{ id: 1, title: 'To Do', cards: [] }];
    spyOn(service, 'getColumns').and.returnValue(of(mockColumns));

    service.getColumns().subscribe((columns) => {
      expect(columns).toEqual(mockColumns);
    });
  });
});
