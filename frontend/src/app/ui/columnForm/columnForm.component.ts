import { Component, EventEmitter, Output } from "@angular/core";
import { Card } from "../../cardInterface"; 
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "column-form",
  templateUrl: "./columnForm.component.html",
  styleUrl: "./columnForm.component.css",
  standalone: true,
  imports: [
    MatFormFieldModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  providers: [{ provide: MatFormFieldControl, useExisting: ColumnFormComponent }]
})
export class ColumnFormComponent{
  formColumn: FormGroup;
  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<ColumnFormComponent>) {
    this.formColumn = this.formBuilder.group({
      title: '',
    });
  }
  @Output() column = new EventEmitter<string>();

  handleAddColumn() {
    this.dialogRef.close(this.formColumn.value);
  }
}