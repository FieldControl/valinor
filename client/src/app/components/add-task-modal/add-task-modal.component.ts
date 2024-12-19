import { Component, Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service'
import { CommonModule } from '@angular/common'
import { HomeComponent } from '../../pages/home/home.component';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [TaskService],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.css',
})
export class AddTaskModalComponent {
  @Input() taskColumns: { id: string; name: string }[] = []; 
  @Output() closeAddTaskEvent = new EventEmitter<void>();

  closeAddTaskModal() {
    this.closeAddTaskEvent.emit();
  }

    taskForm!: FormGroup;
  

    constructor(private taskService: TaskService) {
      this.taskForm = new FormGroup({
        taskName: new FormControl('', [Validators.required]),
        taskDescription: new FormControl(''),
        taskStatus: new FormControl('', [Validators.required]),
      });
    }

    hadError: boolean = false;
    isLoading: boolean = false;
  
    onSubmit() {
      if (this.taskForm.valid) {
        const { taskName, taskDescription, taskStatus } = this.taskForm.value;
  
        this.isLoading = true;
  
        this.taskService.createTask(taskName, taskDescription, taskStatus).subscribe({
          next: () => {
            this.isLoading = false;
            this.closeAddTaskModal();
          },
          error: () => {
            this.isLoading = false;
            this.hadError = true;
          },
        });
      }
    }
}
