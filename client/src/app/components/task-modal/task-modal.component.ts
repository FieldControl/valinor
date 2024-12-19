import { Component, Output, EventEmitter, Input } from '@angular/core';
import { SubtaskComponent } from '../subtask/subtask.component';
import { CommonModule } from '@angular/common';
import { SubtaskService } from '../../services/subtask.service';
import { SubtaskType } from '../../models/subtask-type.model';
import { ColumnType } from '../../models/column-type.model';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-modal',
  imports: [SubtaskComponent, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [SubtaskService],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css',
})
export class TaskModalComponent {
  @Input() name: string = '';
  @Input() description: string = '';
  @Input() status: string = '';
  @Input() color: string = '';
  @Input() id: string = '';
  @Input() columnId: string = '';
  @Input() columns: ColumnType[] = [];
  @Input() subtasks: SubtaskType[] = [];

  @Output() closeTaskEvent = new EventEmitter<void>();

  get filteredColumns() {
    return this.columns.filter((column) => column.id !== this.columnId);
  }

  closeModal() {
    this.closeTaskEvent.emit();
  }

  isEditingName: boolean = false;
  editTaskName() {
    this.isEditingName = true;
    this.isEditingDescription = false;
  }

  cancelEdit() {
    this.isEditingName = false;
    this.isEditingDescription = false;
    this.newName = '';
    this.newDescription = '';
  }

  isEditingDescription: boolean = false;
  editTaskDescription() {
    this.newDescription = '';
    this.isEditingDescription = true;
    this.isEditingName = false;
  }

  dropdownOpen = false;
  toggleDropdown(state: boolean) {
    this.dropdownOpen = state;
  }

  subtaskForm!: FormGroup;

  constructor(
    private taskService: TaskService,
    private subtaskService: SubtaskService
  ) {
    this.subtaskForm = new FormGroup({
      subtaskName: new FormControl('', [Validators.required]),
    });
  }

  hadError: boolean = false;
  isLoading: boolean = false;

  onSubmit() {
    if (this.subtaskForm.valid) {
      this.isLoading = true;
      const name = this.subtaskForm.value.subtaskName;

      this.subtaskService.createSubtask(name, this.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.subtaskForm.get('subtaskName')?.reset();
        },
        error: () => {
          this.hadError = true;
          this.isLoading = false;
        },
      });
    }
  }

  // Função chamada ao clicar no botão de atualizar
  newName: string = this.name;
  updateName() {
    if (this.newName.trim()) {
      this.taskService
        .updateName(this.id, this.newName.trim(), this.columnId)
        .subscribe({
          next: () => {
            console.log('Tarefa atualizada com sucesso!');
            this.isEditingName = false;
          },
          error: (err) => {
            console.error('Erro ao atualizar a tarefa:', err);
          },
        });
    }
  }

  updateStatus(column: any) {
    this.taskService.updateStatus(this.id, column.id, this.columnId).subscribe({
      next: () => {
        console.log('Tarefa atualizada');
      },
      error: () => {
        console.log('Erro ao atualizar tarefa');
      },
    });
  }

  newDescription: string = this.description;
  updateDescription() {
    this.taskService
      .updateDescription(this.id, this.newDescription, this.columnId)
      .subscribe({
        next: () => {
          console.log('Tarefa atualizada com sucesso!');
          this.isEditingDescription = false;
        },
        error: (err) => {
          console.error('Erro ao atualizar a tarefa:', err);
        },
      });
  }

  deleteTask() {
    if (
      confirm(
        'Você tem certeza que deseja deletar esta tarefa? As subtarefas dentro dela também serão deletadas.'
      )
    ) {
      this.taskService.deleteTask(this.id, this.columnId).subscribe({
        next: () => {
          console.log('Tarefa deletada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao deletar a Tarefa:', error);
        },
      });
    }
  }
}
