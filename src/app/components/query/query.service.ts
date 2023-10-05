import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  url = "https://brapi.dev/api/quote/"
  
  constructor(private http: HttpClient) { }

  getTicket(param: string):Observable<any[]>{
    return (this.http.get<any[]>(this.url + `${param}?token=knFFfFoevdBgTdZKbzYrjZ&range=1d&interval=1d&fundamental=true&dividends=true`));
  }
}
