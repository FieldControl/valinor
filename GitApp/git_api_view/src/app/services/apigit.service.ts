import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class ApigitService {
    url_api:any = "https://api.github.com/"
  constructor(private http:HttpClient) { }

    getRepositoryAll(textSeach:string){
      return this.http.get(`${this.url_api}search/repositories?q=${textSeach}`)
    }
}
