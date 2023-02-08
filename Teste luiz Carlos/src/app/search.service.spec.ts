import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Item } from './item';

import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search', () => {
    const items: Item[] = [
      {
        avatar_url: 'https://avatars.githubusercontent.com/u/4036277?v=4',
        login: 'LogIN-',
        type: 'User',
      },
      {
        avatar_url: 'https://avatars.githubusercontent.com/u/14163949?v=4',
        login: 'LoginovIlya',
        type: 'User',
      },
    ];

    const result = {

    }

    const login = 'login'
    let url = `https://api.github.com/search/users?q=${login} in:login`
    service.search(login)
    const req = httpMock.expectOne(url);

    req.flush({ items: items });

    expect(req.request.method).toEqual('GET')
    expect(service.items).toEqual(items)
    expect(service.limit).toEqual(9)
    expect(service.numOfPages).toEqual(1)
    expect(service.skip).toEqual(0)
    expect(service.currentPage).toEqual(1)
  });

  it('should report error', () => {
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
    const error = "Http failure response for https://api.github.com/search/users?q=login in:login: 400 Bad Request"
    const login = 'login'
    let url = `https://api.github.com/search/users?q=${login} in:login`
    service.search(login)
    httpMock.expectOne(url).flush({}, mockErrorResponse)
    expect(service.error).toEqual(error)
  })

  it('should sort column', () => {
    const items: Item[] = [
      {
        avatar_url: 'https://avatars.githubusercontent.com/u/4036277?v=4',
        login: 'LogIN-',
        type: 'User',
      },
      {
        avatar_url: 'https://avatars.githubusercontent.com/u/14163949?v=4',
        login: 'LoginovIlya',
        type: 'Admin',
      },
    ];
    const login = 'login'
    let url = `https://api.github.com/search/users?q=${login} in:login`
    service.search(login)
    const req = httpMock.expectOne(url);

    req.flush({ items: items });

    service.sort('login', true)
    expect(service.items[0].login === 'LogIN-')
    service.sort('login', false)
    expect(service.items[0].login === 'LoginovIlya')

    service.sort('type', true)
    expect(service.items[0].type === 'Admin')
    service.sort('type', false)
    expect(service.items[0].login === 'User')
  })
});
