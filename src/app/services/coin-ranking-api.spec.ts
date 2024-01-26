import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CoinRankingAPIService } from './coin-ranking-api.service';

describe('CoinRakingAPIService', () => {
  let service!: CoinRankingAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoinRankingAPIService],
    });
    service = TestBed.inject(CoinRankingAPIService);
  });

  it('Deve verificar instância criada', () => {
    expect(service).toBeTruthy();
  });

  it('Deve iniciar string vazia em "search"', () => {
    expect(service.search).toBeFalsy();
  });

  it('Deve iniciar com valor 8 em limit', () => {
    expect(service.limit).toEqual(8);
  });

  it('Deve iniciar com valor 0 em offset', () => {
    expect(service.offset).toBeFalsy();
  });
});
