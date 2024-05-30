import { Component } from '@angular/core';
import { FormCardComponent } from '../form-card/form-card.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-create-card',
  standalone: true,
  imports: [FormCardComponent],
  templateUrl: './create-card.component.html',
  styleUrl: './create-card.component.scss'
})
export class CreateCardComponent {
  constructor(public dialog: MatDialog) { }

  openForm(): void {
    const dialogRef = this.dialog.open(FormCardComponent, {
      width: '250px'
    });
  }
}


