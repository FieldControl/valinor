import { TestBed } from '@angular/core/testing';

import { Columns } from './columns';

describe('Columns', () => {
  let service: Columns;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Columns);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
