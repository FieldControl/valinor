import { Component, OnInit } from '@angular/core';
import { ColunasService } from '../colunas.service';
import { Tarefa } from '../tarefa'; // Importar a nova interface Tarefa

@Component({
  selector: 'app-tarefas',
  templateUrl: './tarefas.component.html',
  styleUrls: ['./tarefas.component.css']
})
export class TarefasComponent implements OnInit {
  tarefas: Tarefa[] = []; // Usar a nova interface Tarefa

  constructor(private colunasService: ColunasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.colunasService.buscarTarefasPorColuna(1).subscribe(tarefas => { // Exemplo de colunaId
      this.tarefas = tarefas; // Atualiza o array de tarefas
      console.log('Tarefas carregadas:', this.tarefas); // Log para verificar as tarefas
    }, error => {
      console.error('Erro ao carregar tarefas:', error); // Log de erro
    });
  }
  
  
  
}
