import { Component } from '@angular/core';
import { TarefaComponent } from "../tarefa/tarefa.component";
import { TarefasService } from '../../tarefas.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-em-aberto',
  standalone: true,
  imports: [TarefaComponent, FormsModule, CommonModule],
  templateUrl: './em-aberto.component.html',
  styleUrl: './em-aberto.component.css'
})
export class EmAbertoComponent {
  tarefas: any[] = [];

  constructor(private tarefasService: TarefasService){}

  ngOnInit() {
    this.enviarTarefas();
  } 
  enviarTarefas() {
    this.tarefasService.getAllTarefas().subscribe(data => {
      this.tarefas = data.tarefas.filter((tarefa: { status: string; }) => tarefa.status === 'em-aberto');
    });
  }

}
