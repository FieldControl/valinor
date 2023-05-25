import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-busca',
  templateUrl: './menu-busca.component.html',
  styleUrls: ['./menu-busca.component.css']
})
export class MenuBuscaComponent {
  termoBusca: string | any;

  constructor(private http: HttpClient, private router: Router) {}

  buscarRepositorio() {
    const url = `https://api.github.com/search/repositories?q=${this.termoBusca}`;
    this.http.get(url).subscribe((data: any) => {
      this.router.navigate(['/repositorios'], {
        queryParams: { resultados: JSON.stringify(data.items) }
      });
    },
    (error) => {
      console.error('Ocorreu um erro durante a busca:', error);
    });
  }
}
