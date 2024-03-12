import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ModalComponent } from '../modal/modal.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { Task } from '../../models/kanban.model';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
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
  editTitle = new FormControl('', { nonNullable: true });
  editDescription = new FormControl('', { nonNullable: true });
  inputTitle: boolean = false;
  inputDescription: boolean = false;
  openModal: boolean = false;

  constructor(private api: ApiService) {}

  editTitleTask(taskId: string) {
    const title = this.editTitle.value;
    console.log(title);
    this.api.updateTaskTitle(taskId, title).subscribe((res) => {
      console.log('Titulo task editado', res);
      this.inputTitle = !this.inputTitle;
      this.updateTask();
    });
  }

  editDescriptionTask(taskId: string) {
    const description = this.editDescription.value;
    this.api.updateTaskDescription(taskId, description).subscribe(() => {
      this.updateTask();
    });
  }

  deleteTask(taskId: string) {
    this.api.deleteTask(taskId).subscribe((res) => {
      console.log('Task deletada', res);
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
