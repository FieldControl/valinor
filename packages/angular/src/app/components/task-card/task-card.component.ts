import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ModalComponent } from '../modal/modal.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { Task } from '../../models/kanban.model';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, MatIconModule, ReactiveFormsModule, CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  @Input() task!: Task;
  editTitle = new FormControl('');
  editDescription = new FormControl('');
  inputTitle: boolean = false;
  inputDescription: boolean = false;
  modal: boolean = false;

  constructor(private api: ApiService) {}

  editTitleTask(taskId: string) {
    const title = this.editTitle.value;
    console.log(title);
    this.api.updateTaskTitle(taskId, title).subscribe((res) => {
      console.log('Titulo task editado', res);
    });
  }

  editDescriptionTask(taskId: string) {
    const description = this.editDescription.value;
    this.api.updateTaskDescription(taskId, description).subscribe((res) => {
      console.log('Titulo task editado', res);
    });
  }

  deleteTask(taskId: string) {
    this.api.deleteTask(taskId).subscribe((res) => {
      console.log('task deletada', res);
    });
    this.openCloseModal();
  }

  archiveTask(taskId: string) {
    this.api.archiveTask(taskId).subscribe((res) => {
      console.log('task arquivada', res);
    });
    this.openCloseModal();
  }

  openCloseModal() {
    this.modal = !this.modal;
  }

  showInputTitle() {
    this.inputTitle = !this.inputTitle;
  }

  showInputDescription() {
    this.inputDescription = !this.inputDescription;
  }
}
