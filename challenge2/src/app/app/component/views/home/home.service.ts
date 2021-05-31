import {EventEmitter, Injectable,} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  urlApiGit = 'https://api.github.com/search/repositories?q='
  paginacao = '&page='
  emissorEvento: EventEmitter<any> = new EventEmitter<any>()
  recebepagina: EventEmitter<any> = new EventEmitter<any>()

  constructor(private http: HttpClient) {
  }

  consulta(value: string, pagina: number): Observable<any> {

    return this.http.get<any>(this.urlApiGit + value + this.paginacao + pagina);
  }
}
