import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

export class CharactersApiService {
  
  URL_API = 'http://gateway.marvel.com/v1/public/series?limit=50&ts=1668809181&apikey=d68cb344f2730d014b4120d88fdd8510&hash=d6460c6d6f1f72808233429f13eac600';
  
  constructor(private http: HttpClient) { }

  getAllCharacters(): Observable<any>{
    return this.http.get<any>(this.URL_API)
    .pipe(map((data: any) => data.data.results));
  }  

}
