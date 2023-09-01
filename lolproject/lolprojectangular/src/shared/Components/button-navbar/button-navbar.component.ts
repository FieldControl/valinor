import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: '../button-navbar',
  templateUrl: '../button-navbar/button-navbar.component.html',
  styleUrls: ['../button-navbar/button-navbar.component.scss']
})
export class ButtonNavbar {
  @Input() hreflink !: string;
  @Input() iconOn !: boolean;
  @Input() icon !: string;
  @Input() type !: string;
  @Input() content !:string;
  constructor() {
  }
}
