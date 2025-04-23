// src/app/components/column/column.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Column } from '../../models/column.model';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [
    CommonModule, 
    CdkDropList,
    CdkDrag,
    TaskCardComponent
  ],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss']
})
export class ColumnComponent {
  @Input() column!: Column;
  @Input() boardId!: string; // Adicionado para facilitar chamadas à API
  @Input() connectedTo: string[] = [];
  @Output() taskDrop = new EventEmitter<CdkDragDrop<Task[]>>();

  constructor(private kanbanService: KanbanService) {}

  onTaskDrop(event: CdkDragDrop<Task[]>) {
    this.taskDrop.emit(event);
  }

  addTask(): void {
    const newTask: Partial<Task> = {
      title: 'Nova Tarefa',
      description: 'Descrição da tarefa',
      priority: 'medium'
    };
    
    this.kanbanService.createTask(this.boardId, this.column.id, newTask).subscribe({
      next: (task) => {
        this.column.tasks.push(task);
      },
      error: (error) => console.error('Erro ao criar tarefa:', error)
    });
  }

  updateColumnTitle(newTitle: string): void {
    if (newTitle.trim() && newTitle !== this.column.title) {
      this.kanbanService.updateColumn(this.boardId, this.column.id, { title: newTitle }).subscribe({
        error: (error) => console.error('Erro ao atualizar título da coluna:', error)
      });
    }
  }

  deleteColumn(): void {
    if (confirm(`Tem certeza que deseja excluir a coluna "${this.column.title}"?`)) {
      this.kanbanService.deleteColumn(this.boardId, this.column.id).subscribe({
        next: () => {
          // A atualização do UI deve ser tratada no componente pai (BoardComponent)
          // através de eventos ou gerenciamento de estado
        },
        error: (error) => console.error('Erro ao excluir coluna:', error)
      });
    }
  }
}