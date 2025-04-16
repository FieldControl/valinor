import { Component, Input } from '@angular/core';
import { Task } from '../../interface/task.interface';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  styleUrls: ['./task.component.scss']
})
export class TaskComponent {
  @Input() task!: Task;
  getPriorityText(priorityLevel: number): string {
    switch (priorityLevel) {
      case 1:
        return 'Baixíssima';
      case 2:
        return 'Baixa';
      case 3:
        return 'Média';
      case 4:
        return 'Alta';
      case 5:
        return 'Altíssima';
      default:
        return 'Desconhecida';
    }
  }

  getPriorityClass(priorityLevel: number): string {
    switch (priorityLevel) {
      case 1:
        return 'priority-lowest';
      case 2:
        return 'priority-low';
      case 3:
        return 'priority-medium';
      case 4:
        return 'priority-high';
      case 5:
        return 'priority-highest';
      default:
        return 'priority-unknown';
    }
  }
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'to-do':
        return 'status-todo';
      case 'in progress':
        return 'status-in-progress';
      case 'done':
        return 'status-done';
      default:
        return 'status-unknown';
    }
  }
  dates(task:Task){
    if (task.endDate) {
      return `${this.formatDate(task.initDate)} | ${this.formatDate(task.endDate)}`;
    } else {
      return this.formatDate(task.initDate);
    }
  }
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }
  editTask(task: Task): void {
    console.log('Editando tarefa:', task);
    // Adicione aqui a lógica para editar a tarefa
  }

  deleteTask(task: Task): void {
    console.log('Excluindo tarefa:', task);
    // Adicione aqui a lógica para excluir a tarefa
  }
}
