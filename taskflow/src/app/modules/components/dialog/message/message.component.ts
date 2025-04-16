
import {Component, Inject} from '@angular/core';
import {MatSnackBarModule, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';


@Component({
  selector: 'app-message',
  imports: [MatSnackBarModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string) { }
  
}
