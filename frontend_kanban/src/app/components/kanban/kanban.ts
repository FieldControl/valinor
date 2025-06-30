import { Component } from '@angular/core';
import { CardModel, ColumnModel } from '../../models/kanban.model';
import { Column } from "../column/column";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-kanban',
  imports: [Column, CommonModule],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css'
})
export class Kanban {

  Data: ColumnModel[] = [
    {id: 1, title:'To do', cards:[{ id: 1, title: 'Começo', description: 'start', columnId: 1 },{ id: 1, title: 'Começo', description: 'start', columnId: 1 }]},
    {id: 2, title:'Doing', cards:[{ id: 2, title: 'Processo', description: 'doing', columnId: 2 }]},
    {id: 3, title:'Done', cards:[{ id: 3, title: 'Feito', description: 'Done', columnId: 3 }]},
  ]  

  
  ngOnInit(): void {}
  //Fazer a chamada no banco de dados, planejo utilizar o firebase
}
