import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { Task } from '../../models/kanban.model';
import { ApiService } from '../../services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, MatIconModule, ReactiveFormsModule, CommonModule, CdkDrag],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() updateTasks = new EventEmitter<void>();
  editTitle = new FormControl('', { nonNullable: true, validators: Validators.required });
  editDescription = new FormControl('', { nonNullable: true, validators: Validators.required });
  inputTitle: boolean = false;
  inputDescription: boolean = false;
  openModal: boolean = false;

  constructor(private api: ApiService) {}

  editTitleTask(taskId: string) {
    const title = this.editTitle.value;
    const validation = this.editTitle.valid;

    if (!validation) {
      return alert('Preenchimento do campo obrigatório');
    }

    this.api.updateTaskTitle(taskId, title).subscribe(() => {
      this.inputTitle = !this.inputTitle;
      this.updateTask();
    });
  }

  editDescriptionTask(taskId: string) {
    const description = this.editDescription.value;
    const validation = this.editDescription.valid;

    if (!validation) {
      return alert('Preenchimento do campo obrigatório');
    }

    this.api.updateTaskDescription(taskId, description).subscribe(() => {
      this.inputDescription = !this.inputDescription;
      this.updateTask();
    });
  }

  deleteTask(taskId: string) {
    this.api.deleteTask(taskId).subscribe(() => {
      this.updateTask();
    });
    this.openCloseModal();
  }

  openCloseModal() {
    this.openModal = !this.openModal;
  }

  showInputTitle() {
    this.inputTitle = !this.inputTitle;
  }

  showInputDescription() {
    this.inputDescription = !this.inputDescription;
  }

  updateTask() {
    this.updateTasks.emit();
  }
}
