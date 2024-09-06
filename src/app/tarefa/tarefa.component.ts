import { Component, OnInit } from '@angular/core';
import { TarefasService } from '../../tarefas.service';

@Component({
  selector: 'app-tarefa',
  standalone: true,
  imports: [],
  templateUrl: './tarefa.component.html',
  styleUrl: './tarefa.component.css'
})
export class TarefaComponent {
  tarefas: any = [];

  constructor(private tarefasService: TarefasService){}

  ngOnInit() {
    this.enviarTarefas();
  }
  enviarTarefas() {
    this.tarefasService.getAllTarefas().subscribe(data => {
      this.tarefas = data;
    });
  }

}
