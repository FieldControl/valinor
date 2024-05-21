import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ColumnService } from '../../../services/column.service';
import { IColumn, ICreateColumn } from '../../../models/column';

@Component({
  selector: 'app-add-column',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-column.component.html',
  styleUrl: './add-column.component.css'
})
export class AddColumnComponent {  

  private formBuilder = inject(FormBuilder)
  private columnService = inject(ColumnService)
  private dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private boardId = this.data.boardId;

  addColumnFailed = false

  addColumnForm = this.formBuilder.group({
    name: this.formBuilder.control(this.data.column?.name, [Validators.required]),
  })

  createOrEditBoard() {
    if (this.addColumnForm.invalid) {
      return;
    }

    if (this.data.column?._id) {
      this.updateColumn();
    } else {
      this.createColumn();
    }
  }

  private createColumn() {
  if (this.addColumnForm.invalid) {
    this.addColumnFailed = true;
    return;
  }

  this.columnService.create({
    name: this.addColumnForm.value.name as string,
    board: this.boardId
    })
  .subscribe((column: IColumn) => {
    if (column) {
      console.log('Sucesso');
      this.dialogRef.close(column);
    }
  });
}

  private updateColumn() {
    if (this.addColumnForm.invalid) {
      this.addColumnFailed = true;
      return;
    }
  
    this.columnService.edit(this.data.column?._id, this.addColumnForm.value as ICreateColumn)
    .subscribe((column: IColumn) => {
        console.log('Sucesso');
        this.dialogRef.close(column)
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
