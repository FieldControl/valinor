import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseStarship } from 'src/app/shared/starship.models';

@Injectable({ providedIn: 'root' })
export class StarshipService {
  apiURL = 'https://swapi.dev/api/';
  constructor(private http: HttpClient) {}
  //Faz a requisição http da API, também enviando os parametros, com valor da página e de uma possivel busca
  public getStarships(search: string, page: number) {
    const params = this.requestParams(search, page);
    const url = this.apiURL + 'starships';
    return this.http.get<ResponseStarship>(url, { params });
  }
  //Faz o tratamento dos parametros para ser enviado como um objeto
  requestParams(search: string, page: number): any {
    let params: any = {};
    //Verifica se o parametro search existe, se existir, adiciona ao obejto
    if (search) {
      params[`search`] = search;
    }
    //Verifica se o parametro page existe, se existir, adiciona ao obejto
    if (page) {
      params[`page`] = page;
    }
    return params;
  }
}
