import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  title: any;
  description: any;

  constructor(public dialogRef: MatDialogRef<KanbanComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close();
  }

  create() {
    this.dialogRef.close({title: this.title, description: this.description});
  }
}