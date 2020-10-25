import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import {Md5} from 'ts-md5/dist/md5';


@Injectable({
  providedIn: 'root'
})
export class CharactersApiService {
  TIMESTAMP = Math.floor(Date.now() / 1000);

  PUBLIC_KEY='a711161e98e4d12157793e4e91121391';
  PRIVATE_KEY = '088b56cd3f6c7a4fc9b57d319068f8b683fc3a82';

  //utilizando modulo ts-md5 para gerar hash formato MD5
  HASH = Md5.hashStr(this.TIMESTAMP + this.PRIVATE_KEY + this.PUBLIC_KEY);

  URL_API = 'http://gateway.marvel.com/v1/public/characters?limit=50&ts=' + this.TIMESTAMP + '&apikey=' + this.PUBLIC_KEY + '&hash=' + this.HASH;

  constructor(private http: HttpClient) {}

  //método que acessa a API e retorna dados dos personagens
  getAllCharacters (): Observable<any> {
    return this.http.get<any>(this.URL_API)
    .pipe(map((data: any) => data.data.results));
  }

  //método que acessa a API e retorna dados dos personagens de acordo com condição da pesquisa por nome
  getCharacter (search: string): Observable<any> {

    //necessário nova URL por causa de um parametro novo: nameStartsWith
    var URL_API_SEARCH = 'http://gateway.marvel.com/v1/public/characters?nameStartsWith=' + search + '&limit=50&ts=' + this.TIMESTAMP + '&apikey=' + this.PUBLIC_KEY + '&hash=' + this.HASH;

    return this.http.get<any>(URL_API_SEARCH)
    .pipe(map((data: any) =>
      data.data.results.filter(value => value.name.toLowerCase().startsWith(search))
    ));
  }

}
