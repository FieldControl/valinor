import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponsePeople } from 'src/app/shared/person.models';

@Injectable({ providedIn: 'root' })
export class PersonService {
  apiURL = 'https://swapi.dev/api/';
  constructor(private http: HttpClient) {}
  //Faz a requisição http da API, também enviando os parametros, com valor da página e de uma possível busca
  public getPeople(search: string, page: number) {
    const params = this.requestParams(search, page);
    const url = this.apiURL + 'people';
    return this.http.get<ResponsePeople>(url, { params });
  }
  //Faz o tratamento dos parametros para ser enviado como um objeto
  requestParams(search: string, page: number): any {
    let params: any = {};
    if (search) {
      params[`search`] = search;
    }
    if (page) {
      params[`page`] = page;
    }
    return params;
  }
}
