import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PokeAPIService } from './poke-api.service';

describe('PokeAPIService', () => {
  let service: PokeAPIService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokeAPIService], 
    });
    service = TestBed.inject(PokeAPIService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve criar o service', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar os pokemons paginados', () => {
    const expectedData = { results: [{ name: 'pikachu' }, { name: 'charizard' }], count: 2 };
    service.listarPokemonsPaginado().subscribe((data) => {
      expect(data).toEqual(expectedData);
    });
    const req = httpTestingController.expectOne(`${service.urlPokeAPI}pokemon`);
    expect(req.request.method).toEqual('GET');
    req.flush(expectedData);
  });

  it('deve listar os pokemons por nome ou id', () => {
    const pokemonName = 'pikachu';
    const expectedData = { name: 'pikachu', height: 40, weight: 6 };
    service.listarPokemonPorIdOuNome(pokemonName).subscribe((data) => {
      expect(data).toEqual(expectedData);
    });
    const req = httpTestingController.expectOne(`${service.urlPokeAPI}pokemon/${pokemonName}`);
    expect(req.request.method).toEqual('GET');
    req.flush(expectedData);
  });

  it('deve fazer requests do tipo get', () => {
    const testUrl = 'https://example.com/data';
    service.chamarRequestGET(testUrl).subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toEqual('GET');
  });
});
