import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MyKeanuListService {
  numberResults: number;
  private apiUrl = `https://whoa.onrender.com/whoas/random?`;
  constructor(private http: HttpClient) { }

  public getKeanuSerie() {
    return this.http.get<any>(`${this.apiUrl}results=${this.numberResults = 20}&sort=movie&direction=desc`);
  }
  public getfilterTenKeanu() {
    return this.http.get<any>(`${this.apiUrl}results=${this.numberResults = 10}&sort=movie&direction=desc`);
  }

}
