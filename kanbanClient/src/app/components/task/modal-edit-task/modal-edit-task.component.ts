import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TaskModel } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { dateTodayOrAfterValidator } from '../../../validators/date.validator';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-modal-edit-task',
  standalone: true,
  imports: [MatSelectModule, MatOptionModule, MatInputModule, MatButtonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, FormsModule],
  templateUrl: './modal-edit-task.component.html',
  styleUrl: './modal-edit-task.component.css'
})
export class ModalEditTaskComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  taskModel:TaskModel = new TaskModel();
  datePipe: DatePipe = new DatePipe('en-US');
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public matDialogRef: MatDialogRef<ModalEditTaskComponent>, private fb: FormBuilder, private taskService: TaskService) {
    if (data) {
      this.taskModel = data;
    }
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      id: this.taskModel.id,
      title: [this.taskModel.title,Validators.required],
      description: [this.taskModel.description,Validators.required],
      status: this.taskModel.status,
      taskStatus: [this.taskModel.taskStatus, Validators.required],
      targetDate: [this.datePipe.transform(this.taskModel.targetDate, 'yyyy-MM-dd'), dateTodayOrAfterValidator()],
      laneId: this.taskModel.laneId
    });
  }
  closeModal() {
    this.matDialogRef.close();
  }
  submit() {
    if(this.form.valid){
      this.taskService.updateTask(this.form.value).subscribe((data) => {
        alert('task updated successfully');
        this.matDialogRef.close();
      });
    }
  }


}
