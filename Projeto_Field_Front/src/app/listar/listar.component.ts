import { Component, OnInit } from '@angular/core';
import { Tarefa } from '../components/tarefas/tarefa.model';
import { TarefasService } from '../tarefas.service';
import { SalvarTarefa } from '../components/tarefas/salvar-tarefa.model';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css']
})
export class ListarComponent implements OnInit {
  arrayTarefas: Tarefa[] = [];
  constructor(private tarefaService: TarefasService) {
  }

  ngOnInit(): void {
    this.obterTarefas();
  }

  obterTarefas() {
    this.tarefaService.obterListaTarefas().subscribe({
      next: (data) => {
        this.arrayTarefas = data;
        console.log('arrayTarefas', this.arrayTarefas);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  excluirTarefa(tarefa: Tarefa): void {
    this.tarefaService.excluirTarefa(tarefa.idtarefas).subscribe({
      next: () => {
        console.log('Tarefa excluída com sucesso!');
        this.obterTarefas();
      },
      error: (error) => {
        console.log('Erro ao excluir tarefa:', error);
      },
    });
  }

  alterarEstado(tarefa: Tarefa, estado: string): void {
    tarefa.estado = estado;
    this.atualizarTarefa(tarefa);
  }

  private atualizarTarefa(tarefa: Tarefa): void {
    this.tarefaService.atualizarTarefa(tarefa).subscribe({
      next: () => {
        console.log('Tarefa atualizada com sucesso!');
        this.obterTarefas();
      },
      error: (error) => {
        console.log('Erro ao atualizar tarefa:', error);
      },
    });
  }
}
