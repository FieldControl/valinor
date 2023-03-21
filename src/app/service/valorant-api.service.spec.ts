import { TestBed } from '@angular/core/testing';

import { ValorantApiService } from './valorant-api.service';

describe('JojoApiService', () => {
  let service: ValorantApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValorantApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
