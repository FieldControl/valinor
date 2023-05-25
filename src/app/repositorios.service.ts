import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { ProjetosData } from './projetosData';
import { Observable, map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProjetosService {
  private apiUrl = `https://api.github.com/search/repositories?q=bootstrap`;
  contador:number | any;

  constructor(private http: HttpClient) {}

  getProjeto(): Observable<ProjetosData[]> {
    return this.http.get<any>(this.apiUrl).pipe(map((response: any) => response.items));
  }
}
  

  