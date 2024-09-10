import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';

import { Task } from '../../types/task.interface';
import { TasksService } from '../../services/tasks.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent implements OnInit {
  @Input() task!: Task;
  formGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private tasksService: TasksService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      title: this.task.title,
      description: this.task.description,
    });
  }

  formatDate(date: string): string {
    return moment(date).format('d/MM/YY h:mm:ss a');
  }

  updateTask(): void {
    this.tasksService.updateTask(this.task.id, {
      title: this.formGroup.value.title,
      description: this.formGroup.value.description,
    });
  }

  deleteTask(): void {
    this.tasksService.deleteTask(this.task.id);
  }
}
