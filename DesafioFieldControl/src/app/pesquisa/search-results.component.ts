import {Component, OnInit, ViewChild, AfterViewInit, Input, EventEmitter} from '@angular/core';
import { GithubService } from '../shared/github/github.service';
import { Repository } from '../shared/github/models/repository';
import { Page } from '../shared/github/models/page';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements AfterViewInit {
  query: string = 'angular';

  results: Repository[];

  //Faz referência a qual conteúdo será exbido em cada linha e coluna da tabela
  displayedColumns: string[] = ['nome', 'usuario', 'linguagem', 'forks','estrelas','alteracao'];

  dataSource : any;
  resultsLength = 0;

  isLoadingResults = true;

  private _searchEmitter: EventEmitter<string> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  //constructor que atribui o resultado todos os dados ao método dataSource
  constructor(private githubService: GithubService) {
    this.dataSource = new MatTableDataSource(this.results)
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    //Utilização dos métodos map e pipe para percorrer a api e trazer o resultado para o componente
    merge(this.sort.sortChange, this.paginator.page, this._searchEmitter)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.githubService.searchRepositories(
            this.query,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex + 1
          );
        }),
        map(data => {
          this.isLoadingResults = false;
          this.resultsLength = data.total_count;

          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      )
      .subscribe((data: Repository[]) => {
        this.dataSource = new MatTableDataSource(data);
      });
  }

  search(query: string) {
    this.query = query;
    this._searchEmitter.emit(query);
  }

  formatedDate(date: string) {
    return new Date(date).toLocaleString();
  }
}
