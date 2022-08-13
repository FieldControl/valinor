import { Component, Input, OnInit } from '@angular/core';
import { gitRepositoryModel } from 'src/app/Interfaces/gitRepository.interface';

@Component({
  selector: 'app-repository-card',
  templateUrl: './repository-card.component.html',
  styleUrls: ['./repository-card.component.sass']
})
export class RepositoryCardComponent implements OnInit {
  //Input responsável por trazer informação da API do elemento pai
  @Input() repositorys!: gitRepositoryModel[];

  //Variáveis responsáveis pela paginação
  pag: number = 1;
  contador: number = 5;

  constructor() { }

  ngOnInit(): void {
  }

}
