import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TaskModel } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { LaneModel } from '../../../models/lane.model';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Title } from '@angular/platform-browser';
import { dateTodayOrAfterValidator } from '../../../validators/date.validator';

@Component({
  selector: 'app-modal-add-task',
  standalone: true,
  imports: [MatInputModule, MatButtonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, FormsModule, MatLabel],
  templateUrl: './modal-add-task.component.html',
  styleUrl: './modal-add-task.component.css'
})
export class ModalAddTaskComponent {

  form: FormGroup = new FormGroup({});
  taskModel: TaskModel = new TaskModel();
  laneModel: LaneModel = new LaneModel();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public matDialogRef: MatDialogRef<ModalAddTaskComponent>, private fb: FormBuilder, private taskService: TaskService) {
    if (data) {
      this.laneModel = data;
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.taskModel.title, Validators.required],
      description: [this.taskModel.description, Validators.required],
      status: 1,
      taskStatus: 1,
      targetDate: [this.taskModel.targetDate, dateTodayOrAfterValidator()],
      laneId: this.laneModel.id
    });
  }

  closeModal() {
    this.matDialogRef.close();
  }
  submit() {
    if (this.form.valid) {
      this.taskService.createTask(this.form.value).subscribe((data) => {
        alert('task created successfully');
        this.matDialogRef.close();
      });
    }
  }
}
