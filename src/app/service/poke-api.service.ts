import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokeAPIService {

  private url = 'https://pokeapi.co/api/v2/pokemon/?limit=151&offset=0'

  constructor(
    private http: HttpClient
  ) { }

  get apiListAllPokemons(): Observable<any> {
    return this.http.get<any>(this.url).pipe(
      tap( response => response ),
      tap( response => {
        response.results.map((responsePokemons: any) => {
          this.apiGetPokemons(responsePokemons.url).subscribe(
            response => responsePokemons.status = response
          )
        })
      }),
    )
  }

  public apiGetPokemons(url: string): Observable<any> {
    return this.http.get<any>(url).pipe(
      map(response => response)
    )
  }
}
