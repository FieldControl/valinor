import { TestBed } from '@angular/core/testing';

import { GithubService } from './github-service.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('GithubService', () => {
  let service: GithubService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule]
    });
    service = TestBed.inject(GithubService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve dar set e get nas paginas corretamente', () => {
    service.page = 2;
    expect(service.page).toBe(2);
  });

  it('teste erro de pesquisa vazia', () => {
    const query = '';
    service.searchRepositorios(query).catch((error) => {
      expect(error).toBe('A pesquisa não pode estar vazia');
      expect(service.isLoading.value).toBe(false);
    });
  });
});
