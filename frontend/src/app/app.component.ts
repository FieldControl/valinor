import { Component } from '@angular/core';
import { TaskService } from './services/taks.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  listaFazer: ListaProps[] = [];
  listaFazendo: ListaProps[] = [];
  listaFeito: ListaProps[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks(); 
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.listaFazer = tasks.filter(task => task.status === 'fazer');
        this.listaFazendo = tasks.filter(task => task.status === 'fazendo');
        this.listaFeito = tasks.filter(task => task.status === 'feito');
      },
      error: (err) => {
        console.error('Erro ao carregar tarefas:', err);
      },
      complete: () => {
        console.log('Tarefas carregadas com sucesso');
      }
    });
  }



  tarefaAdicionada(e: any) {
    e.preventDefault();

    const task = e.target.task.value;
    const descricao = e.target.msg.value;
    const qualbotaoClicado = (e.submitter as HTMLButtonElement).name;

    if (task) {
      const novaTarefa: ListaProps = {
        id: Date.now().toString(), 
        title: task,
        description: descricao
      };

      this.taskService.createTask(novaTarefa).subscribe({
        next: (response) => {
          console.log('Tarefa salva no backend:', response);
        },
        error: (error) => {
          console.error('Erro ao salvar tarefa:', error);
        },
        complete: () => {
          console.log('Requisição completada!');
        }
      });

      if (qualbotaoClicado === 'fazer') {
        this.listaFazer.push(novaTarefa);
      } else if (qualbotaoClicado === 'fazendo') {
        this.listaFazendo.push(novaTarefa);
      } else if (qualbotaoClicado === 'feito') {
        this.listaFeito.push(novaTarefa);
      }
    }
  }

moverTarefa(item: ListaProps, origem: ListaProps[], destino: ListaProps[], novoStatus: string) {
  const index = origem.indexOf(item);
  if (index > -1) {
    origem.splice(index, 1);
    destino.push(item);

    this.taskService.updateTaskStatus(item.id, novoStatus).subscribe({
      next: (response) => {
        console.log('Status da tarefa atualizado:', response);
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error); 
      }
    });
  } else {
    console.log("erro");
  }
}


excluirTarefa(item: ListaProps, origem: ListaProps[]) {
  console.log('Excluindo tarefa com ID:', item.id);

  const index = origem.indexOf(item);
  if (index > -1) {
    origem.splice(index, 1);

    this.taskService.deleteTask(item.id).subscribe({
      next: () => {
        console.log('Tarefa excluída com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao excluir a tarefa:', err);
      },
    });
  }
}


}

interface ListaProps {
  id: string;
  title: string;
  description?: string;
}
