import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GitserviceService } from '../../services/gitservice.service';
import { gitModel, searchRepoModel } from '../../models/git.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-git-search',
  templateUrl: './git-search.component.html',
  styleUrls: ['./git-search.component.scss']
})
export class GitSearchComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public allRepos: Array<gitModel> = [];

  public searchRepo?: searchRepoModel;

  // * paginator configuration * //  
  public total?: number = 0;
  public pageSize: number = 10;
  public pageNumber: number = 1;

  //*Search Repo*//
  public repoName: string = '';

  constructor(private gitserviceService: GitserviceService) {
    this.gitserviceService.getReposGitHub.subscribe((response) => {
      if (response) {
        this.allRepos = response[0].items;
        this.total = response[0].total_count;
        this.paginator.length = this.total;
        this.repoName = response[1];
      }
    });
  }
  ngOnInit(): void {   
  }
  
  public async getSearchRepo(repoName: string, pageNumber: number, pageSize: number) {
    if (this.repoName) {
      const reponse = await this.gitserviceService.getSearchReposGitHub(repoName, pageNumber, pageSize).toPromise();
      if (reponse) {
        this.searchRepo = reponse;
        this.allRepos = this.searchRepo.items;
        this.total = reponse.total_count;
        this.paginator.length = this.total;
      }
    }
  }

  public onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    if (this.paginator) {
      this.getSearchRepo(this.repoName, this.pageNumber, this.pageSize);
    }
  }
}
