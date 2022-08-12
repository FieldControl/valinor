import { Component, Input, OnInit } from '@angular/core';
import { gitRepositoryModel } from 'src/app/Interfaces/gitRepository.interface';

@Component({
  selector: 'app-repository-card',
  templateUrl: './repository-card.component.html',
  styleUrls: ['./repository-card.component.sass']
})
export class RepositoryCardComponent implements OnInit {
  @Input() repositorys!: gitRepositoryModel[];

  pag: number = 1;
  contador: number = 5;

  constructor() { }

  ngOnInit(): void {
  }

}
