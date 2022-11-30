import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, retry } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharacterApiService {

  publicKey = ''
  hash = ''
  urlAPI = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=d923f4cd4b6463a729c8eaa6820af452&hash=3850d1ad4bfbbe87d90900e4187ea65f'
  constructor(public http: HttpClient) {}


      getAllCharacters(): Observable<any> {
        return this.http.get<any>(this.urlAPI)
        .pipe(map((data: any) => data.data.results))
      }
}