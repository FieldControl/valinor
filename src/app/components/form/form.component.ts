import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { v4 as uuidv4 } from 'uuid';
import { MatDialogRef } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})

export class FormComponent {
  form: FormGroup
  allTasks: Task[] = []

  constructor(
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    private fb: FormBuilder, private taskService: TaskService){
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      status: ['ToDo', Validators.required],
    });
  }

  addTask(): void {
    if(this.form.valid){
      const newTask: Task = {
        id: uuidv4(),
        name: this.form.value.name,
        description: this.form.value.description,
        status: this.form.value.status,
      }
      this.taskService.addTask(newTask)
      this.dialogRef.close(newTask);
      this.form.reset()
    }
  }
}
