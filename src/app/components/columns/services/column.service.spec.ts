import { TestBed } from '@angular/core/testing';

import { ColumnService } from './column.service';

describe('ColumnService', () => {
  let service: ColumnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
