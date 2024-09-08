import { Component, EventEmitter, Output } from "@angular/core";
import { Card } from "../../cardInterface"; 
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from '@angular/material/card';
import { ColumnFormComponent } from "../columnForm/columnForm.component";
import { MatDialogRef } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "card-form",
  templateUrl: "./cardForm.component.html",
  styleUrl: "./cardForm.component.css",
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [{ provide: MatFormFieldControl, useExisting: ColumnFormComponent }]
})
export class CardFormComponent{
  formCard: FormGroup;
  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<CardFormComponent>) { 
    this.formCard = this.formBuilder.group({
      title: '',
      description:''
    });
  }
  createNewCard: boolean = false;
  handleAddCard() {
    this.dialogRef.close(this.formCard.value);
  }
}