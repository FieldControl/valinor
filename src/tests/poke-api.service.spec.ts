import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PokeApiService } from '../app/service/poke-api.service';

describe('PokeApiService', () => {
  let service: PokeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokeApiService]
    });
    service = TestBed.inject(PokeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of all pokemons', () => {
    const mockResponse = {
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' }
      ]
    };
    service.apiListAllPokemons.subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should return a pokemon by url', () => {
    const mockResponse = { name: 'bulbasaur', id: 1 };
    const url = 'https://pokeapi.co/api/v2/pokemon/1/';
    service.apiGetPokemon(url).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});