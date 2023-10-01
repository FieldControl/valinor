import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

//Observable
import {map, Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PokeApiService {

  url: string = 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=5095';
  constructor(
    private http: HttpClient
  ) { }


  get apiListAllPokemons():Observable<any>{
    return this.http.get<any>(this.url).pipe(
      tap(res => res),
      tap( res =>{
        res.results.map( (resPokemons: any) =>{

           this.apiGetPokemon(resPokemons.url).subscribe(
              res => resPokemons.status = res
            )
        })
      })
    )
  }

  public apiGetPokemon(url: string):Observable<any>{
    return this.http.get<any>(url).pipe(
      map(
        res => res
      )
    )
  }
}
