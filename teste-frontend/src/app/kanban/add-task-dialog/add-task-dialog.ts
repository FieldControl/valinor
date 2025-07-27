import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Add New Task</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" style="width:100%;">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="name" />
      </mat-form-field>

      <mat-form-field appearance="fill" style="width:100%;">
        <mat-label>Description</mat-label>
        <input matInput [(ngModel)]="desc" />
      </mat-form-field>

      <mat-form-field appearance="fill" style="width:100%;">
        <mat-label>Step</mat-label>
        <mat-select [(value)]="step">
          <mat-option *ngFor="let s of steps; index as i" [value]="i">{{ s }}</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onAdd()" [disabled]="!name || !desc">Add</button>
    </mat-dialog-actions>
  `,
})

export class AddTaskDialog {
  name = '';
  desc = '';
  step = 0;

  steps = ['To Do', 'Work in Progress', 'Done'];

  constructor(public dialogRef: MatDialogRef<AddTaskDialog>) {}

  onCancel() {
    this.dialogRef.close();
  }

  onAdd() {
    this.dialogRef.close({ name: this.name, desc: this.desc, step: this.step });
  }
}
