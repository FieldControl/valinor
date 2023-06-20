import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, pipe, catchError, of } from 'rxjs'

@Injectable({
  providedIn: 'root'
})

export class RepositoriosService {
  private url_api = 'https://api.github.com/search/repositories?q='

  constructor(private http: HttpClient) { }

  pegar_repositorios(nome_repositorio: string, pagina: number): Observable<any>{
    return this.http.get(this.url_api+nome_repositorio+'?page='+pagina+'per_page=10').pipe(
      catchError((error) => {
        const mensagem_erro = error.error.message;
        return of(mensagem_erro)
      })
    )

  }
}
