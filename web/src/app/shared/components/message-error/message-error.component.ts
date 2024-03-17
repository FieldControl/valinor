import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message-error',
  templateUrl: './message-error.component.html',
  styleUrls: ['./message-error.component.scss'],
})
export class MessageErrorComponent {
  @Input('text') text: string = '';
  @Input() isError: boolean = false;
}
