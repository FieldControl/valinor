import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValorantApiService {

  private url: string = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true';

  constructor(private http: HttpClient) { }

  get apiListAllCharacters():Observable<any>{
    return this.http.get<any>(this.url).pipe(
      tap(res => res)
    )
  }

  public apiGetCharacter( url: string):Observable<any> {
    return this.http.get<any>( url ).pipe(
      map(
        res => res
      )
    )
  }

}
