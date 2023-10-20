import { TestBed } from '@angular/core/testing';

import { ApigitService } from './services/apigit.service';

describe('ApigitService', () => {
  let service: ApigitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApigitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
