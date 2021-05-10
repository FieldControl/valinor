import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseFilms } from 'src/app/shared/film.models';

@Injectable({ providedIn: 'root' })
export class FilmsService {
  apiURL = 'https://swapi.dev/api/';
  constructor(private http: HttpClient) {}
  //Faz a requisição http da API, também enviando os parametros, com valor da página e de uma possível busca
  public getFilms(search: string, page: number) {
    const params = this.requestParams(search, page);
    const url = this.apiURL + 'films';
    return this.http.get<ResponseFilms>(url, { params });
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
