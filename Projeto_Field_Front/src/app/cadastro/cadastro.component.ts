import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TarefasService } from '../tarefas.service';
import { Tarefa } from '../components/tarefas/tarefa.model';
import { SalvarTarefa } from '../components/tarefas/salvar-tarefa.model';


@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  novaTarefa: SalvarTarefa = { descricao: '', estado: 'A ser iniciada' };

  constructor(private router: Router, private tarefaService: TarefasService) { }

  salvarTarefa(): void {
    this.tarefaService.adicionarTarefa(this.novaTarefa).subscribe({
      next: () => {
        console.log('Tarefa adicionada com sucesso!');
        this.router.navigate(['/listar']);
      },
      error: (error) => {
        console.log('Erro ao adicionar tarefa:', error);
      }
    });
  }
}
