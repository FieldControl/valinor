import { TestBed } from '@angular/core/testing';

import { KanbanApiService } from './kanban-api.service';

describe('KanbanApiService', () => {
  let service: KanbanApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KanbanApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
