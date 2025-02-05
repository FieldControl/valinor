import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

interface Task {
  id: number;
  title: string;
}

interface Column {
  id: number;
  name: string;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css'
})
export class KanbanComponent {
  columns: Column[] = [
    { id: 1, name: 'Para Fazer', tasks: [{ id: 1, title: 'Tarefa 1' }, { id: 2, title: 'Tarefa 2' }] },
    { id: 2, name: 'Em Andamento', tasks: [{ id: 3, title: 'Tarefa 3' }] },
    { id: 3, name: 'Concluído', tasks: [{ id: 4, title: 'Tarefa 4' }] }
  ];

  columnIdCounter = 4;
  taskIdCounter = 5;

  get connectedLists() {
    return this.columns.map(column => `cdk-drop-list-${column.id}`);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (!event.previousContainer || !event.container) {
      console.warn('Containers inválidos.');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  addTask(columnIndex: number) {
    const title = prompt('Digite o título da nova tarefa:');
    if (title) {
      this.columns[columnIndex].tasks.push({ id: this.taskIdCounter++, title });
    }
  }

  deleteTask(columnIndex: number, taskIndex: number) {
    this.columns[columnIndex].tasks.splice(taskIndex, 1);
  }

  addColumn() {
    const name = prompt('Digite o nome da nova coluna:');
    if (name) {
      this.columns.push({ id: this.columnIdCounter++, name, tasks: [] });
    }
  }

  deleteColumn(columnIndex: number) {
    if (confirm(`Tem certeza que deseja excluir a coluna "${this.columns[columnIndex].name}"?`)) {
      this.columns.splice(columnIndex, 1);
    }
  }
}
