import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRepositorie } from '../interfaces/IRepositorie';
@Injectable({
  providedIn: 'root'
})
export class RepositoriesService {
  baseUrl = "https://api.github.com/search/repositories?q="
  constructor(private http: HttpClient) { }


  read(search:string, page:number = 1): Observable<IRepositorie>{
    return this.http.get<IRepositorie>(`${this.baseUrl}${search}&page=${page}`);
  }
}
