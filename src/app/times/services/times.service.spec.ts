import { TestBed } from '@angular/core/testing';

import { TimesService } from './times.service';

describe('TimesService', () => {
  let service: TimesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
