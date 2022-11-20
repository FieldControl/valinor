/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CharactersApiService } from './characters-api.service';

describe('Service: CharactersApi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CharactersApiService]
    });
  });

  it('should ...', inject([CharactersApiService], (service: CharactersApiService) => {
    expect(service).toBeTruthy();
  }));
});
