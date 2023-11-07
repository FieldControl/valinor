import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PokeAPIService {

  urlPokeAPI = 'https://pokeapi.co/api/v2/';

  constructor(private http: HttpClient) { }

  public listarPokemonsPaginado(){
    const url = `${this.urlPokeAPI}pokemon`;
    return this.http.get<any>(url);
  }

  public listarPokemonPorIdOuNome(pokemon: string|number){
    const url = `${this.urlPokeAPI}pokemon/${pokemon}`;
    return this.http.get<any>(url);
  }

  public chamarRequestGET(url: string){
    return this.http.get<any>(url);
  }
}
