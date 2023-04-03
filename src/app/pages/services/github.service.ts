import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Repositories } from '../../models/repositories.model';
import { Issues } from '../../models/issues.model';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private _BASE_URL = "https://api.github.com/search/"

  constructor(
    private httpClient: HttpClient
  ) { }

  public handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Mensagem de erro:', error.error);
    } else {
      console.error(`Código de retorno ${error.status}, mensagem de erro: `, error.error);
    }
    return throwError(() => new Error('Algo de errado aconteceu, tente novamente mais tarde.'));
  }

  getRepositories(searchTerm: string, page: number): Observable<Repositories> {
    let url = `${this._BASE_URL}repositories?q=${searchTerm}&page=${page}`;
    return this.httpClient.get<Repositories>(url)
      .pipe(catchError(this.handleError));
  }

  getIssues(username:string, reponame:string, page:number) : Observable<Issues> {
    let url = `${this._BASE_URL}issues?q=repo:${username}/${reponame}&page=${page}`;
    return this.httpClient.get<Issues>(url)
      .pipe(catchError(this.handleError));
  }
}
