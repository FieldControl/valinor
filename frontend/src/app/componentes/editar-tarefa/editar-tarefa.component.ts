import { Component, OnInit } from '@angular/core';
import { ColunasService } from '../colunas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Tarefa } from '../tarefa'; // Importar a nova interface Tarefa

@Component({
  selector: 'app-editar-tarefa',
  templateUrl: './editar-tarefa.component.html',
  styleUrls: ['./editar-tarefa.component.css']
})
export class EditarTarefaComponent implements OnInit {
  tarefa: Tarefa = { id: 0, title: '', columnId: 0 }; // Usar a nova interface Tarefa
  colunas: any[] = []; 

  constructor(private colunasService: ColunasService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const tarefaId = this.route.snapshot.params['id'];
    console.log('Task ID:', tarefaId); // Log the task ID
    this.colunasService.listar().subscribe(colunas => {
      this.colunas = colunas; 
    });
    this.colunasService.buscarTarefaPorId(tarefaId).subscribe(
      (tarefa: Tarefa) => { // Expecting a single Tarefa object
        console.log('Fetched Task:', tarefa); // Log the fetched task
        if (tarefa) {
          this.tarefa = tarefa; 
        } else {
          console.error('Tarefa não encontrada');
        }
      },
      error => {
        console.error('Erro ao buscar tarefa:', error);
      }
    );
  }

  criarTarefa(): void {
    if (!this.tarefa.title) {
        console.error('O título da tarefa não pode estar vazio.');
        return; // Não prosseguir se o título estiver vazio
    }
    if (!this.tarefa.columnId) {
        console.error('A coluna não está definida.');
        return; // Não prosseguir se a coluna não estiver definida
    }
    console.log('Creating task with column ID:', this.tarefa.columnId); // Log the column ID
    this.colunasService.criarTarefa({ id: this.tarefa.id, title: this.tarefa.title, columnId: this.tarefa.columnId }).subscribe(response => {
        console.log('Tarefa criada:', response);
    });
  }

  editarTarefa(): void {
    if (!this.tarefa.id) {
      console.error('ID da tarefa não está definido.');
      return; // Não prosseguir se o ID estiver indefinido
    }
    this.colunasService.editarTarefa({
      id: this.tarefa.id,
      title: this.tarefa.title,
      columnId: this.tarefa.columnId, // Usar column.id
    }).subscribe(
      (response) => {
        console.log('Tarefa editada com sucesso:', response);
        this.router.navigate(['/componentes/mural']);
      },
      (error) => {
        console.error('Erro ao editar tarefa:', error);
      }
    );
  }
  
  cancelar(): void {
    this.router.navigate(['/componentes/mural']) 
  }
}
