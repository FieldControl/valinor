import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class MovieServiceService {
  baseURL = 'https://the-one-api.dev/v2'

  constructor(private httpClient: HttpClient) {}

  getMovies(page:number, name?:string) {
    let params = new HttpParams()
      .set('limit', '10')
      .set('page', page);



      if(name !== undefined) {
        params = params.append('name', `/${name}/i`)
      }

    return this.httpClient.get<any>(`${this.baseURL}/movie`, {
      headers: {
        Authorization: 'Bearer J9smCC4ow_JqasHdob7-'
      },
      params
     })
  }


}
