import { Character, CharactersResponse } from './../../models/character.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap, BehaviorSubject, distinctUntilChanged } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class CharactersService {
  private totalCharacters = new BehaviorSubject<number>(0)
  private _BASE_URL = 'https://gateway.marvel.com:443/v1/public/'
  private apiPublicKey = '9048f0e670f55c23915db7e48758cc20'


  constructor(private httpClient: HttpClient) {
  }


  getCharacters(offset: Number): Observable<Character[]> {
    return this.httpClient.get<CharactersResponse>
      (`${this._BASE_URL}/characters?orderBy=name&offset=${offset}&apikey=${this.apiPublicKey}`)
      .pipe(
        tap(data => this.totalCharacters.next(data.data.total)),
        map((data) => data.data.results)
      )
  }

  getCharacterByName(name: string, offset: number) {

    return this.httpClient.get<CharactersResponse>
      (`${this._BASE_URL}characters?nameStartsWith=${name}&orderBy=name&offset=${offset}&apikey=${this.apiPublicKey}`)
      .pipe(
        tap(data => this.totalCharacters.next(data.data.total)),
        map((data) => data.data.results),
      )

  }

  getTotalCharacters(): Observable<number> {
    return this.totalCharacters.asObservable()
  }
}
