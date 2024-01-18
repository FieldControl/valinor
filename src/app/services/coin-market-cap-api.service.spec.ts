import { TestBed } from '@angular/core/testing';

import { CoinMarketCapAPIService } from './coin-market-cap-api.service';

describe('CoinMarketCapAPIService', () => {
  let service: CoinMarketCapAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoinMarketCapAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
