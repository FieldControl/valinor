import { TestBed } from '@angular/core/testing';
import { GithubServiceApi } from './github.service';
import PaginationModel from '../models/pagination';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Validar serviço de repositórios do github', () => {

  let githubServiceApi: GithubServiceApi;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [  GithubServiceApi ]
    });


    githubServiceApi = TestBed.inject(GithubServiceApi);
  });

  it("Validar retorno dos repositórios", () => {
    
    let paginationModel = new PaginationModel(1, 10, "Angular");
    
    githubServiceApi.get('search/repositories', { q: paginationModel?.searchText, page: paginationModel?.page, per_page: paginationModel?.itemsPerPage })
    .subscribe((data) => {
      expect(data.items.length > 0);
    });
});

});