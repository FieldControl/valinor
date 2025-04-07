import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './task.service';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.scss'],
})
export class PaginaPrincipalComponent implements OnInit {
  tasks: any = {
    'A Fazer': [],
    'Em Progresso': [],
    'Concluído': [],
  };
  columns = [
    { name: 'A Fazer', title: 'A Fazer' },
    { name: 'Em Progresso', title: 'Em Progresso' },
    { name: 'Concluído', title: 'Concluído' },
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // Carregar todas as tarefas
  loadTasks(): void {
    this.taskService.getTasks().subscribe((tasks: any[]) => {
      // Organiza as tarefas por coluna
      this.tasks = {
        'A Fazer': tasks.filter((task) => task.column === 'A Fazer'),
        'Em Progresso': tasks.filter((task) => task.column === 'Em Progresso'),
        'Concluído': tasks.filter((task) => task.column === 'Concluído'),
      };
    });
  }

  // Adicionar uma nova tarefa
  addTask(columnName: string): void {
    const taskName = prompt('Digite o nome da nova tarefa:');
    if (taskName) {
      const newTask = { name: taskName, column: columnName, comments: [] };
      this.taskService.addTask(newTask).subscribe(() => {
        this.loadTasks(); // Recarrega as tarefas
      });
    }
  }

  // Editar uma tarefa existente
  editTask(task: any, columnName: string): void {
    const newTaskName = prompt('Edite o nome da tarefa:', task.name);
    if (newTaskName) {
      const updatedTask = { ...task, name: newTaskName, column: columnName };
      this.taskService.updateTask(task.id, updatedTask).subscribe(() => {
        this.loadTasks(); // Recarrega as tarefas
      });
    }
  }

  // Excluir uma tarefa
  deleteTask(task: any): void {
    const confirmDelete = confirm(`Tem certeza que deseja excluir "${task.name}"?`);
    if (confirmDelete) {
      this.taskService.deleteTask(task.id).subscribe(() => {
        this.loadTasks(); // Recarrega as tarefas
      });
    }
  }

  // Arrastar uma tarefa
  dragTask(event: DragEvent, task: any, columnName: string): void {
    event.dataTransfer?.setData('task', JSON.stringify({ ...task, column: columnName }));
  }

// Finalizar o evento de arrastar
endDrag(event: DragEvent): void {
  event.preventDefault();
  console.log('Arraste finalizado');
}

// Soltar uma tarefa em outra coluna
dropTask(event: DragEvent, targetColumn: string): void {
  event.preventDefault();
  const taskData = event.dataTransfer?.getData('task');
  if (taskData) {
    const task = JSON.parse(taskData);
    const updatedTask = { ...task, column: targetColumn }; // Atualiza apenas a coluna

    this.taskService.updateTask(task.id, updatedTask).subscribe(() => {
      this.loadTasks(); // Recarrega as tarefas
    });
  }
}

// Permitir o drop
allowDrop(event: DragEvent): void {
  event.preventDefault(); // Permite o drop ao prevenir o comportamento padrão do navegador
}

  // Adicionar um comentário a uma tarefa
  addComment(task: any): void {
    if (task.newComment && task.newComment.trim() !== '') {
      // Adiciona o novo comentário ao array de comentários
      task.comments = task.comments || [];
      task.comments.push(task.newComment.trim());

      // Limpa o campo de entrada
      const commentToSave = task.newComment.trim();
      task.newComment = '';

      // Atualiza a tarefa no backend
      this.taskService.updateTask(task.id, { comments: task.comments }).subscribe(() => {
        console.log(`Comentário "${commentToSave}" adicionado à tarefa "${task.name}".`);
      });
    }
  }

  // Editar um comentário
  editComment(task: any, commentIndex: number): void {
    const updatedComment = prompt('Edite o comentário:', task.comments[commentIndex]);
    if (updatedComment !== null && updatedComment.trim() !== '') {
      task.comments[commentIndex] = updatedComment.trim();
      this.taskService.updateTask(task.id, { comments: task.comments }).subscribe(() => {
        console.log(`Comentário atualizado: ${updatedComment}`);
      });
    }
  }

  // Excluir um comentário
  deleteComment(task: any, commentIndex: number): void {
    const confirmDelete = confirm('Tem certeza que deseja excluir este comentário?');
    if (confirmDelete) {
      task.comments.splice(commentIndex, 1);
      this.taskService.updateTask(task.id, { comments: task.comments }).subscribe(() => {
        console.log('Comentário excluído.');
      });
    }
  }

  // Alternar a exibição de comentários
  toggleComments(task: any): void {
    task.showComments = !task.showComments;
  }
}
