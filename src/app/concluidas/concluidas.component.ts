import { Component } from '@angular/core';
import { TarefaComponent } from "../tarefa/tarefa.component";
import { TarefasService } from '../../tarefas.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-concluidas',
  standalone: true,
  imports: [TarefaComponent, FormsModule, CommonModule],
  templateUrl: './concluidas.component.html',
  styleUrl: './concluidas.component.css'
})
export class ConcluidasComponent {
  tarefas: any[] = [];

  constructor(private tarefasService: TarefasService){}

  ngOnInit() {
    this.enviarTarefas();
  }
  enviarTarefas() {
    this.tarefasService.getAllTarefas().subscribe(data => { 
      this.tarefas = data.tarefas.filter((tarefa: { status: string; }) => tarefa.status === "concluida");
    });
  }

}
