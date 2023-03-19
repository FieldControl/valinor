import { Component } from '@angular/core';

import { debounceTime, switchMap, catchError, distinctUntilChanged } from 'rxjs/operators';

import { of } from 'rxjs';

// Service
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-repository-list',
  templateUrl: './repository-list.component.html',
  styleUrls: ['./repository-list.component.css']
})
export class RepositoryListComponent {

  public repositoryList: any;
  public query: any;

  public currentPage = 1;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getRepositories(this.query).subscribe(
      res => this.repositoryList = res.items
    );
  }

  public getSearch(value: string) {
    this.query = value

    this.apiService.getRepositories(this.query)
      .pipe(
        debounceTime(300), // aguarda 300ms entre as solicitações
        distinctUntilChanged(), // solicitação somente se a consulta mudar
        switchMap(res => {
          this.repositoryList = res.items;
          return of(null);
        }),
        catchError(err => {
          console.error(err);
          // Tratar o erro aqui e fornecer feedback ao usuário
          return of(null);
        })
      )
      .subscribe();
  }
}

