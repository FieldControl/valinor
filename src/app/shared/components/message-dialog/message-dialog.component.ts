import { Component } from '@angular/core';
import { MessageDialogService } from '@core/services/message-dialog.service';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
  constructor(public messageDialogService: MessageDialogService) {}
}
