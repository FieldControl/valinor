import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ColumnModel, KanbanService } from '../../../services/kanban.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update-column-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './update-column-dialog.html',
  styleUrl: './update-column-dialog.css',
})
export class UpdateColumnDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<UpdateColumnDialog>);
  private formBuilder = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA) as { column: ColumnModel };

  ngOnInit(): void {
    this.columnForm.patchValue({
      name: this.data.column.name,
    });
  }

  columnForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.columnForm.valid) {
      this.dialogRef.close({ id: this.data.column.id, ...this.columnForm.value });
    }
  }
}
