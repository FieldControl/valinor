import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  apiUrl = 'https://api.github.com/search/repositories' // url da api para busca de respositórios
  page = 0; // var para que a requisição se inicie na página 0


  constructor(private httpClient: HttpClient) { }

  searchRepobyKeyword(keyword: string, page: number){ // função de busca de repositórios por palavra chave recebida no input text
    return this.httpClient.get<any>(`${this.apiUrl}` + `?q=` + keyword + `&per_page=30` + `&page=` + page); // retorno de um tipo any com vários atributos
  }

}
