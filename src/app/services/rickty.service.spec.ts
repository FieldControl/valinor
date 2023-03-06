import { TestBed } from '@angular/core/testing';

import { RicktyService } from './rickty.service';

describe('RicktyService', () => {
  let service: RicktyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RicktyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
