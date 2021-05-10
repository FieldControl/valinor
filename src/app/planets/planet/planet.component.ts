import { Component, OnInit } from '@angular/core';
import { Planet } from 'src/app/shared/planet.models';
import { PlanetService } from './planet.service';

@Component({
  selector: 'app-planet',
  templateUrl: './planet.component.html',
  styleUrls: ['./planet.component.scss'],
})
export class PlanetComponent implements OnInit {
  planets: Planet[] = [];
  count: number = 0;
  page: number = 1;
  search: string;
  constructor(private planetService: PlanetService) {}

  ngOnInit(): void {
    this.getData();
  }
  //Busca as informações do Serviço do component, enviando as informações de parametros
  getData() {
    this.planetService.getPlanet(this.search, this.page).subscribe((data) => {
      this.count = data.count;
      this.planets = data.results;
    });
  }
  //Muda o valor da página para ser aplicada a requisição
  pageChange(event: number): void {
    this.page = event;
    this.getData();
  }
}
