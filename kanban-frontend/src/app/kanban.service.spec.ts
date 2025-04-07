import { TestBed } from '@angular/core/testing';
import { KanbanService } from './kanban.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // IMPORTA

describe('KanbanService', () => {
  let service: KanbanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule] // ADICIONA AQUI
    });
    service = TestBed.inject(KanbanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
