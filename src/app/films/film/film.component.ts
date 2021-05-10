import { Component, OnInit } from '@angular/core';
import { Film } from 'src/app/shared/film.models';
import { FilmsService } from './film.service';

@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss'],
})
export class FilmComponent implements OnInit {
  films: Film[] = [];
  count: number = 0;
  page: number = 1;
  search: string;
  constructor(private filmService: FilmsService) {}

  ngOnInit(): void {
    this.getData();
  }
  //Busca as informações do Serviço do component, enviando as informações de parametros
  getData() {
    this.filmService.getFilms(this.search, this.page).subscribe((data) => {
      this.count = data.count;
      this.films = data.results;
    });
  }
  //Muda o valor da página para ser aplicada a requisição
  pageChange(event: number): void {
    this.page = event;
    this.getData();
  }
}
