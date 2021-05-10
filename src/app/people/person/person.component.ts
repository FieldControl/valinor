import { Component, OnInit } from '@angular/core';
import { Person } from 'src/app/shared/person.models';
import { PersonService } from './person.service';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
})
export class PersonComponent implements OnInit {
  people: Person[] = [];
  count: number = 0;
  page: number = 1;
  search: string;
  constructor(private personService: PersonService) {}

  ngOnInit(): void {
    this.getData();
  }
  //Busca as informações do Serviço do component, enviando as informações de parametros
  getData() {
    this.personService.getPeople(this.search, this.page).subscribe((data) => {
      this.count = data.count;
      this.people = data.results;
    });
  }
  //Muda o valor da página para ser aplicada a requisição
  pageChange(event: number): void {
    this.page = event;
    this.getData();
  }
}
