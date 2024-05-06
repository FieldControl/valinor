import { Component, OnInit } from '@angular/core';
import { CreateKanbanService } from './create-kanban.service';
import { IKanban } from '../interfac/InterfaceKanban';

@Component({
  selector: 'app-create-kanban',
  templateUrl: './create-kanban.component.html',
  styleUrl: './create-kanban.component.css'
})
export class CreateKanbanComponent implements OnInit {

  dados:IKanban = {
    nome : '',
    descricao : '',
    dataInical : '',
    dataFinal : '',
    status : '',
  }

  constructor(private createKanbanService : CreateKanbanService){}



  ngOnInit(): void {
    
  }

  createKanban(){
    this.createKanbanService.createKanban(this.dados)
    // console.log(this.dados)
  }
}
