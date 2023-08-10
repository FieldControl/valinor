import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class GithubRepositoryService {

  private apiUrl = 'https://api.github.com/search/repositories';

  constructor(private http: HttpClient) { }

  pesquisarRepositorios(porPagina: number, indicePagina: number, consulta: string): Observable<any> {
    const parametros = {
      q: consulta,
      per_page: porPagina.toString(),
      page: indicePagina.toString()
    };

    return this.http.get<any>(this.apiUrl, { params: parametros });
  }
}
