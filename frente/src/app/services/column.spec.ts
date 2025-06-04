import { TestBed } from '@angular/core/testing';

import { Column } from './column';

describe('Column', () => {
  let service: Column;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Column);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
