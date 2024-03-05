import { TestBed } from '@angular/core/testing';

import { BadgeService } from './badge.service';

describe('BadgeService', () => {
  let service: BadgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BadgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
