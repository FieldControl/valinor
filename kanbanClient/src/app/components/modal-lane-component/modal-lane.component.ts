import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { LaneModel } from '../../models/lane.model';
import { LaneService } from '../../services/lane.service';
import { MatButtonModule } from '@angular/material/button';
import { BoardModel } from '../../models/board.model';

@Component({
  selector: 'app-modal-lane-component',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './modal-lane.component.html',
  styleUrl: './modal-lane.component.css'
})
export class ModalLaneComponentComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  laneModel: LaneModel = new LaneModel();
  board: BoardModel = new BoardModel();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ModalLaneComponentComponent>, private fb: FormBuilder, private laneService: LaneService) {
    this.board = data;
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.laneModel.name],
      order: [this.laneModel.order],
      status: 1,
      boardId: this.board.id
    });
  }
  submit() {
    if (this.form.valid) {
      this.laneService.createLane(this.form.value).subscribe((data) => {
        alert('lane created successfully');

        this.dialogRef.close();
      });
    }
  }
  closeModal() {
    this.dialogRef.close();
  }

}
