import { TestBed } from '@angular/core/testing';

import { MoviesService } from './movies.service';
import { HttpClientModule } from '@angular/common/http';
import { Film } from '../models/film.model';
import { of } from 'rxjs';

describe('MoviesService', () => {
  let service: MoviesService;
  let films: Film[] = [
    {
      "characters": ["https://swapi.dev/api/people/1/"],
      "created": "test",
      "director": "test",
      "edited": "test",
      "episode_id": 1,
      "opening_crawl": "test",
      "planets": ["https://swapi.dev/api/planets/1/"],
      "producer": "test",
      "release_date": "test",
      "species": ["https://swapi.dev/api/species/1/"],
      "starships": ["https://swapi.dev/api/starships/1/"],
      "title": "test",
      "url": "https://swapi.dev/api/films/1/",
      "vehicles": ["https://swapi.dev/api/vehicles/1/"]
    },
    {
      "characters": ["https://swapi.dev/api/people/2/"],
      "created": "test",
      "director": "test",
      "edited": "test",
      "episode_id": 2,
      "opening_crawl": "test",
      "planets": ["https://swapi.dev/api/planets/2/"],
      "producer": "test",
      "release_date": "test",
      "species": ["https://swapi.dev/api/species/2/"],
      "starships": ["https://swapi.dev/api/starships/2/"],
      "title": "test",
      "url": "https://swapi.dev/api/films/2/",
      "vehicles": ["https://swapi.dev/api/vehicles/2/"]
    },
    {
      "characters": ["https://swapi.dev/api/people/3/"],
      "created": "test",
      "director": "test",
      "edited": "test",
      "episode_id": 3,
      "opening_crawl": "test",
      "planets": ["https://swapi.dev/api/planets/3/"],
      "producer": "test",
      "release_date": "test",
      "species": ["https://swapi.dev/api/species/3/"],
      "starships": ["https://swapi.dev/api/starships/3/"],
      "title": "test",
      "url": "https://swapi.dev/api/films/3/",
      "vehicles": ["https://swapi.dev/api/vehicles/3/"]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(MoviesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getFilmData for each URL and return combined results', () => {

    const mockUrls = ['https://swapi.dev/api/films/1/', 'https://swapi.dev/api/films/2/',
  'https://swapi.dev/api/films/3/'];
    const mockFilms = films;
    const expectedResult = [mockFilms[0], mockFilms[1], mockFilms[2]];

    spyOn(service, 'getFilmData').and.returnValues(
      of(mockFilms[0]),
      of(mockFilms[1]),
      of(mockFilms[2])
    );

   service.getMultiFilms(mockUrls).subscribe((res) => {
    expect(service.getFilmData).toHaveBeenCalledWith('https://swapi.dev/api/films/1/');
    expect(service.getFilmData).toHaveBeenCalledWith('https://swapi.dev/api/films/2/');
    expect(service.getFilmData).toHaveBeenCalledWith('https://swapi.dev/api/films/3/');

    expect(res).toEqual(expectedResult);

   });
  });

  it('should fetch a film via HTTP GET', () => {
    
    const mockUrl = 'https://swapi.dev/api/films/1/'

    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    
    httpClientSpy.get.and.returnValue(of(films[0]));

    const movieService = new MoviesService(httpClientSpy);
    movieService.getFilmData(mockUrl).subscribe( res => {
      expect(res).toEqual(films[0]);
    });
  });

});
