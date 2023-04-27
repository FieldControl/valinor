import { HttpClient, HttpHandler, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, catchError, tap, of} from 'rxjs';
import {resultados, item, message} from 'src/app/List';


@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = 'https://api.github.com/search/repositories?q='
  constructor(private http: HttpClient) { }
  
getAll(repositorio: string, page: number): Observable<any>{
  return this.http.get<resultados>(this.apiUrl+repositorio+'&page='+page+'&per_page=10')
    .pipe(
      catchError((error) => {
        // log ou manipular o erro aqui
        const message = error.error.message;
        return of(message); // retorna a mensagem de erro
      })
    );
}

}
