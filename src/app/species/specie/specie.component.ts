import { Component, OnInit } from '@angular/core';
import { Specie } from 'src/app/shared/specie.models';
import { SpeciesService } from './specie.service';

@Component({
  selector: 'app-specie',
  templateUrl: './specie.component.html',
  styleUrls: ['./specie.component.scss'],
})
export class SpecieComponent implements OnInit {
  species: Specie[] = [];
  count: number = 0;
  page: number = 1;
  search: string;
  constructor(private specieService: SpeciesService) {}

  ngOnInit(): void {
    this.getData();
  }
  //Busca as informações do Serviço do component, enviando as informações de parametros
  getData() {
    this.specieService.getSpecies(this.search, this.page).subscribe((data) => {
      this.count = data.count;
      this.species = data.results;
    });
  }
  //Muda o valor da página para ser aplicada a requisição
  pageChange(event: number): void {
    this.page = event;
    this.getData();
  }
}
