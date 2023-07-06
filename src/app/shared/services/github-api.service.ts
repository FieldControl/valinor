import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { retry, catchError, throwError, Observable } from 'rxjs';
import { Root } from '../models/github-root.model';
import { paginationInformation } from '../models/paginator.model';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {

  constructor(private httpclient:HttpClient) { }
  // github repos
  public getReposWithQuery(searchQuery:string, page:any, itemsPerPage:any):Observable<Root>{
    // url base do api
    let baseUrl = 'https://api.github.com/search/repositories'
    // colocando o query de pesquisa na URL
    let dataUrl = `${baseUrl}?q=${searchQuery}&page=${page}&per_page=${itemsPerPage}`;
    return this.httpclient.get<Root>(dataUrl).pipe(
      // tentar novamente apenas 1 vez
      retry(1),
      // para conseguir pegar mensagens de erro
      catchError(this.handleErrors)
    );
  }

  // para mostrar a mensagem caso der alguma coisa errado
  public handleErrors(error:HttpErrorResponse){
    let errorMessage:string;
    if(error.error instanceof ErrorEvent){
      // caso for erro de client
      errorMessage = `Mensagem: ${error.error.message}`;
    }
    else{
      // caso for erro de servidor
      errorMessage = `Status: ${error.status} Mensagem: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
