import { TestBed } from '@angular/core/testing';

import { SwimlanesService } from './swimlanes.service';

describe('SwimlanesService', () => {
  let service: SwimlanesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwimlanesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
