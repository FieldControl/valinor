import { Component, OnInit } from '@angular/core';
import { ColunasService } from '../colunas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Tarefa } from '../tarefa'; // Importar a interface Tarefa

@Component({
  selector: 'app-excluir-tarefa',
  templateUrl: './excluir-tarefa.component.html',
  styleUrls: ['./excluir-tarefa.component.css']
})
export class ExcluirTarefaComponent implements OnInit {
  tarefa: Tarefa = { id: 0, title: '', columnId: 0 }; // Usar a nova interface Tarefa

  constructor(
    private colunasService: ColunasService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const tarefaId = this.route.snapshot.paramMap.get('id'); // Assuming the route has a parameter 'id'
    if (tarefaId) {
      this.colunasService.buscarTarefaPorId(+tarefaId).subscribe((tarefa: Tarefa) => {
        this.tarefa = tarefa;
      });
    }
  }

  excluirTarefa(id: number): void {
    if (!id) {
      console.error('ID da tarefa não está definido.');
      return;
    }
  
    if (confirm('Deseja realmente excluir esta tarefa?')) {
      this.colunasService.excluirTarefa(id).subscribe(
        () => {
          console.log(`Tarefa com ID ${id} excluída.`);
          this.tarefa = { id: 0, title: '', columnId: 0 }; // Redefine a tarefa como vazia
          this.router.navigate(['/componentes/mural']); // Opcional: redireciona para outra página
        },
        error => {
          console.error('Erro ao excluir a tarefa:', error);
        }
      );
    }
  }
  
  

  cancelar(): void {
    this.router.navigate(['/componentes/mural']);
  }
}
