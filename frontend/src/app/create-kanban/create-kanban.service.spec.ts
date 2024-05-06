import { TestBed } from '@angular/core/testing';

import { CreateKanbanService } from './create-kanban.service';

describe('CreateKanbanService', () => {
  let service: CreateKanbanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateKanbanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
