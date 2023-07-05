import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  titulo = 'Busca de Repositórios GitHub';
  termoPesquisa = '';
  repositorios: any[] = [];

  constructor(private http: HttpClient) {}

  pesquisarRepositorios() {
    const url = `https://api.github.com/search/repositories?q=${this.termoPesquisa}`;

    this.http.get(url).subscribe((response: any) => {
      this.repositorios = response.items;
    });
  }
}
