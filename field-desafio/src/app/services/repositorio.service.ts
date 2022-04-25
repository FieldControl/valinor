import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RepositorioService {
  apiUrl = 'http://api.github.com/search/repositories?q='; // Declarando link da Api

  constructor(private http: HttpClient) {} // Declarando no construtor o HttpClient

  public getPesquisa(pesquisa: string) {
    return this.http.get(this.apiUrl + pesquisa); // Retornando a requisição GET da pesquisa feita pelo usuário
  }
}
