import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class PostService {

  public nome = 'node';

  public url = `https://api.github.com/search/repositories`;

  constructor(private http: HttpClient) { }

  getPosts(){
    return this.http.get<any[]>(`${this?.url}?q=${this.nome}?per_page=10`);
  }


}
