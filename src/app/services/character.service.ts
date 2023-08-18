import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpModel } from '../model/HttpModel.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient) { }

  getCharacters(offset: number, character?: string): Observable<HttpModel> {
    return this.http.get<any>(`https://gateway.marvel.com:443/v1/public/characters?${character}&offset=${offset}&limit=5&ts=1&apikey=f3bafcdf92d99cf36e45eb7196cb0760&hash=5133c71a85d1bbb1df41f7dedff89bf1`)
      .pipe(map(c => c['data']));
  }

  getCount(character?: string): Observable<number> {
    return this.http.get<any>(`https://gateway.marvel.com:443/v1/public/characters?${character}&limit=50&ts=1&apikey=f3bafcdf92d99cf36e45eb7196cb0760&hash=5133c71a85d1bbb1df41f7dedff89bf1`)
      .pipe(map(c => c['data']['count']));
  }
}
