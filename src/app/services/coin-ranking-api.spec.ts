import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CoinRankingAPIService } from './coin-ranking-api.service';
import { DataCoinRanking } from '../models/crypto-coin';

describe('CoinRakingAPIService', () => {
  let service!: CoinRankingAPIService;
  let httpTestingController: HttpTestingController;
  let CoinRankingAPIServiceMock: any;

  beforeEach(() => {
    CoinRankingAPIServiceMock = {
      getCryptoData: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: CoinRankingAPIService, useValue: CoinRankingAPIServiceMock }],
    })
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

  /*
  it('Deve verificar retorno do método getCryptoData', () => {
    expect(service.getCryptoData()).toBeTruthy();
  });
  
  it('Deve retornar model correto em getCryptoData', done => {
    const resMock: DataCoinRanking = {
      status: 'string',
      data: {
        stats: {
          total: 1,
          totalCoins: 1,
          totalMarkets: 1,
          totalExchanges: 1,
          totalMarketCap: '123',
          total24hVolume: '123',
        },
        coins: [
          {
            uuid: '1',
            symbol: 'TST',
            name: 'teste',
            color: '#fff',
            iconUrl: 'icon',
            marketCap: '1234',
            price: 'string',
            btcPrice: 'string',
            listedAt: 1,
            tier: 1,
            change: 'string',
            rank: 1,
            sparkline: [],
            lowVolume: true,
            coinrankingUrl: 'string',
            '24hVolume': 'string',
          },
        ],
      },
    };
    
    service.getCryptoData().subscribe({
      next: data => {
        expect(data).toEqual(resMock);
      },
    });
    done();
  });
});

it('Deve retornar status 200 em getCryptoData', () => {
  const resMock: DataCoinRanking = {
    status: 'string',
    data: {
      stats: {
        total: 1,
        totalCoins: 1,
        totalMarkets: 1,
        totalExchanges: 1,
        totalMarketCap: '123',
        total24hVolume: '123',
      },
      coins: [
        {
          uuid: '1',
          symbol: 'TST',
          name: 'teste',
          color: '#fff',
          iconUrl: 'icon',
          marketCap: '1234',
          price: 'string',
          btcPrice: 'string',
          listedAt: 1,
          tier: 1,
          change: 'string',
          rank: 1,
          sparkline: [],
          lowVolume: true,
          coinrankingUrl: 'string',
          '24hVolume': 'string',
        },
      ],
    },
  };
  */
});
