import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  //Declaração de variáveis
  private repositorios = new BehaviorSubject<any[]>([]);
  currentRepositorios = this.repositorios.asObservable();
  searchMade = new BehaviorSubject<boolean>(false);
  public totalRepositorios = new BehaviorSubject<number>(0);
  private _page: number = 1;
  private perPage: number = 10;
  isLoading = new BehaviorSubject<boolean>(false);
  public query: string = '';

  constructor() {}

  //Propriedade Getter e Setter para paginação
  get page(): number {
    return this._page;
  }

  set page(valor: number) {
    if (valor > 0) {
      this._page = valor;
    }
  }

  // Método para buscar repositórios no GitHub
  async searchRepositorios(query: string): Promise<any> {
    this.query = query;
    if (this.query == '') {
      return Promise.reject('A pesquisa não pode estar vazia');
    }
    this.searchMade.next(true);
    this.isLoading.next(true);
    return axios
      .get(
        `https://api.github.com/search/repositories?q=${query}&page=${this.page}&per_page=${this.perPage}`
      )
      .then((response) => {
        this.repositorios.next(response.data.items);
        this.totalRepositorios.next(response.data.total_count);
        this.isLoading.next(false);
        return this.repositorios;
      })
      .catch((error) => {
        this.isLoading.next(false);
        console.error(error);
      });
  }
}
