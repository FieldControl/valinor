import { TestBed } from '@angular/core/testing';

import { StarWarsService } from './star-wars.service';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { People } from '../models/people.model';
import { ResultWapper } from './common';

describe('StarWarsService', () => {
  let service: StarWarsService;
  let people: ResultWapper<People> = {
    count: 0,
    next: 'test',
    previous: 'test',
    results: [{"name": "Luke Skywalker", 
  "height": "172", 
  "mass": "77", 
  "hair_color": "blond", 
  "skin_color": "fair", 
  "eye_color": "blue", 
  "birth_year": "19BBY", 
  "gender": "male", 
  "homeworld": "https://swapi.dev/api/planets/1/", 
  "films": [
      "https://swapi.dev/api/films/1/", 
      "https://swapi.dev/api/films/2/", 
      "https://swapi.dev/api/films/3/", 
      "https://swapi.dev/api/films/6/"
  ], 
  "species": [], 
  "vehicles": [
      "https://swapi.dev/api/vehicles/14/", 
      "https://swapi.dev/api/vehicles/30/"
  ], 
  "starships": [
      "https://swapi.dev/api/starships/12/", 
      "https://swapi.dev/api/starships/22/"
  ], 
  "created": "2014-12-09T13:50:51.644000Z", 
  "edited": "2014-12-20T21:17:56.891000Z", 
  "url": "https://swapi.dev/api/people/1/"}]};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(StarWarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch people data via HTTP GET', () => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    httpClientSpy.get.and.returnValue(of(people));
  
    const starWarsService = new StarWarsService(httpClientSpy);
    starWarsService.getPeople().subscribe(data => {
      expect(data).toEqual(people);
    });
  });

  it('should search people via HTTP GET', () => {
    const query = 'Luke';
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    httpClientSpy.get.and.returnValue(of(people));

    const swService = new StarWarsService(httpClientSpy);
    swService.searchPeople(query).subscribe(data => {
      expect(data).toEqual(people);
    })
  });

  it('should fetch paginated da via HTTP GET', () => {
    const pageNumber = 2;
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    httpClientSpy.get.and.returnValue(of(people));

    const swService = new StarWarsService(httpClientSpy);
    swService.getPagination(pageNumber).subscribe(data => {
      expect(data).toEqual(people);
    })
  })

});
