import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  apiUrl = 'https://api.github.com/search/repositories' // url da api para busca de respositórios


  constructor(private httpClient: HttpClient) { }

  searchRepobyKeyword(keyword: string){ // função de busca de repositórios por palavra chave recebida no input text
    return this.httpClient.get<any>(`${this.apiUrl}` + `?q=` + keyword); // retorno de um tipo any com vários atributos
  }

}
