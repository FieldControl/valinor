import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TaskComponent } from '../task/task.component';
import { CommonModule } from '@angular/common';
import { ColumnService } from '../../services/column.service';
import { TaskType } from '../../models/task-type.model';
import { ColumnType } from '../../models/column-type.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-column',
  imports: [TaskComponent, CommonModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
})
export class ColumnComponent {
  @Input() columnName: string = '';
  @Input() borderColor: string = '';
  @Input() id: string = '';
  @Input() columns: ColumnType[] = [];

  @Output() openModalEvent = new EventEmitter<void>();

  onOpenModal() {
    this.openModalEvent.emit();
  }

  tasks: TaskType[] = [];

  constructor(
    private columnService: ColumnService,
    private taskService: TaskService
  ) {}

  deleteColumn() {
    if (
      confirm(
        'Você tem certeza que deseja deletar esta coluna? As tarfas dentro dela também serão deletadas.'
      )
    ) {
      this.columnService.deleteColumn(this.id).subscribe({
        next: () => {
          console.log('Coluna deletada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao deletar a coluna:', error);
        },
      });
    }
  }

  ngOnInit() {
    this.taskService.getTaskByStatus(this.id).subscribe({
      next: (data: TaskType[]) => {
        this.tasks = data;
      },
      error: (error) => {
        console.error('Erro ao carregar as tarefas:', error);
      },
    });
  }
}
