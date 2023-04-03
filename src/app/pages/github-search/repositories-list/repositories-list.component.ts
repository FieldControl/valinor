import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { GithubService } from '../../services/github.service';
import { Repositories } from '../../../models/repositories.model';

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  styleUrls: ['./repositories-list.component.scss']
})
export class RepositoriesListComponent implements OnInit {

  public searchTerm: string = "Bootstrap";
  public repositorios: Repositories = {} as Repositories;

  length = 0;
  pageSize = 0;
  pageIndex = 0;

  hidePageSize = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent!: PageEvent;

  constructor(
    private router: Router,
    private service: GithubService
  ) { }

  ngOnInit(): void {
    this.preencheLista(1);
  }

  public preencheLista(page: number) {
    let term = this.searchTerm.toLowerCase();
    this.service.getRepositories(term, page).subscribe((res) => {
      this.repositorios = res;      
      //A Api só retorna os primeiros 1000 resultados
      this.length = this.repositorios.total_count > 1000 ? 1000 : this.repositorios.total_count ;
      //O tamanho da página será proporcional a quantidade de repositórios encontratados
      this.pageSize = this.repositorios.total_count > 30 ? 30 : this.repositorios.total_count;
      
    })
  }

  public issuesReportadas(username:string, reponame:string): void {
    this.router.navigate([`/issue`, username, reponame]);
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.pageIndex = e.pageIndex;
    this.preencheLista(this.pageIndex+1);
    
    this.length = e.length;
    this.pageSize = e.pageSize;

  }
}
