import { Component, OnInit } from '@angular/core';
import { CardModel, ColumnModel } from '../../models/kanban.model';


@Component({
  selector: 'app-kanban',
  imports: [],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css'
})
export class Kanban {

  Data: ColumnModel[] = [
    {id: 1, title:'To do', cards:[{ id: 1, title: 'Começo', description: 'start', columnId: 1 }]},
    {id: 2, title:'Doing', cards:[{ id: 2, title: 'Processo', description: 'doing', columnId: 2 }]},
    {id: 3, title:'Done', cards:[{ id: 3, title: 'Feito', description: 'Done', columnId: 3 }]},
  ]  

  constructor(){}

  ngOnInit(): void {}
  //Fazer a chamada no banco de dados, planejo utilizar o firebase
}
