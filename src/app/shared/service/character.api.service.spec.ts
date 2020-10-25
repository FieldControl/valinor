import { TestBed } from '@angular/core/testing';

import { CharactersApiService } from './character.api.service';

describe('Character.ApiService', () => {
  let service: CharactersApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharactersApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
