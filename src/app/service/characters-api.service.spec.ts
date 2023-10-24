import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CharactersApiService } from './characters-api.service';

describe('CharactersApiService', () => {
  let service: CharactersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharactersApiService]
    });
    service = TestBed.inject(CharactersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make an HTTP GET request to fetch characters', () => {
    const page = 1;
    const limit = 10;
    const mockResponse = {
      data: {
        results: [{ id: 1, name: 'Character 1' }, { id: 2, name: 'Character 2' }],
        total: 2
      }
    };

    service.getCharacters(page, limit).subscribe((characters) => {
      expect(characters.length).toBe(2);
      expect(characters[0].name).toBe('Character 1');
      expect(characters[1].name).toBe('Character 2');
    });

    const request = httpMock.expectOne(
      `${service.baseUrl}?ts=2&apikey=${service.PUBLIC_KEY}&hash=${service.HASH}&offset=0&limit=${limit}`
    );

    expect(request.request.method).toBe('GET');
    request.flush(mockResponse);

    httpMock.verify();
  });

});
