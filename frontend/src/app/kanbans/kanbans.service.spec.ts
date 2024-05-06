import { TestBed } from '@angular/core/testing';

import { KanbansService } from './kanbans.service';

describe('KanbansService', () => {
  let service: KanbansService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KanbansService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
