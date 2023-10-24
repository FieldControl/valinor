import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5/dist/esm/md5';

@Injectable({
  providedIn: 'root'
})
export class CharactersApiService {
  PUBLIC_KEY = environment.publicKey;
  PRIVATE_KEY = environment.privateKey;
  baseUrl = 'https://gateway.marvel.com/v1/public/characters';

  constructor(private http: HttpClient) { }

  getCharacters(page: number, limit: number): Observable<any> {
    const timestamp = new Date().getTime().toString();
    const hash = Md5.hashStr(timestamp + this.PRIVATE_KEY + this.PUBLIC_KEY);

    const offset = (page - 1) * limit;
    const url = `${this.baseUrl}?ts=${timestamp}&apikey=${this.PUBLIC_KEY}&hash=${hash}&offset=${offset}&limit=${limit}`;

    return this.http.get<any>(url).pipe(
      map((data: any) => data.data.results),
      catchError((error: any) => {
        console.error('Ocorreu um erro ao buscar personagens:', error);
        return of([]);
      })
    );
  }
}
