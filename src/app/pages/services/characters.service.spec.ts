import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CharactersService } from './characters.service';
import { Character, CharactersResponse } from './../../models/character.model';
import { of } from 'rxjs';

describe('CharactersService', () => {
  let service: CharactersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharactersService]
    });

    service = TestBed.inject(CharactersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacters', () => {
    it('should return an Observable<Character[]>', () => {
      const mockCharactersResponse: CharactersResponse = {
        code: 200,
        status: 'Ok',
        data: {
          offset: 0,
          limit: 20,
          total: 100,
          count: 20,
          results: [
            {
              comics: { available: 1, items: [{ name: 'Comic 1' }] },
              name: 'Spider-Man',
              id: '1',
              description: 'Friendly neighborhood Spider-Man',
              thumbnail: { path: 'path/to/image', extension: 'jpg' },
              urls: [{ type: 'Wiki', url: 'https://en.wikipedia.org/wiki/Spider-Man' }]
            }
          ]
        }
      };
      const mockCharacters: Character[] = mockCharactersResponse.data.results;

      service.getCharacters(0).subscribe((characters: Character[]) => {
        expect(characters.length).toBe(1);
        expect(characters).toEqual(mockCharacters);
      });

      const req = httpMock.expectOne(`${service['_BASE_URL']}/characters?orderBy=name&offset=0&apikey=${service['apiPublicKey']}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharactersResponse);
    });
  });

  describe('getCharacterByName', () => {
    it('should return an Observable<Character[]>', () => {
      const mockCharactersResponse: CharactersResponse = {
        code: 200,
        status: 'Ok',
        data: {
          offset: 0,
          limit: 20,
          total: 100,
          count: 20,
          results: [
            {
              comics: { available: 1, items: [{ name: 'Comic 1' }] },
              name: 'Spider-Man',
              id: '1',
              description: 'Friendly neighborhood Spider-Man',
              thumbnail: { path: 'path/to/image', extension: 'jpg' },
              urls: [{ type: 'Wiki', url: 'https://en.wikipedia.org/wiki/Spider-Man' }]
            }
          ]
        }
      };
      const mockCharacters: Character[] = mockCharactersResponse.data.results;
      const name = 'Spider';
      const offset = 0;

      service.getCharacterByName(name, offset).subscribe((characters: Character[]) => {
        expect(characters.length).toBe(1);
        expect(characters).toEqual(mockCharacters);
      });

      const req = httpMock.expectOne(`${service['_BASE_URL']}characters?nameStartsWith=${name}&orderBy=name&offset=${offset}&apikey=${service['apiPublicKey']}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharactersResponse);
    });
  })

  describe('getTotalCharacters', () => {
    it('should return the total number of characters', () => {
      const expectedTotal = 100;

      service['totalCharacters'].next(expectedTotal);
      const result$ = service.getTotalCharacters();

      result$.subscribe((total: number) => {
        expect(total).toEqual(expectedTotal);
      });
    });

  });

})
