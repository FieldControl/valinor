import { Component, OnInit } from '@angular/core';
import { Starship } from 'src/app/shared/starship.models';
import { StarshipService } from './starship.service';

@Component({
  selector: 'app-starship',
  templateUrl: './starship.component.html',
  styleUrls: ['./starship.component.scss'],
})
export class StarshipComponent implements OnInit {
  starships: Starship[] = [];
  count: number = 0;
  page: number = 1;
  search: string;
  constructor(private starshipService: StarshipService) {}

  ngOnInit(): void {
    this.getData();
  }
  //Busca as informações do Serviço do component, enviando as informações de parametros
  getData() {
    this.starshipService
      .getStarships(this.search, this.page)
      .subscribe((data) => {
        this.count = data.count;
        this.starships = data.results;
      });
  }
  //Muda o valor da página para ser aplicada a requisição
  pageChange(event: number): void {
    this.page = event;
    this.getData();
  }
}
