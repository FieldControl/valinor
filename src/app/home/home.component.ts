import { Component } from '@angular/core';
import { ProjetosService } from '../repositorios.service';
import { ProjetosData } from '../projetosData';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  repositoriosData: ProjetosData | any;
  pagina : number = 1 ;
  contador : number = 10;
  numeroDeRepositorios:number | any
  
  constructor(private projetoService: ProjetosService) {}

  ngOnInit(): void {
    this.getProjeto();
    this.projetoService.getProjeto().subscribe(repositorios => {
      this.numeroDeRepositorios = repositorios.length;
    });
  }

  getProjeto() {
    this.projetoService.getProjeto().subscribe({
      next: (res) => {
        this.repositoriosData = res;
      },
      error: (err) => console.log('404'),
    });
  }
}
