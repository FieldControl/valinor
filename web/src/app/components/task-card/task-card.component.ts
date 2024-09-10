import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Task } from '../../types/task.interface';
import { TasksService } from '../../services/tasks.service';

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
