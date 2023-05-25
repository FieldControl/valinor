import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjetosService } from '../repositorios.service';

@Component({
  selector: 'app-repositorios',
  templateUrl: './repositorios.component.html',
  styleUrls: ['./repositorios.component.css']
})
export class RepositoriosComponent implements OnInit {
  resultados: any;
  pagina: number = 1;
  contador: number = 10;
  numeroDeRepositorios:number | any

  constructor(private route: ActivatedRoute, private projetoService: ProjetosService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['resultados']) {
        this.resultados = JSON.parse(params['resultados']);
      }
    });

    this.projetoService.getProjeto().subscribe(repositorios => {
      this.numeroDeRepositorios = repositorios.length;
    });
  }
}