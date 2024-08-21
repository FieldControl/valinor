import { TestBed } from '@angular/core/testing';

import { CartaoService } from './cartao.service';

describe('CartaoService', () => {
  let service: CartaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
