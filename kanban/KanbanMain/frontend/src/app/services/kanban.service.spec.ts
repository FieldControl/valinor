import { TestBed } from '@angular/core/testing';
import { KanbanService } from './kanban.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('KanbanService', () => {
  let service: KanbanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [KanbanService], 
    });
    service = TestBed.inject(KanbanService);  
  });

  it('should be created', () => {
    expect(service).toBeTruthy(); 
  });

  it('should fetch columns', () => {
    const mockColumns = [{ id: 1, title: 'To Do', cards: [] }];
    spyOn(service, 'getColumns').and.returnValue(of(mockColumns));

    service.getColumns().subscribe((columns) => {
      expect(columns).toEqual(mockColumns);
    });
  });
});
