import { Component, Input } from '@angular/core';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { CommonModule } from '@angular/common';
import { SubtaskType } from '../../models/subtask-type.model';
import { SubtaskService } from '../../services/subtask.service';
import { ColumnType } from '../../models/column-type.model';

@Component({
  selector: 'app-task',
  imports: [TaskModalComponent, CommonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {
  @Input() name: string = '';
  @Input() description: string = '';
  @Input() status: string = '';
  @Input() color: string = '';
  @Input() id: string = '';
  @Input() columnId: string = ""
  @Input() columns: ColumnType[] = [];

  isTaskModalOpen: boolean = false;

  openModal() {
    this.isTaskModalOpen = true;
  }

  closeModal() {
    this.isTaskModalOpen = false;
  }

  subtasks: SubtaskType[] = [];

  counts: { completed: number; total: number } = { completed: 0, total: 0 };

  constructor(private subtaskService: SubtaskService) {}

  ngOnInit() {
    this.subtaskService.getSubtasksByTask(this.id).subscribe({
      next: (data: SubtaskType[]) => {
        this.subtasks = data;

        this.counts = this.subtasks.reduce(
          (acc, subtask) => {
            if (subtask.isCompleted) {
              acc.completed += 1;
            }
              acc.total += 1 
            return acc;
          },
          { completed: 0, total: 0 }
        );
      },
      error: (error) => {
        console.log('Erro ao carregar as subtarefas', error);
      },
    });
  }
}
