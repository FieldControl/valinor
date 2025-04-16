import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-google-btn',
  imports: [],
  templateUrl: './google-btn.component.html',
  styleUrl: './google-btn.component.scss'
})
export class GoogleBtnComponent {
  @Input() public text: string | undefined;
  @Input() public click: (() => void) | undefined;

}
